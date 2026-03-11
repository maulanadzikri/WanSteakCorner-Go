package models

type DashboardStats struct {
	TotalRevenue int64 `json:"total_revenue"`
	TodayRevenue int64 `json:"today_revenue"`
	TotalOrders int64 `json:"total_orders"`
	CompletedOrders int64 `json:"completed_orders"`
	CancelledOrders int64 `json:"cancelled_orders"`
	TotalMenus int64 `json:"total_menus"`
}