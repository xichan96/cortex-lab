package handler

import (
	"context"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/pkg/ec"
	"github.com/xichan96/cortex-lab/pkg/web/gx"

	"bytes"
	"encoding/json"
	"io"
	"net/http"

	mcp_spec "github.com/mark3labs/mcp-go/mcp"
)

func FetchMCPToolsAPI(c *gin.Context) {
	var req appdto.FetchMCPToolsReq
	if err := c.ShouldBindJSON(&req); err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}

	req.URL = strings.Join(strings.Fields(req.URL), "")

	slog.Info("Fetching MCP tools", "url", req.URL, "transport", req.Transport)

	transport := req.Transport
	if transport == "" {
		// Default to HTTP POST as per user requirement (was "sse")
		transport = "http"
	}

	// If transport is http/post, use custom HTTP POST logic
	if transport == "http" || transport == "post" {
		tools, err := fetchToolsViaHTTP(c.Request.Context(), req.URL)
		if err != nil {
			slog.Warn("HTTP POST failed, switching to SSE fallback", "err", err)
			transport = "sse"
		} else {
			gx.JSONSuccess(c, appdto.FetchMCPToolsResp{
				Tools: tools,
			})
			return
		}
	}

	impl := &mcp.Implementation{
		Name:    "cortex-mcp-client",
		Version: "1.0.0",
	}
	client := mcp.NewClient(impl, nil)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 60*time.Second)
	defer cancel()

	session, err := client.Connect(ctx, &mcp.SSEClientTransport{Endpoint: req.URL}, nil)
	if err != nil {
		gx.JSONErr(c, ec.NewErrorCode(ec.BadParams.Code, fmt.Sprintf("failed to connect (processed_url='%s', transport='%s'): %v", req.URL, transport, err)))
		return
	}
	defer session.Close()

	listRes, err := session.ListTools(ctx, nil)
	if err != nil {
		gx.JSONErr(c, gx.BErr(err))
		return
	}
	tools := listRes.Tools

	resp := appdto.FetchMCPToolsResp{
		Tools: make([]appdto.MCPTool, 0, len(tools)),
	}

	for _, t := range tools {
		resp.Tools = append(resp.Tools, appdto.MCPTool{
			Name:        t.Name,
			Description: t.Description,
		})
	}

	gx.JSONSuccess(c, resp)
}

// Custom HTTP Client for MCP
type jsonRpcRequest struct {
	JSONRPC string      `json:"jsonrpc"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params,omitempty"`
	ID      interface{} `json:"id,omitempty"`
}

type jsonRpcResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *jsonRpcError   `json:"error,omitempty"`
}

type jsonRpcError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func fetchToolsViaHTTP(ctx context.Context, urlStr string) ([]appdto.MCPTool, error) {
	client := &http.Client{
		Timeout: 120 * time.Second, // Increased timeout
	}

	// Helper to send JSON-RPC request
	var sessionID string
	var cookies []*http.Cookie

	sendRequest := func(method string, params interface{}) (*jsonRpcResponse, error) {
		id := time.Now().UnixNano() // Simple ID
		reqBody := jsonRpcRequest{
			JSONRPC: "2.0",
			Method:  method,
			Params:  params,
			ID:      id,
		}

		jsonBody, err := json.Marshal(reqBody)
		if err != nil {
			return nil, err
		}

		httpReq, err := http.NewRequestWithContext(ctx, "POST", urlStr, bytes.NewReader(jsonBody))
		if err != nil {
			return nil, err
		}

		httpReq.Header.Set("Content-Type", "application/json")
		if sessionID != "" {
			httpReq.Header.Set("Mcp-Session-Id", sessionID)
		}
		for _, cookie := range cookies {
			httpReq.AddCookie(cookie)
		}

		resp, err := client.Do(httpReq)
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()

		// Update session/cookies
		if sid := resp.Header.Get("Mcp-Session-Id"); sid != "" {
			sessionID = sid
		}
		if newCookies := resp.Cookies(); len(newCookies) > 0 {
			cookies = append(cookies, newCookies...)
		}

		bodyBytes, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != 200 {
			return nil, fmt.Errorf("http error: %d - %s", resp.StatusCode, string(bodyBytes))
		}

		var rpcResp jsonRpcResponse
		if err := json.Unmarshal(bodyBytes, &rpcResp); err != nil {
			return nil, fmt.Errorf("invalid json: %v (body: %s)", err, string(bodyBytes))
		}

		if rpcResp.Error != nil {
			return nil, fmt.Errorf("rpc error: %d %s", rpcResp.Error.Code, rpcResp.Error.Message)
		}

		return &rpcResp, nil
	}

	// 1. Initialize
	initParams := mcp_spec.InitializeParams{
		ProtocolVersion: "2024-11-05",
		ClientInfo: mcp_spec.Implementation{
			Name:    "cortex-mcp-client",
			Version: "1.0.0",
		},
		Capabilities: mcp_spec.ClientCapabilities{},
	}

	_, err := sendRequest("initialize", initParams)
	if err != nil {
		return nil, fmt.Errorf("initialize failed: %v", err)
	}

	// 2. Initialized Notification
	notifyBody := jsonRpcRequest{
		JSONRPC: "2.0",
		Method:  "notifications/initialized",
	}
	notifyJSON, _ := json.Marshal(notifyBody)
	notifyReq, _ := http.NewRequestWithContext(ctx, "POST", urlStr, bytes.NewReader(notifyJSON))
	notifyReq.Header.Set("Content-Type", "application/json")
	if sessionID != "" {
		notifyReq.Header.Set("Mcp-Session-Id", sessionID)
	}
	for _, cookie := range cookies {
		notifyReq.AddCookie(cookie)
	}
	notifyResp, err := client.Do(notifyReq)
	if err == nil {
		notifyResp.Body.Close()
	}

	// 3. List Tools
	listResp, err := sendRequest("tools/list", map[string]interface{}{})
	if err != nil {
		return nil, fmt.Errorf("list tools failed: %v", err)
	}

	var listResult mcp_spec.ListToolsResult
	resultBytes, _ := json.Marshal(listResp.Result) // re-marshal result to unmarshal into specific type
	if err := json.Unmarshal(resultBytes, &listResult); err != nil {
		return nil, fmt.Errorf("failed to parse tools list: %v", err)
	}

	tools := make([]appdto.MCPTool, 0)
	for _, t := range listResult.Tools {
		tools = append(tools, appdto.MCPTool{
			Name:        t.Name,
			Description: t.Description,
		})
	}

	return tools, nil
}
