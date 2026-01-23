package controllers

import (
	"net/http"
	"strconv"
	"wansteak-server/models"
	"wansteak-server/usecase"

	"github.com/gin-gonic/gin"
)

type MenuController struct {
	menuUsecase usecase.MenuUsecase
}

func NewMenuController(m usecase.MenuUsecase) *MenuController {
	return &MenuController{menuUsecase: m}
}

func (c *MenuController) GetAll(ctx *gin.Context) {
	menus, err := c.menuUsecase.GetAll()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": menus})
}

func (c *MenuController) Create(ctx *gin.Context) {
	var input models.Menu

	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	createdMenu, err := c.menuUsecase.Create(input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": createdMenu})
}

func (c *MenuController) Update(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, _ := strconv.Atoi(idParam)

	var input models.Menu
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedMenu, err := c.menuUsecase.Update(uint(id), input)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": updatedMenu})
}

func (c *MenuController) Delete(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, _ := strconv.Atoi(idParam)

	if err := c.menuUsecase.Delete(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Menu deleted successfully"})
}
