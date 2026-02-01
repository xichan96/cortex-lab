package web

import "github.com/xichan96/cortex-lab/pkg/ec"

type ResponseBody struct {
	*ec.ErrorCode
	Data any `json:"data,omitempty"`
}

type ListResult struct {
	Result any   `json:"result"`
	Total  int64 `json:"total"`
}
