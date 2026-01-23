package main

import (
	// "log"
	"os"
	"wansteak-server/config"
	"wansteak-server/controllers"
	"wansteak-server/repository"
	"wansteak-server/routes"
	"wansteak-server/usecase"
	// "github.com/joho/godotenv"
)

func main() {
	// errConfig := godotenv.Load()
	// if errConfig != nil {
	//     log.Fatal("Error loading .env file")
	// }

	db := config.ConnectDatabase()
	menuRepo := repository.NewMenuRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	menuUsecase := usecase.NewMenuUsecase(menuRepo)
	orderUsecase := usecase.NewOrderUsecase(menuRepo, orderRepo)
	menuController := controllers.NewMenuController(menuUsecase)
	orderController := controllers.NewOrderController(orderUsecase)

	r := routes.SetupRouter(menuController, orderController)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
