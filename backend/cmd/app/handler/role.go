package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
)

// 3.1 Get Role List
// @Summary Get Role List
// @Tags Role
// @Accept json
// @Produce json
// @Param page query int false "Page"
// @Param page_size query int false "Page Size"
// @Param keyword query string false "Keyword"
// @Param scope query string false "Scope"
// @Success 200 {object} gx.Response
// @Router /roles [get]
func GetRolesAPI(c *gin.Context) {
	var req appdto.GetRolesReq
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	// Default page/size
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}

	list, total, err := di.RoleApp.GetRoles(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, map[string]interface{}{
		"list":      list,
		"total":     total,
		"page":      req.Page,
		"page_size": req.PageSize,
	})
}

// Create Role
// @Summary Create Role
// @Tags Role
// @Accept json
// @Produce json
// @Param req body appdto.CreateRoleReq true "req"
// @Success 200 {object} gx.Response
// @Router /roles [post]
func CreateRoleAPI(c *gin.Context) {
	var req appdto.CreateRoleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.RoleApp.CreateRole(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

// Update Role
// @Summary Update Role
// @Tags Role
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Param req body appdto.UpdateRoleReq true "req"
// @Success 200 {object} gx.Response
// @Router /roles/{role_id} [put]
func UpdateRoleAPI(c *gin.Context) {
	var req appdto.UpdateRoleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.ID = c.Param("role_id")
	if err := di.RoleApp.UpdateRole(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// Delete Role
// @Summary Delete Role
// @Tags Role
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Success 200 {object} gx.Response
// @Router /roles/{role_id} [delete]
func DeleteRoleAPI(c *gin.Context) {
	id := c.Param("role_id")
	if err := di.RoleApp.DeleteRole(c, id); err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, nil)
}

// Get Role
// @Summary Get Role
// @Tags Role
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Success 200 {object} gx.Response
// @Router /roles/{role_id} [get]
func GetRoleAPI(c *gin.Context) {
	id := c.Param("role_id")
	role, err := di.RoleApp.GetRole(c, id)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, role)
}
