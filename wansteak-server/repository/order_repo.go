package repository

import (
	"wansteak-server/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	Save(order models.Order) error
	UpdateStatus(orderId string, newStatus string) error
	FindAll(limit, offset int, status string) ([]models.Order, int64, error)
	FindByID(orderId string) (models.Order, error)
}

type orderRepo struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepo{db}
}

func (r *orderRepo) Save(order models.Order) error {
	return r.db.Create(&order).Error
}

func (r *orderRepo) UpdateStatus(orderId string, newStatus string) error {
	return r.db.Model(&models.Order{}).Where("id = ?", orderId).Update("status", newStatus).Error
}

func (r *orderRepo) FindAll(limit int, offset int, status string) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	query := r.db.Model(&models.Order{})
	
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Mengambil semua order, diurutkan dari yang terbaru (created_at desc) dengan limit dan offset
	err := query.Preload("Items").Order("created_at desc").Limit(limit).Offset(offset).Find(&orders).Error
	if err != nil {
		return nil, 0, err
	}
	
	return orders, total, err
}

func (r *orderRepo) FindByID(id string) (models.Order, error) {
	var order models.Order

	err := r.db.Preload("Items").First(&order, "id = ?", id).Error
	return order, err
}
