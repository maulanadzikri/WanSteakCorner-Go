package repository

import (
	"wansteak-server/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Save(user models.User) (models.User, error)
	FindByEmail(email string) (models.User, error)
}

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db}
}

func (r *userRepo) Save(user models.User) (models.User, error) {
	err := r.db.Create(&user).Error
	return user, err
}

func (r *userRepo) FindByEmail(email string) (models.User, error){
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return user, err
}