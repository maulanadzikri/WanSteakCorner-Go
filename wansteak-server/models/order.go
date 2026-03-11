package models

import "time"

const (
	OrderStatusPending    = "pending"
	OrderStatusPaid       = "paid"
	OrderStatusProcessing = "processing"
	OrderStatusCompleted  = "completed"
	OrderStatusCancelled  = "cancelled"
	OrderStatusExpired    = "expired"
)

type Order struct {
	ID        string      `json:"id" gorm:"primaryKey"`
	Customer  string      `json:"customer_name"`
	Total     float64     `json:"total"`
	Status    string      `json:"status"`
	SnapURL   string      `json:"snap_url"`
	SnapToken string      `json:"snap_token"`
	Items     []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
	CreatedAt time.Time   `json:"created_at"`
}

type OrderItem struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	OrderID  string  `json:"order_id"`
	MenuID   uint    `json:"menu_id"`
	MenuName string  `json:"menu_name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
	SubTotal float64 `json:"sub_total"`
}
