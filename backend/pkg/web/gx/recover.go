package gx

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/ec"
)

func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, err any) {
		JSONErr(c, ec.New(fmt.Sprintf("%v", err)))
	})
}
