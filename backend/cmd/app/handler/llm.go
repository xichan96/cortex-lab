package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xichan96/cortex-lab/internal/di"
	"github.com/xichan96/cortex-lab/pkg/web/gx"
)

type FetchLLMModelsReq struct {
	Provider string `json:"provider"`
	APIKey   string `json:"api_key"`
	BaseURL  string `json:"base_url"`
}

type FetchLLMModelsResp struct {
	Models []string `json:"models"`
}

func cleanURL(u string) string {
	s := strings.TrimSpace(u)
	if s == "" {
		return ""
	}
	replacer := strings.NewReplacer("`", "", "\"", "", "'", "", "\\", "")
	s = replacer.Replace(s)
	// Remove trailing slash(es)
	for strings.HasSuffix(s, "/") {
		s = strings.TrimSuffix(s, "/")
	}
	return s
}

func joinModelsURL(base string, provider string) string {
	b := cleanURL(base)
	pl := strings.ToLower(provider)
	if strings.HasSuffix(b, "/v1") {
		return b + "/models"
	}
	if pl == "volce" || strings.Contains(b, "/api/v3") {
		return b + "/models"
	}
	return b + "/v1/models"
}

func FetchLLMModelsAPI(c *gin.Context) {
	var req FetchLLMModelsReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	req.APIKey = strings.TrimSpace(req.APIKey)
	req.BaseURL = cleanURL(req.BaseURL)

	if req.APIKey == "" {
		gx.JSONErr(c, gx.BErr(fmt.Errorf("missing api_key")))
		return
	}

	if req.BaseURL == "" {
		setting, err := di.SettingApp.GetLLMSetting(c)
		if err == nil && setting != nil && setting.LLMConfig != nil {
			switch strings.ToLower(req.Provider) {
			case "openai":
				req.BaseURL = setting.LLMConfig.OpenAI.BaseURL
			case "deepseek":
				req.BaseURL = setting.LLMConfig.DeepSeek.BaseURL
			case "volce":
				req.BaseURL = setting.LLMConfig.Volce.BaseURL
			}
		}
		if req.BaseURL == "" {
			switch strings.ToLower(req.Provider) {
			case "openai":
				req.BaseURL = "https://api.openai.com"
			case "deepseek":
				req.BaseURL = "https://api.deepseek.com"
			case "volce":
				req.BaseURL = "https://ark.cn-beijing.volces.com/api/v3"
			}
		}
	}

	url := joinModelsURL(req.BaseURL, req.Provider)

	client := &http.Client{Timeout: 10 * time.Second}
	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	httpReq.Header.Set("Authorization", "Bearer "+req.APIKey)

	resp, err := client.Do(httpReq)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		bodyStr := strings.TrimSpace(string(bodyBytes))
		if bodyStr == "" {
			bodyStr = resp.Status
		}
		gx.JSONErr(c, gx.BErr(fmt.Errorf("upstream status %d: %s", resp.StatusCode, bodyStr)))
		return
	}

	var raw map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	var models []string
	if data, ok := raw["data"].([]interface{}); ok {
		for _, item := range data {
			if m, ok := item.(map[string]interface{}); ok {
				if id, ok := m["id"].(string); ok && id != "" {
					models = append(models, id)
					continue
				}
				if name, ok := m["model"].(string); ok && name != "" {
					models = append(models, name)
					continue
				}
				if name, ok := m["name"].(string); ok && name != "" {
					models = append(models, name)
					continue
				}
			}
		}
	}

	gx.JSONSuccess(c, FetchLLMModelsResp{Models: models})
}
