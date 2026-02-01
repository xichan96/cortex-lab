package router

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/cmd/app/handler"
)

func RegisterSetupRouter(r *gin.Engine) {
	setup := r.Group("/api/setup")
	{
		setup.GET("/check", handler.CheckInstallAPI)
		setup.POST("/install", handler.InstallAPI)
	}
}
