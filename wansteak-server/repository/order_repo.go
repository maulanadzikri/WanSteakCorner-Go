package repository

import (
	"wansteak-server/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	Save(order models.Order) error
	UpdateStatus(orderId string, status string) error
	FindByID(orderId string) (models.Order, error)
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

func (r *orderRepo) FindByID(id string) (models.Order, error) {
	var order models.Order

	err := r.db.Preload("Items").First(&order, "id = ?", id).Error
	return order, err
}