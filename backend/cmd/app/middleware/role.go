package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
)

const (
	AdminRole = "admin"
	UserRole  = "user"
)

func Role(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := cctx.GetUserRole[string](c)
		if userRole == AdminRole {
			c.Next()
			return
		}
		for _, r := range roles {
			if r == userRole {
				c.Next()
				return
			}
		}
		gx.JSONErr(c, ec.Forbidden)
		c.Abort()
	}
}

func AdminRoleMiddleware() gin.HandlerFunc {
	return Role(AdminRole)
}

func UserRoleMiddleware() gin.HandlerFunc {
	return Role(UserRole)
}
