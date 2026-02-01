// Package str
// @Description:
// @Date: 2022/7/11
package str

import "unsafe"

func UnsafeString(bs []byte) string {
	return *(*string)(unsafe.Pointer(&bs))
}

func UnsafeBytes(s string) []byte {
	x := (*[2]uintptr)(unsafe.Pointer(&s))
	h := [3]uintptr{x[0], x[1], x[1]}
	return *(*[]byte)(unsafe.Pointer(&h))
}
