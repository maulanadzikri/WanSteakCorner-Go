package models

import (
	"time"

	"gorm.io/gorm"
)

var DB *gorm.DB

type User struct {
	ID uint `json:"id" gorm:"primaryKey"`
	Email string `json:"email" gorm:"unique"`
	Password string `json:"password"`
	Role string `json:"role"`
}

type LoginInput struct {
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterInput struct {
	Email string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}
type Menu struct {
	ID    uint    `json:"id" gorm:"primaryKey"`
	Name  string  `json:"name"`
	Image string  `json:"image"`
	Price float64 `json:"price"`
	Stok  string  `json:"stok"`
}

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
	ID uint `json:"id" gorm:"primaryKey"`
	OrderID string `json:"order_id"`
	MenuID uint `json:"menu_id"`
	MenuName string `json:"menu_name"`
	Price float64 `json:"price"`
	Quantity int `json:"quantity"`
	SubTotal float64 `json:"sub_total"`
}

type CreateOrderInput struct {
	CustomerName string `json:"customer_name" binding:"required"`
	Items []struct {
		MenuID uint `json:"menu_id" binding:"required"` 
		Quantity int `json:"quantity" binding:"required,min=1"`
	} `json:"items" binding:"required,dive"`
}
