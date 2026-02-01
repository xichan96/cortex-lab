package ec

import (
	"fmt"
	"runtime"
	"strings"

	"github.com/pkg/errors"
)

var errorsFilter []string

type StackTracer interface {
	ErrStack() errors.StackTrace
}

func ErrorCallers(skip int) errors.StackTrace {
	const depth = 32
	var pcs [depth]uintptr
	n := runtime.Callers(skip, pcs[:])
	var stack errors.StackTrace
	for i := 0; i < n; i++ {
		funcName := runtime.FuncForPC(pcs[i]).Name()
		isIgnore := false
		for _, filter := range errorsFilter {
			if strings.HasPrefix(funcName, filter) {
				isIgnore = true
				break
			}
		}
		if isIgnore {
			continue
		}
		stack = append(stack, errors.Frame(pcs[i]))
	}
	return stack
}

func SetStackFilter(filters ...string) {
	errorsFilter = filters
}

func PrintStack(es StackTracer) {
	fmt.Print(es)
	fmt.Printf("%+v\n", es.ErrStack())
	fmt.Println()
}
