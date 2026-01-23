package usecase

import (
	"errors"
	"wansteak-server/models"
	"wansteak-server/repository"
)

type MenuUsecase interface{
	GetAll() ([]models.Menu, error)
	GetMenuByID(id uint) (models.Menu, error)
	Create(input models.Menu) (models.Menu, error)
	Update(id uint, menu models.Menu) (models.Menu, error)
	Delete(id uint) error
}

type menuUsecase struct{
	menuRepo repository.MenuRepository
}

func NewMenuUsecase(m repository.MenuRepository) MenuUsecase{
	return &menuUsecase{menuRepo: m}
}

func (u *menuUsecase) GetAll() ([]models.Menu, error){
	return u.menuRepo.FindAll()
}

func (u *menuUsecase) GetMenuByID(id uint) (models.Menu, error){
	return u.menuRepo.FindByID(id)
}

func (u *menuUsecase) Create(input models.Menu) (models.Menu, error){
	if input.Name == "" || input.Price <= 0 {
		return models.Menu{}, errors.New("nama dan harga wajib diisi")
	}

	return u.menuRepo.Save(input)
}

func (u *menuUsecase) Update(id uint, input models.Menu) (models.Menu, error) {
	existingMenu, err := u.menuRepo.FindByID(id)
	if err != nil {
		return models.Menu{}, errors.New("Menu tidak ditemukan!")
	}

	existingMenu.Name = input.Name
	existingMenu.Image = input.Image
	existingMenu.Price = input.Price
	existingMenu.Stok = input.Stok

	return u.menuRepo.Update(existingMenu)
}

func (u *menuUsecase) Delete(id uint) error{
	_, err := u.menuRepo.FindByID(id)
	if err != nil {
		return errors.New("Menu tidak ditemukan")
	}
	return u.menuRepo.Delete(id)
}