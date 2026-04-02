package models

type Menu struct {
	ID    uint    `json:"id" gorm:"primaryKey"`
	Name  string  `json:"name"`
	Image string  `json:"image"`
	Price float64 `json:"price"`
	Stok  string  `json:"stok"`
	Category string `gorm:"type:varchar(50);default:'Makanan Utama'" json:"category" form:"category"`
}