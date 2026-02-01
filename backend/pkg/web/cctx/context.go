package cctx

import (
	"context"

	"golang.org/x/exp/constraints"
)

const ctxKey = "__ctx.data"

type IntStr interface {
	constraints.Integer | ~string
}

type keeperIer interface {
	Set(key string, val any)
	context.Context
}

type dataKeeper struct {
	data map[string]any
}

func newDataKeeper() *dataKeeper {
	return &dataKeeper{data: make(map[string]any)}
}

func Set[T any](ctx context.Context, key string, val T) {
	keeper := getKeeper(ctx)
	if keeper != nil {
		keeper.data[key] = val
	}
}

func Get[T any](ctx context.Context, key string) T {
	var result T
	keeper := getKeeper(ctx)
	if keeper != nil {
		if v, ok := keeper.data[key]; ok {
			result = v.(T)
		}
	}
	return result
}

func getKeeper(ctx context.Context) *dataKeeper {
	kep := ctx.Value(ctxKey)
	if kep == nil {
		return nil
	}
	return kep.(*dataKeeper)
}

func WithKeeper(keeper keeperIer) {
	keeper.Set(ctxKey, newDataKeeper())
}

func WithContext(ctx context.Context) context.Context {
	keeper := getKeeper(ctx)
	if keeper == nil {
		keeper = newDataKeeper()
	}
	return context.WithValue(ctx, ctxKey, keeper)
}
