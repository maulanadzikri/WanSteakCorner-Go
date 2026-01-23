package repository

import (
	"wansteak-server/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	Save(order models.Order) error
	UpdateStatus(orderId string, status string) error
}

type orderRepo struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepo{db}
}

func (r *orderRepo) Save(order models.Order) error{
	return r.db.Create(&order).Error
}

func (r *orderRepo) UpdateStatus(orderId string, status string) error{
	return r.db.Model(&models.Order{}).Where("id = ?", orderId).Update("status", status).Error
}
