package repository

import (
	"wansteak-server/models"

	"gorm.io/gorm"
)

type MenuRepository interface {
	FindAll() ([]models.Menu, error)
	FindByID(id uint) (models.Menu, error)
	Save(menu models.Menu) (models.Menu, error)
	Update(menu models.Menu) (models.Menu, error)
	Delete(id uint) error
}

type menuRepo struct {
	db *gorm.DB
}

func NewMenuRepository(db *gorm.DB) MenuRepository {
	return &menuRepo{db}
}

func (r *menuRepo) FindAll() ([]models.Menu, error) {
	var menus []models.Menu
	err := r.db.Find(&menus).Error
	return menus, err
}

func (r *menuRepo) FindByID(id uint) (models.Menu, error) {
	var menu models.Menu
	err := r.db.First(&menu, id).Error
	return menu, err
}

func (r *menuRepo) Save(menu models.Menu) (models.Menu, error) {
	err := r.db.Create(&menu).Error
	return menu, err
}

func (r *menuRepo) Update(menu models.Menu) (models.Menu, error) {
	err := r.db.Save(&menu).Error
	return menu, err
}

func (r *menuRepo) Delete(id uint) error {
	return r.db.Delete(&models.Menu{}, id).Error
}
