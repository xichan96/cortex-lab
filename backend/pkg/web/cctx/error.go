package cctx

import (
	"context"

	"github.com/xichan96/cortex-lab/pkg/ec"
)

const (
	errCodeKey = "__ctx.data.error_code"
)

// GetErrCode ...
func GetErrCode(ctx context.Context) *ec.ErrorCode {
	return Get[*ec.ErrorCode](ctx, errCodeKey)
}

// SetErrCode ...
func SetErrCode(ctx context.Context, errCode *ec.ErrorCode) {
	Set(ctx, errCodeKey, errCode)
}
