package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
)

// CreateUserAPI Create User
// @Summary Create User
// @Tags User
// @Accept json
// @Produce json
// @Param req body appdto.CreateUserReq true "req"
// @Success 200 {object} gx.Response
// @Router /users [post]
func CreateUserAPI(c *gin.Context) {
	var req appdto.CreateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	id, err := di.UserApp.CreateUser(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, map[string]string{"id": id})
}

// RegisterAPI User Register
// @Summary User Register
// @Tags Auth
// @Accept json
// @Produce json
// @Param req body appdto.CreateUserReq true "req"
// @Success 200 {object} gx.Response
// @Router /auth/register [post]
func RegisterAPI(c *gin.Context) {
	CreateUserAPI(c)
}

// LoginAPI User Login
// @Summary User Login
// @Tags Auth
// @Accept json
// @Produce json
// @Param req body appdto.LoginRequest true "req"
// @Success 200 {object} gx.Response
// @Router /auth/login [post]
func LoginAPI(c *gin.Context) {
	var req appdto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	resp, err := di.UserApp.LoginWithPassword(c, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, resp)
}

// MeAPI Get Current User
// @Summary Get Current User
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} gx.Response
// @Router /auth/me [get]
func MeAPI(c *gin.Context) {
	userID := cctx.GetUserID[string](c)
	if userID == "" {
		gx.JSONErr(c, errors.New("user id not found in context"))
		return
	}

	user, err := di.UserApp.GetUser(c, userID)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, user)
}

// GetUsersAPI List Users
// @Summary List Users
// @Tags User
// @Accept json
// @Produce json
// @Success 200 {object} gx.Response
// @Router /users [get]
func GetUsersAPI(c *gin.Context) {
	users, err := di.UserApp.GetUsers(c)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}
	gx.JSONSuccess(c, users)
}

// UpdateUserAPI Update User
// @Summary Update User
// @Tags User
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Param req body appdto.UpdateUserReq true "req"
// @Success 200 {object} gx.Response
// @Router /users/{user_id} [put]
func UpdateUserAPI(c *gin.Context) {
	var req appdto.UpdateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	// Override ID from path if present
	if id := c.Param("user_id"); id != "" {
		req.ID = id
	}

	if err := di.UserApp.UpdateUser(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, nil)
}

// DeleteUserAPI Delete User
// @Summary Delete User
// @Tags User
// @Accept json
// @Produce json
// @Param user_id path string true "User ID"
// @Success 200 {object} gx.Response
// @Router /users/{user_id} [delete]
func DeleteUserAPI(c *gin.Context) {
	var req struct {
		ID string `uri:"user_id" binding:"required"`
	}
	if err := c.ShouldBindUri(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	if err := di.UserApp.DeleteUser(c, req.ID); err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, nil)
}

// LogoutAPI User Logout
// @Summary User Logout
// @Tags Auth
// @Accept json
// @Produce json
// @Success 200 {object} gx.Response
// @Router /auth/logout [post]
func LogoutAPI(c *gin.Context) {
	gx.JSONSuccess(c, nil)
}
