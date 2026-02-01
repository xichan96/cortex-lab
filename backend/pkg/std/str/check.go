// Package str
// @Description:
// @Date: 2022/8/17
package str

func IsEmpty(s string) bool {
	return len(s) == 0
}

func IsBlank(s string) bool {
	for _, b := range s {
		if b != ' ' {
			return false
		}
	}
	return true
}
