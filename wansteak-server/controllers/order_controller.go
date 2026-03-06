package controllers

import (
	"net/http"
	"wansteak-server/models"
	"wansteak-server/usecase"

	"github.com/gin-gonic/gin"
)

type OrderController struct {
	orderUsecase usecase.OrderUsecase
}

func NewOrderController(u usecase.OrderUsecase) *OrderController {
	return &OrderController{orderUsecase: u}
}

func (c *OrderController) Create(ctx *gin.Context) {
	var input models.CreateOrderInput

	if err := ctx.ShouldBindJSON(&input); err != nil{
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createOrder, err := c.orderUsecase.PlaceOrder(input)
	if err != nil{
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Order created",
		"data": createOrder,
	})
}

func (c *OrderController) HandleWebhook(ctx *gin.Context){
	var input models.MidtransNotificationInput

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := c.orderUsecase.PaymentNotification(input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process notification"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Notification received"})
}

func (c *OrderController) GetAllOrders(ctx *gin.Context){
	orders, err := c.orderUsecase.GetAllOrders()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pesanan"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": orders})
}

func (c *OrderController) UpdateOrderStatus(ctx *gin.Context){
	orderId := ctx.Param("id")

	var input struct {
		Status string `json:"status"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "format data tidak valid"})
		return
	}

	err := c.orderUsecase.UpdateOrderStatus(orderId, input.Status)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status pesanan"})
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Berhasil memperbarui status pesanan"})
}

func (c *OrderController) GetOrder(ctx *gin.Context){
	id := ctx.Param("id")
	order, err := c.orderUsecase.GetOrder(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return 
	}

	ctx.JSON(http.StatusOK, gin.H{"data": order})
}

func (c *OrderController) CancelOrder(ctx *gin.Context){
	orderID := ctx.Param("id")

	err := c.orderUsecase.CancelOrder(orderID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil dibatalkan."})
}
