package chat

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/xichan96/cortex-lab/internal/app/experience"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex/agent/types"
)

// BaseExperienceTool base experience tool
type BaseExperienceTool struct {
	ctx    context.Context
	userID string
	roleID string
	app    experience.AppIer
}

// CreateExperienceTool create experience tool
type CreateExperienceTool struct {
	BaseExperienceTool
}

func NewCreateExperienceTool(ctx context.Context, userID, roleID string, app experience.AppIer) *CreateExperienceTool {
	return &CreateExperienceTool{
		BaseExperienceTool: BaseExperienceTool{
			ctx:    ctx,
			userID: userID,
			roleID: roleID,
			app:    app,
		},
	}
}

func (t *CreateExperienceTool) Name() string {
	return "create_experience"
}

func (t *CreateExperienceTool) Description() string {
	return "Create a new experience entry in the experience base. Use this when the user wants to remember something."
}

func (t *CreateExperienceTool) Schema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"type": map[string]interface{}{
				"type":        "string",
				"description": "Type of experience (e.g., 'text', 'code', 'link')",
				"default":     "text",
			},
			"title": map[string]interface{}{
				"type":        "string",
				"description": "Title of the experience",
			},
			"content": map[string]interface{}{
				"type":        "string",
				"description": "Content of the experience",
			},
			"tags": map[string]interface{}{
				"type":        "string",
				"description": "Tags for the experience (comma separated or JSON array string)",
			},
		},
		"required": []string{"title", "content"},
	}
}

func (t *CreateExperienceTool) Execute(input map[string]interface{}) (interface{}, error) {
	req := &appdto.CreateExperienceReq{}

	// Manual unmarshalling or using mapstructure/json
	inputBytes, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal input: %w", err)
	}
	if err := json.Unmarshal(inputBytes, req); err != nil {
		return nil, fmt.Errorf("failed to unmarshal input: %w", err)
	}

	if req.Type == "" {
		req.Type = "text"
	}

	id, err := t.app.CreateExperience(t.ctx, t.userID, t.roleID, req)
	if err != nil {
		return nil, err
	}
	return map[string]string{"id": id, "status": "success"}, nil
}

func (t *CreateExperienceTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

// FuzzySearchExperienceTool fuzzy search experience tool
type FuzzySearchExperienceTool struct {
	BaseExperienceTool
}

func NewFuzzySearchExperienceTool(ctx context.Context, userID, roleID string, app experience.AppIer) *FuzzySearchExperienceTool {
	return &FuzzySearchExperienceTool{
		BaseExperienceTool: BaseExperienceTool{
			ctx:    ctx,
			userID: userID,
			roleID: roleID,
			app:    app,
		},
	}
}

func (t *FuzzySearchExperienceTool) Name() string {
	return "fuzzy_search_experience"
}

func (t *FuzzySearchExperienceTool) Description() string {
	return "Search for experience in the experience base by keywords. This is the PRIMARY tool for searching experiences. Use this whenever the user asks a question that might be answered by stored experience."
}

func (t *FuzzySearchExperienceTool) Schema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"keywords": map[string]interface{}{
				"type":        "array",
				"items":       map[string]interface{}{"type": "string"},
				"description": "List of keywords to search for",
			},
		},
		"required": []string{"keywords"},
	}
}

func (t *FuzzySearchExperienceTool) Execute(input map[string]interface{}) (interface{}, error) {
	keywordsInterface, ok := input["keywords"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("keywords must be an array of strings")
	}

	keywords := make([]string, len(keywordsInterface))
	for i, v := range keywordsInterface {
		s, ok := v.(string)
		if !ok {
			return nil, fmt.Errorf("keyword at index %d must be a string", i)
		}
		keywords[i] = s
	}

	list, err := t.app.SearchExperience(t.ctx, t.roleID, keywords)
	if err != nil {
		return nil, err
	}
	return list, nil
}

func (t *FuzzySearchExperienceTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

// GetExperienceTool get experience tool
type GetExperienceTool struct {
	BaseExperienceTool
}

func NewGetExperienceTool(ctx context.Context, userID string, app experience.AppIer) *GetExperienceTool {
	return &GetExperienceTool{
		BaseExperienceTool: BaseExperienceTool{
			ctx:    ctx,
			userID: userID,
			app:    app,
		},
	}
}

func (t *GetExperienceTool) Name() string {
	return "get_experience"
}

func (t *GetExperienceTool) Description() string {
	return "Get details of a specific experience entry by ID."
}

func (t *GetExperienceTool) Schema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"id": map[string]interface{}{
				"type":        "string",
				"description": "ID of the experience to retrieve",
			},
		},
		"required": []string{"id"},
	}
}

func (t *GetExperienceTool) Execute(input map[string]interface{}) (interface{}, error) {
	id, ok := input["id"].(string)
	if !ok {
		return nil, fmt.Errorf("id is required and must be a string")
	}

	k, err := t.app.GetExperience(t.ctx, id)
	if err != nil {
		return nil, err
	}
	return k, nil
}

func (t *GetExperienceTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

// UpdateExperienceTool update experience tool
type UpdateExperienceTool struct {
	BaseExperienceTool
}

func NewUpdateExperienceTool(ctx context.Context, userID string, app experience.AppIer) *UpdateExperienceTool {
	return &UpdateExperienceTool{
		BaseExperienceTool: BaseExperienceTool{
			ctx:    ctx,
			userID: userID,
			app:    app,
		},
	}
}

func (t *UpdateExperienceTool) Name() string {
	return "update_experience"
}

func (t *UpdateExperienceTool) Description() string {
	return "Update an existing experience entry."
}

func (t *UpdateExperienceTool) Schema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"id": map[string]interface{}{
				"type":        "string",
				"description": "ID of the experience to update",
			},
			"title": map[string]interface{}{
				"type":        "string",
				"description": "New title",
			},
			"content": map[string]interface{}{
				"type":        "string",
				"description": "New content",
			},
			"tags": map[string]interface{}{
				"type":        "string",
				"description": "New tags",
			},
		},
		"required": []string{"id"},
	}
}

func (t *UpdateExperienceTool) Execute(input map[string]interface{}) (interface{}, error) {
	req := &appdto.UpdateExperienceReq{}
	inputBytes, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal input: %w", err)
	}
	if err := json.Unmarshal(inputBytes, req); err != nil {
		return nil, fmt.Errorf("failed to unmarshal input: %w", err)
	}

	err = t.app.UpdateExperience(t.ctx, req)
	if err != nil {
		return nil, err
	}
	return map[string]string{"status": "success"}, nil
}

func (t *UpdateExperienceTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

// DeleteExperienceTool delete experience tool
type DeleteExperienceTool struct {
	BaseExperienceTool
}

func NewDeleteExperienceTool(ctx context.Context, userID string, app experience.AppIer) *DeleteExperienceTool {
	return &DeleteExperienceTool{
		BaseExperienceTool: BaseExperienceTool{
			ctx:    ctx,
			userID: userID,
			app:    app,
		},
	}
}

func (t *DeleteExperienceTool) Name() string {
	return "delete_experience"
}

func (t *DeleteExperienceTool) Description() string {
	return "Delete a experience entry."
}

func (t *DeleteExperienceTool) Schema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"id": map[string]interface{}{
				"type":        "string",
				"description": "ID of the experience to delete",
			},
		},
		"required": []string{"id"},
	}
}

func (t *DeleteExperienceTool) Execute(input map[string]interface{}) (interface{}, error) {
	id, ok := input["id"].(string)
	if !ok {
		return nil, fmt.Errorf("id is required and must be a string")
	}

	err := t.app.DeleteExperience(t.ctx, id)
	if err != nil {
		return nil, err
	}
	return map[string]string{"status": "success"}, nil
}

func (t *DeleteExperienceTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}

// SearchExperienceTool search experience tool
type SearchExperienceTool struct {
	BaseExperienceTool
}

func NewSearchExperienceTool(ctx context.Context, userID, roleID string, app experience.AppIer) *SearchExperienceTool {
	return &SearchExperienceTool{
		BaseExperienceTool: BaseExperienceTool{
			ctx:    ctx,
			userID: userID,
			roleID: roleID,
			app:    app,
		},
	}
}

func (t *SearchExperienceTool) Name() string {
	return "search_experience"
}

func (t *SearchExperienceTool) Description() string {
	return "List experience entries with pagination. Use ONLY for browsing or listing experiences, NOT for searching by content."
}

func (t *SearchExperienceTool) Schema() map[string]interface{} {
	return map[string]interface{}{
		"type": "object",
		"properties": map[string]interface{}{
			"keyword": map[string]interface{}{
				"type":        "string",
				"description": "Keyword to search for",
			},
			"type": map[string]interface{}{
				"type":        "string",
				"description": "Type filter",
			},
			"page": map[string]interface{}{
				"type":        "integer",
				"description": "Page number",
				"default":     1,
			},
			"page_size": map[string]interface{}{
				"type":        "integer",
				"description": "Page size",
				"default":     10,
			},
		},
		"required": []string{"keyword"},
	}
}

func (t *SearchExperienceTool) Execute(input map[string]interface{}) (interface{}, error) {
	req := &appdto.GetExperienceReq{}
	inputBytes, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal input: %w", err)
	}
	if err := json.Unmarshal(inputBytes, req); err != nil {
		return nil, fmt.Errorf("failed to unmarshal input: %w", err)
	}

	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 5 // Default small for chat context
	}

	// We might want to pass roleID to filter by role, assuming roleID is available in BaseExperienceTool
	// However, the original GetExperienceList takes roleID as argument.
	// If t.roleID is set, we use it.

	list, total, err := t.app.GetExperienceList(t.ctx, t.roleID, req)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"list":  list,
		"total": total,
	}, nil
}

func (t *SearchExperienceTool) Metadata() types.ToolMetadata {
	return types.ToolMetadata{
		ToolType: "builtin",
	}
}
