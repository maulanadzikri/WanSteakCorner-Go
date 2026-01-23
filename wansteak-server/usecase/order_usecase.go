package usecase

import (
	"fmt"
	"os"
	"strconv"
	"time"
	"wansteak-server/models"
	"wansteak-server/repository"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type OrderUsecase interface {
	PlaceOrder(input models.CreateOrderInput) (models.Order, error)
	PaymentNotification(input models.MidtransNotificationInput) error
}

type orderUsecase struct {
	menuRepo repository.MenuRepository
	ordeRepo repository.OrderRepository
}

func NewOrderUsecase(m repository.MenuRepository, o repository.OrderRepository) OrderUsecase {
	return &orderUsecase{menuRepo: m, ordeRepo: o}
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
		Status:    "pending",
		SnapURL:   midtransResp.RedirectURL,
		SnapToken: midtransResp.Token,
		Items:     orderItems,
	}

	if err := u.ordeRepo.Save(newOrder); err != nil {
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
	}
	resp, err := s.CreateTransaction(req)
	if err != nil {
		return nil, err
	}

	return resp, nil
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
			newStatus = "paid"
		}
	} else if transactionStatus == "settlement" {
		newStatus = "paid"
	} else if transactionStatus == "deny" || transactionStatus == "expire" || transactionStatus == "cancel" {
		newStatus = "cancelled"
	} else if transactionStatus == "pending" {
		newStatus = "pending"
	}

	return u.ordeRepo.UpdateStatus(orderID, newStatus)
}
