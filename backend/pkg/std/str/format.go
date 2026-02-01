package str

import (
	"regexp"

	"github.com/xichan96/cortex-lab/pkg/std/sets"
)

func extractVariables(s string) sets.Set[string] {
	re := regexp.MustCompile(`\{([^{}]+)\}`)
	matches := re.FindAllStringSubmatch(s, -1)

	variables := sets.NewSet[string]()
	for _, match := range matches {
		if len(match) > 1 {
			variables.Add(match[1])
		}
	}
	return variables
}
