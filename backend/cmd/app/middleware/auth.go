package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
	"github.com/xichan96/cortex-lab/pkg/web/jwt"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		cctx.WithKeeper(&ginKeeper{c})

		// 1. Check X-JWT header
		token := c.GetHeader("X-JWT")

		// 2. Check Authorization header (Bearer)
		if len(token) == 0 {
			authHeader := c.GetHeader("Authorization")
			if len(authHeader) > 7 && strings.ToUpper(authHeader[0:6]) == "BEARER" {
				token = authHeader[7:]
			}
		}

		// 3. Check Query parameters
		if len(token) == 0 {
			token = c.Query("token")
		}
		if len(token) == 0 {
			token = c.Query("access_token")
		}

		if len(token) == 0 {
			c.Abort()
			gx.JSONErr(c, ec.Unauthorized)
			return
		}

		var userData map[string]interface{}
		if err := jwt.DefaultToken.DecodeBody(token, &userData); err != nil {
			c.Abort()
			gx.JSONErr(c, ec.Unauthorized)
			return
		}

		if id, ok := userData["id"].(string); ok {
			cctx.SetUserID(c, id)
		}
		if username, ok := userData["username"].(string); ok {
			cctx.SetUsername(c, username)
		}
		if role, ok := userData["role"].(string); ok {
			cctx.SetUserRole(c, role)
		}
	}
}

type ginKeeper struct {
	*gin.Context
}

func (g *ginKeeper) Set(key string, val any) {
	g.Context.Set(key, val)
}
