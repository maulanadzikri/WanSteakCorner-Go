package models

type MidtransNotificationInput struct {
	TransactionStatus string `json:"transaction_status"`
	OrderID           string `json:"order_id"`
	FraudStatus       string `json:"fraud_status"`
}
