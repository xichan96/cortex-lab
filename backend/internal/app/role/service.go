package role

import (
	"context"
	"encoding/json"
	"time"

	"github.com/jinzhu/copier"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"github.com/xichan96/cortex-lab/pkg/web/cctx"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateRole(ctx context.Context, req *appdto.CreateRoleReq) (string, error)
	UpdateRole(ctx context.Context, req *appdto.UpdateRoleReq) error
	DeleteRole(ctx context.Context, id string) error
	GetRole(ctx context.Context, id string) (*appdto.Role, error)
	GetRoles(ctx context.Context, req *appdto.GetRolesReq) ([]*appdto.Role, int64, error)
}

type app struct {
	rp persist.RolePersistIer
}

func NewApp(rp persist.RolePersistIer) AppIer {
	return &app{rp: rp}
}

func (a *app) CreateRole(ctx context.Context, req *appdto.CreateRoleReq) (string, error) {
	userID := cctx.GetUserID[string](ctx)

	toolsPayload := any(req.Tools)
	if req.ToolConfig != nil {
		toolsPayload = req.ToolConfig
	}
	toolsJSON, _ := json.Marshal(toolsPayload)
	permissionsJSON, _ := json.Marshal(req.Permissions)

	isPublic := 0
	if req.IsPublic {
		isPublic = 1
	}

	role := &model.Role{
		Name:        req.Name,
		Description: req.Description,
		Avatar:      req.Avatar,
		Prompt:      req.Prompt,
		Principle:   req.Principle,
		Tools:       string(toolsJSON),
		Permissions: string(permissionsJSON),
		CreatorID:   userID,
		IsPublic:    isPublic,
	}
	return a.rp.Create(ctx, role)
}

func (a *app) UpdateRole(ctx context.Context, req *appdto.UpdateRoleReq) error {
	role, err := a.rp.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	if req.Name != "" {
		role.Name = req.Name
	}
	if req.Description != "" {
		role.Description = req.Description
	}
	if req.Avatar != "" {
		role.Avatar = req.Avatar
	}
	if req.Prompt != "" {
		role.Prompt = req.Prompt
	}
	if req.Principle != "" {
		role.Principle = req.Principle
	}
	if req.ToolConfig != nil {
		toolsJSON, _ := json.Marshal(req.ToolConfig)
		role.Tools = string(toolsJSON)
	} else if req.Tools != nil {
		toolsJSON, _ := json.Marshal(req.Tools)
		role.Tools = string(toolsJSON)
	}
	if req.Permissions != nil {
		permissionsJSON, _ := json.Marshal(req.Permissions)
		role.Permissions = string(permissionsJSON)
	}
	if req.IsPublic != nil {
		if *req.IsPublic {
			role.IsPublic = 1
		} else {
			role.IsPublic = 0
		}
	}

	role.UpdatedAt = time.Now()
	return a.rp.Update(ctx, role)
}

func (a *app) DeleteRole(ctx context.Context, id string) error {
	role, err := a.rp.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return a.rp.Delete(ctx, role)
}

func (a *app) GetRole(ctx context.Context, id string) (*appdto.Role, error) {
	role, err := a.rp.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := &appdto.Role{}
	copier.Copy(dto, role)

	dto.ToolConfig, dto.Tools = parseRoleTools(role.Tools)
	_ = json.Unmarshal([]byte(role.Permissions), &dto.Permissions)

	dto.IsPublic = role.IsPublic == 1

	return dto, nil
}

func (a *app) GetRoles(ctx context.Context, req *appdto.GetRolesReq) ([]*appdto.Role, int64, error) {
	userID := cctx.GetUserID[string](ctx)
	opts := []func(*gorm.DB) *gorm.DB{}

	if req.Keyword != "" {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Where("name LIKE ? OR description LIKE ?", "%"+req.Keyword+"%", "%"+req.Keyword+"%")
		})
	}

	if req.Scope == "mine" {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Where("creator_id = ?", userID)
		})
	} else if req.Scope == "public" {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Where("is_public = ?", 1)
		})
	} else {
		// default: all (public + mine)
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Where("is_public = ? OR creator_id = ?", 1, userID)
		})
	}

	total, err := a.rp.Count(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}

	if req.Page > 0 && req.PageSize > 0 {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			offset := (req.Page - 1) * req.PageSize
			return db.Offset(offset).Limit(req.PageSize)
		})
	}

	roles, err := a.rp.GetList(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}
	dtos := make([]*appdto.Role, len(roles))
	for i, r := range roles {
		dto := &appdto.Role{}
		copier.Copy(dto, r)
		dto.ToolConfig, dto.Tools = parseRoleTools(r.Tools)
		_ = json.Unmarshal([]byte(r.Permissions), &dto.Permissions)
		dto.IsPublic = r.IsPublic == 1
		dtos[i] = dto
	}
	return dtos, total, nil
}

func parseRoleTools(toolsJSON string) (*appdto.RoleToolConfig, []string) {
	if toolsJSON == "" {
		return nil, nil
	}

	var cfg appdto.RoleToolConfig
	if err := json.Unmarshal([]byte(toolsJSON), &cfg); err == nil {
		if len(cfg.Builtin) > 0 || len(cfg.MCP) > 0 || cfg.EmailConfig != nil || len(cfg.RoleNotifications) > 0 || len(cfg.HumanNotifications) > 0 {
			return &cfg, flattenRoleToolConfig(&cfg)
		}
	}

	var legacy []string
	if err := json.Unmarshal([]byte(toolsJSON), &legacy); err == nil {
		return nil, legacy
	}

	return nil, nil
}

func flattenRoleToolConfig(cfg *appdto.RoleToolConfig) []string {
	if cfg == nil {
		return nil
	}
	out := make([]string, 0, len(cfg.Builtin)+len(cfg.MCP))
	seen := make(map[string]struct{}, len(cfg.Builtin)+len(cfg.MCP))

	for _, v := range cfg.Builtin {
		if v == "" {
			continue
		}
		if _, ok := seen[v]; ok {
			continue
		}
		seen[v] = struct{}{}
		out = append(out, v)
	}
	for _, m := range cfg.MCP {
		if m.URL == "" {
			continue
		}
		if _, ok := seen[m.URL]; ok {
			continue
		}
		seen[m.URL] = struct{}{}
		out = append(out, m.URL)
	}
	return out
}
