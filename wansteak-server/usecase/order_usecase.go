package usecase

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"strconv"
	"time"
	"wansteak-server/models"
	"wansteak-server/repository"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
	"github.com/midtrans/midtrans-go/snap"
)

type OrderUsecase interface {
	PlaceOrder(input models.CreateOrderInput) (models.Order, error)
	PaymentNotification(input models.MidtransNotificationInput) error
	GetAllOrders(page, limit int, status string, excludeStatuses []string) ([]models.Order, map[string]interface{}, error)
	GetOrder(orderId string) (models.Order, error)
	UpdateOrderStatus(orderId, newStatus string) error
	CancelOrder(orderId string) error
	GetDashboardStats() (models.DashboardStats, error)
}

type orderUsecase struct {
	menuRepo  repository.MenuRepository
	orderRepo repository.OrderRepository
}

type MidtransStatusResponse struct {
	StatusCode        string `json:"status_code"`
	StatusMessage     string `json:"status_message"`
	TransactionStatus string `json:"transaction_status`
	FraudStatus       string `json:"fraud_status`
}

func NewOrderUsecase(m repository.MenuRepository, o repository.OrderRepository) OrderUsecase {
	return &orderUsecase{menuRepo: m, orderRepo: o}
}

func (u *orderUsecase) PlaceOrder(input models.CreateOrderInput) (models.Order, error) {
	var totalAmount float64
	var orderItems []models.OrderItem

	orderID := fmt.Sprintf("WS-%d", time.Now().Unix())

	for _, item := range input.Items {
		menu, err := u.menuRepo.FindByID(item.MenuID)
		if err != nil {
			return models.Order{}, fmt.Errorf("menu dengan id %d tidak ditemukan", item.MenuID)
		}

		subTotal := menu.Price * float64(item.Quantity)
		totalAmount += subTotal

		orderItems = append(orderItems, models.OrderItem{
			OrderID:  orderID,
			MenuID:   menu.ID,
			MenuName: menu.Name,
			Price:    menu.Price,
			Quantity: item.Quantity,
			SubTotal: subTotal,
		})
	}

	midtransResp, err := u.createMidtransTransaction(orderID, int64(totalAmount), orderItems)
	if err != nil {
		return models.Order{}, err
	}

	newOrder := models.Order{
		ID:        orderID,
		Customer:  input.CustomerName,
		Total:     totalAmount,
		Status:    models.OrderStatusPending,
		SnapURL:   midtransResp.RedirectURL,
		SnapToken: midtransResp.Token,
		Items:     orderItems,
	}

	if err := u.orderRepo.Save(newOrder); err != nil {
		return models.Order{}, err
	}

	return newOrder, nil
}

func (u *orderUsecase) createMidtransTransaction(orderID string, grossAmount int64, items []models.OrderItem) (*snap.Response, error) {
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")

	if serverKey == "" {
		return nil, fmt.Errorf("midtrans server key is missing in .env")
	}

	s := snap.Client{}
	s.New(serverKey, midtrans.Sandbox)

	var midtransItems []midtrans.ItemDetails
	for _, item := range items {
		midtransItems = append(midtransItems, midtrans.ItemDetails{
			ID:    strconv.Itoa(int(item.MenuID)),
			Name:  item.MenuName,
			Price: int64(item.Price),
			Qty:   int32(item.Quantity),
		})
	}

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  orderID,
			GrossAmt: grossAmount,
		},
		Items: &midtransItems,
		EnabledPayments: []snap.SnapPaymentType{
			snap.PaymentTypeBCAVA,
			snap.PaymentTypeBNIVA,
			snap.PaymentTypeGopay,
			snap.PaymentTypeShopeepay,
			snap.SnapPaymentType("other_qris"),
			snap.SnapPaymentType("dana"),
		},
		Expiry: &snap.ExpiryDetails{
			Unit:     "minutes",
			Duration: 30,
		},
	}
	snapResp, err := s.CreateTransaction(req)
	if err != nil {
		return nil, err
	}

	return snapResp, nil
}

func (u *orderUsecase) PaymentNotification(input models.MidtransNotificationInput) error {
	orderID := input.OrderID
	transactionStatus := input.TransactionStatus
	fraudStatus := input.FraudStatus

	var newStatus string

	if transactionStatus == "capture" {
		if fraudStatus == "challenge" {
			newStatus = "challenge"
		} else if fraudStatus == "accept" {
			newStatus = models.OrderStatusPaid
		}
	} else if transactionStatus == "settlement" {
		newStatus = models.OrderStatusPaid
	} else if transactionStatus == "expire" {
		newStatus = "expired"
	} else if transactionStatus == "deny" || transactionStatus == "cancel" {
		newStatus = models.OrderStatusCancelled
	} else if transactionStatus == models.OrderStatusPending {
		newStatus = models.OrderStatusPending
	}

	return u.orderRepo.UpdateStatus(orderID, newStatus)
}

func (u *orderUsecase) GetAllOrders(page int, limit int, status string, excludeStatuses []string) ([]models.Order, map[string]interface{}, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	orders, total, err := u.orderRepo.FindAll(limit, offset, status, excludeStatuses)
	if err != nil {
		return nil, nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	// Construct meta response
	meta := map[string]interface{}{
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	}

	return orders, meta, nil
}

func (u *orderUsecase) GetOrder(orderId string) (models.Order, error) {
	order, err := u.orderRepo.FindByID(orderId)
	if err != nil {
		return order, err
	}

	// AUTO-SYNC ORDER STATUS LOGIC
	if order.Status == models.OrderStatusPending {
		log.Printf("[AUTO-SYNC] Mengecek status Midtrans untuk Order ID: %s", orderId)

		midtransStatus, err := u.checkMidtransStatus(order)
		if err != nil {
			log.Printf("[AUTO-SYNC ERROR] Gagal cek status untuk %s: %v", orderId, err)
		} else {
			log.Printf("[AUTO-SYNC SUCCESS] Status dari Midtrans untuk %s adalah: '%s'", orderId, midtransStatus)
		}

		// if the check is successful and the status has CHANGED (not pending anymore)
		if err == nil && midtransStatus != "" && midtransStatus != models.OrderStatusPending {
			u.orderRepo.UpdateStatus(orderId, midtransStatus) // update order status in local database
			order.Status = midtransStatus                     //
		}
	}

	return order, nil
}

func (u *orderUsecase) UpdateOrderStatus(orderId, newStatus string) error {
	return u.orderRepo.UpdateStatus(orderId, newStatus)
}

func (u *orderUsecase) CancelOrder(orderId string) error {
	order, err := u.orderRepo.FindByID(orderId)
	if err != nil {
		return err
	}
	if order.Status != models.OrderStatusPending {
		return fmt.Errorf("hanya pesanan pending yang bisa dibatalkan.")
	}

	var client coreapi.Client
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	client.New(serverKey, midtrans.Sandbox)

	cancelResp, midErr := client.CancelTransaction((orderId))
	if midErr != nil {
		log.Printf("[WARNING] Gagal cancel di Midtrans (mungkin belum aktif): %v", midErr)
	} else {
		log.Printf("[INFO] Berhasil cancel di Midtrans: %s", cancelResp.StatusMessage)
	}

	err = u.orderRepo.UpdateStatus(orderId, models.OrderStatusCancelled)
	return err
}

func (u *orderUsecase) checkMidtransStatus(order models.Order) (string, error) {
	orderId := order.ID
	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	if serverKey == "" {
		return "", fmt.Errorf("MIDTRANS_SERVER_KEY kosong")
	}

	url := "https://api.sandbox.midtrans.com/v2/" + orderId + "/status"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("gagal membuat HTTP request: %v", err)
	}

	authString := base64.StdEncoding.EncodeToString([]byte(serverKey + ":"))
	req.Header.Add("Authorization", "Basic "+authString)
	req.Header.Add("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("gagal menembak API Midtrans: %v", err)
	}
	defer resp.Body.Close()

	// Baca body dari response
	bodyBytes, _ := io.ReadAll(resp.Body)

	// Pastikan status HTTP tidak bernilai 401 Unauthorized, dsb
	if resp.StatusCode != http.StatusOK && resp.StatusCode != 404 {
		return "", fmt.Errorf("HTTP status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var res MidtransStatusResponse
	if err := json.Unmarshal(bodyBytes, &res); err != nil {
		return "", fmt.Errorf("gagal decode JSON Midtrans: %v", err)
	}

	// INFO FOR DEBUGGING
	// log.Println("==================================================")
	// log.Printf("[AUTO-SYNC DEBUG] Mengecek Order ID: %s", orderId)
	// log.Printf("[AUTO-SYNC DEBUG] RAW JSON: %s", string(bodyBytes))
	// log.Printf("[AUTO-SYNC DEBUG] Extracted Transaction Status: '%s'", res.TransactionStatus)
	// log.Printf("[AUTO-SYNC DEBUG] Extracted Status Code: '%s'", res.StatusCode)
	// log.Println("==================================================")

	// TANGANI KASUS "TRANSACTION DOESN'T EXIST" (Status Code 404 di dalam JSON Midtrans)
	if res.StatusCode == "404" {
		duration := time.Since(order.CreatedAt).Minutes()

		if duration > 31 {
			log.Printf("[INFO] Transaksi %s (404) berumur %.2f jam. Otomatis EXPIRED.", orderId, duration)
			return "expired", nil
		}

		log.Printf("[INFO] Transaksi %s belum aktif di Midtrans (menunggu pembayaran). Dianggap PENDING.", orderId)
		return models.OrderStatusPending, nil
	}

	// MAPPING STATUS SEPERTI BIASA
	var newStatus string
	if res.TransactionStatus == "capture" || res.TransactionStatus == "settlement" {
		newStatus = models.OrderStatusPaid
	} else if res.TransactionStatus == "expire" {
		newStatus = "expired"
	} else if res.TransactionStatus == "cancel" || res.TransactionStatus == "deny" {
		newStatus = models.OrderStatusCancelled
	} else if res.TransactionStatus == models.OrderStatusPending {
		newStatus = models.OrderStatusPending
	} else {
		return "", fmt.Errorf("status tidak dikenali: %s", res.TransactionStatus)
	}

	return newStatus, nil
}

func (u *orderUsecase) GetDashboardStats() (models.DashboardStats, error) {
	stats, err := u.orderRepo.GetDashboardStats()
	if err != nil {
		return stats, err
	}

	return stats, nil
}
