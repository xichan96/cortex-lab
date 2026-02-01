package appdto

type FetchMCPToolsReq struct {
	URL       string `json:"url" binding:"required"`
	Transport string `json:"transport"` // "sse" or "http"
}

type MCPTool struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type FetchMCPToolsResp struct {
	Tools []MCPTool `json:"tools"`
}
