package cctx

import (
	"context"
)

const (
	requestIDKey = "__ctx.data.request_id"
	traceIDKey   = "__ctx.data.trace_id"
)

// GetRequestID ...
func GetRequestID(ctx context.Context) string {
	return Get[string](ctx, requestIDKey)
}

// SetRequestID ...
func SetRequestID(ctx context.Context, requestID string) {
	Set(ctx, requestIDKey, requestID)
}

// GetTraceID ...
func GetTraceID(ctx context.Context) string {
	return Get[string](ctx, traceIDKey)
}

// SetTraceID ...
func SetTraceID(ctx context.Context, traceID string) {
	Set(ctx, traceIDKey, traceID)
}
