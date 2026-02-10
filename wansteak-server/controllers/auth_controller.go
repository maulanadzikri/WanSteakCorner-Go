package controllers

import (
	"net/http"
	"wansteak-server/models"
	"wansteak-server/usecase"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authUsecase usecase.AuthUsecase
}

func NewAuthController(u usecase.AuthUsecase) *AuthController {
	return &AuthController{authUsecase: u}
}

func (c *AuthController) Register(ctx *gin.Context) {
	var input models.RegisterInput

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newUser, err := c.authUsecase.Register(input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": newUser})
}

func (c *AuthController) Login(ctx *gin.Context){
	var input models.LoginInput

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error}": err.Error()})
		return
	}

	token, err := c.authUsecase.Login(input)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"token": token})
}