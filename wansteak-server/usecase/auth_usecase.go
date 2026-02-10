package usecase

import (
	"errors"
	"os"
	"time"
	"wansteak-server/models"
	"wansteak-server/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase interface {
	Register(input models.RegisterInput) (models.User, error)
	Login(input models.LoginInput) (string, error)
}

type authUsecase struct{
	userRepo repository.UserRepository
}

func NewAuthUsecase(r repository.UserRepository) AuthUsecase{
	return &authUsecase{userRepo: r}
}

func (u *authUsecase) Register(input models.RegisterInput) (models.User, error){
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, err
	}

	newUser := models.User{
		Email: input.Email,
		Password: string(hashedPassword),
		Role: "admin",
	}
	return u.userRepo.Save(newUser)
}

func (u *authUsecase) Login(input models.LoginInput) (string, error){
	user, err := u.userRepo.FindByEmail(input.Email)
	if err != nil {
		return "", errors.New("email salah")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		return "", errors.New("password salah")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role": user.Role,
		"exp": time.Now().Add(time.Hour*24).Unix(),
	})

	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		secretKey = "DEFAULT_SECRET_DEV"
	}

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}