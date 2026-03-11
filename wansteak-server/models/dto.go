package models

type LoginInput struct {
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterInput struct {
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type CreateOrderInput struct {
	CustomerName string `json:"customer_name" binding:"required"`
	Items []struct {
		MenuID uint `json:"menu_id" binding:"required"` 
		Quantity int `json:"quantity" binding:"required,min=1"`
	} `json:"items" binding:"required,dive"`
}

type MidtransNotificationInput struct {
	TransactionStatus string `json:"transaction_status"`
	OrderID           string `json:"order_id"`
	FraudStatus       string `json:"fraud_status"`
}
