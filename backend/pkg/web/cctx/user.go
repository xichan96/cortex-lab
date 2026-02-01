package cctx

import (
	"context"
)

const (
	userIDKey   = "__ctx.data.user_id"
	usernameKey = "__ctx.data.username"
	userRoleKey = "__ctx.data.user_role"
)

// GetUserID ...
func GetUserID[T IntStr](ctx context.Context) T {
	return Get[T](ctx, userIDKey)
}

// SetUserID ...
func SetUserID[T IntStr](ctx context.Context, useID T) {
	Set(ctx, userIDKey, useID)
}

// GetUsername ...
func GetUsername(ctx context.Context) string {
	return Get[string](ctx, usernameKey)
}

// SetUsername ...
func SetUsername(ctx context.Context, username string) {
	Set(ctx, usernameKey, username)
}

// GetUserRole ...
func GetUserRole[T IntStr](ctx context.Context) T {
	return Get[T](ctx, userRoleKey)
}

// SetUserRole ...
func SetUserRole[T IntStr](ctx context.Context, role T) {
	Set(ctx, userRoleKey, role)
}
