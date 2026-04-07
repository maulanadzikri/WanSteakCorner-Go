package routes

import (
	"time"
	"wansteak-server/controllers"
	"wansteak-server/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(
	menuController *controllers.MenuController,
	orderController *controllers.OrderController,
	authController *controllers.AuthController,
) *gin.Engine {

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"http://localhost:5173", "https://wan-steak-corner-go.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
			"time": time.Now().Format(time.RFC3339),
		})
	})

	api := r.Group("/api")
	{

		api.GET("/menu", menuController.GetAll)
		api.POST("/orders", orderController.Create)
		api.GET("/orders", orderController.GetAllOrders)
		api.GET("/orders/:id", orderController.GetOrder)
		api.POST("/orders/:id/cancel", orderController.CancelOrder)
		api.PATCH("/orders/:id/status", orderController.UpdateOrderStatus)
		api.POST("/webhook", orderController.HandleWebhook)

		auth := api.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
		}

		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleWare())
		{
			protected.POST("/menu", menuController.Create)
			protected.PUT("/menu/:id", menuController.Update)
			protected.DELETE("/menu/:id", menuController.Delete)
			protected.GET("/dashboard/stats", orderController.GetDashboardStats)
		}
	}

	return r
}
