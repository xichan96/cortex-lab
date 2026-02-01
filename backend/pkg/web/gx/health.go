package gx

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/ec"
)

func HealthAPI(c *gin.Context) {
	c.JSON(200, ec.Success)
}
