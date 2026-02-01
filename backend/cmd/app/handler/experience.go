package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
)

// 4.1 Search Experience
// @Summary Search Experience
// @Tags Experience
// @Accept json
// @Produce json
// @Param page query int false "Page"
// @Param page_size query int false "Page Size"
// @Param q query string true "Keyword"
// @Param type query string false "Type"
// @Success 200 {object} gx.Response
// @Router /experiences/search [get]
func SearchExperienceAPI(c *gin.Context) {
	var req appdto.GetExperienceReq
	// Bind standard fields
	if err := c.ShouldBindQuery(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	// Bind 'q' to 'keyword' manually as api.md specifies 'q'
	req.Keyword = c.Query("q")

	// Default page/size
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 20
	}

	list, total, err := di.ExperienceApp.GetExperienceList(c, req.RoleID, &req)
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

// 4.2 Create Experience
// @Summary Create Experience
// @Tags Experience
// @Accept json
// @Produce json
// @Param body body appdto.CreateExperienceReq true "Create Experience"
// @Success 200 {object} gx.Response
// @Router /experiences [post]
func CreateExperienceAPI(c *gin.Context) {
	var req appdto.CreateExperienceReq
	if err := gx.BindJSON(c, &req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	userID := cctx.GetUserID[string](c)
	id, err := di.ExperienceApp.CreateExperience(c, userID, req.RoleID, &req)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, map[string]string{"id": id})
}

// Get Experience Detail
// @Summary Get Experience Detail
// @Tags Experience
// @Accept json
// @Produce json
// @Param id path string true "Experience ID"
// @Success 200 {object} gx.Response
// @Router /experiences/{id} [get]
func GetExperienceAPI(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		gx.JSONErr(c, gx.BErr(errors.New("id is required")))
		return
	}

	k, err := di.ExperienceApp.GetExperience(c, id)
	if err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, k)
}

// Update Experience
// @Summary Update Experience
// @Tags Experience
// @Accept json
// @Produce json
// @Param id path string true "Experience ID"
// @Param body body appdto.UpdateExperienceReq true "Update Experience"
// @Success 200 {object} gx.Response
// @Router /experiences/{id} [put]
func UpdateExperienceAPI(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		gx.JSONErr(c, gx.BErr(errors.New("id is required")))
		return
	}

	var req appdto.UpdateExperienceReq
	if err := gx.BindJSON(c, &req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	req.ID = id

	if err := di.ExperienceApp.UpdateExperience(c, &req); err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, nil)
}

// Delete Experience
// @Summary Delete Experience
// @Tags Experience
// @Accept json
// @Produce json
// @Param id path string true "Experience ID"
// @Success 200 {object} gx.Response
// @Router /experiences/{id} [delete]
func DeleteExperienceAPI(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		gx.JSONErr(c, gx.BErr(errors.New("id is required")))
		return
	}

	if err := di.ExperienceApp.DeleteExperience(c, id); err != nil {
		gx.JSONErr(c, err)
		return
	}

	gx.JSONSuccess(c, nil)
}
