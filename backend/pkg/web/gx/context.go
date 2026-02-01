package gx

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
)

const (
	RequestIDKey = "X-Request-Id"
)

type ginContextAdapter struct {
	*gin.Context
}

func (g *ginContextAdapter) Set(key string, val any) {
	g.Context.Set(key, val)
}

func ContextKeeper(c *gin.Context) {
	cctx.WithKeeper(&ginContextAdapter{Context: c})
}

func RequestID(key string) gin.HandlerFunc {
	return func(c *gin.Context) {
		cctx.SetRequestID(c, c.Request.Header.Get(key))
	}
}
