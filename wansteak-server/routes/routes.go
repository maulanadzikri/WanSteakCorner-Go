package routes

import (
	"wansteak-server/controllers"
	"wansteak-server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(
	menuController *controllers.MenuController,
	orderController *controllers.OrderController,
	authController *controllers.AuthController,
) *gin.Engine {

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
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
