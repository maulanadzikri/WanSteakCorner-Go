package repository

import (
	"wansteak-server/models"

	"gorm.io/gorm"
)

type OrderRepository interface {
	Save(order models.Order) error
	UpdateStatus(orderId string, newStatus string) error
	FindAll(limit, offset int, status string, excludeStatuses []string) ([]models.Order, int64, error)
	FindByID(orderId string) (models.Order, error)
	GetDashboardStats() (models.DashboardStats, error)
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

func (r *orderRepo) FindAll(limit int, offset int, status string, excludeStatuses []string) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	query := r.db.Model(&models.Order{})
	
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if len(excludeStatuses) > 0 {
		query = query.Where("status NOT IN ?", excludeStatuses)
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

func (r *orderRepo) GetDashboardStats() (models.DashboardStats, error) {
	var stats models.DashboardStats

	// Total Orders
	r.db.Model(&models.Order{}).Count(&stats.TotalOrders)
	// Total Completed Orders
	r.db.Model(&models.Order{}).Where("status = ?", models.OrderStatusCompleted).Count(&stats.CompletedOrders)
	// Total Cancelled Orders
	r.db.Model(&models.Order{}).Where("status = ?", models.OrderStatusCancelled).Count(&stats.CancelledOrders)
	
	// Total Revenue (only 'completed' orders)
	r.db.Model(&models.Order{}).
		Where("status = ?", models.OrderStatusCompleted).
		Select("COALESCE(SUM(total), 0)").
		Scan(&stats.TotalRevenue)
		
	// Today Revenue 
	r.db.Model(&models.Order{}).
		Where("status = ? AND DATE(created_at) = CURRENT_DATE", models.OrderStatusCompleted).
		Select("COALESCE(SUM(total), 0)").
		Scan(&stats.TodayRevenue)

	// Total Menus Active
	r.db.Model(&models.Menu{}).Count(&stats.TotalMenus)

	return stats, nil
}
