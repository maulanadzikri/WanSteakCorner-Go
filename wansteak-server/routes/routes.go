package routes

import (
	"wansteak-server/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRouter(menuController *controllers.MenuController, orderController *controllers.OrderController) *gin.Engine {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
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
		api.GET("/orders/:id", orderController.GetOrder)
		api.POST("/webhook", orderController.HandleWebhook)

		admin := api.Group("/admin")
		{
			admin.POST("/menu", menuController.Create)
			admin.PUT("/menu/:id", menuController.Update)
			admin.DELETE("/menu/:id", menuController.Delete)
		}
	}

	return r
}
