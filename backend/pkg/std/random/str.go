// Package random
// @Description:
// @Date: 2022/8/16
package random

import (
	"math/rand"
	"time"
	"unsafe"

	"github.com/xichan96/cortex-lab/pkg/std/str"
)

var src = rand.NewSource(time.Now().UnixNano())

func RandHexNumber(n int) string {
	return randomString(str.Numbers, n)
}

func randomString(s string, n int) string {
	idxBits, idxMask, idxMax := getIdx(len(str.LetterNums))
	b := make([]byte, n)
	for i, cache, remain := n-1, src.Int63(), idxMax; i >= 0; {
		if remain == 0 {
			cache, remain = src.Int63(), idxMax
		}
		if idx := int(cache) & idxMask; idx < len(s) {
			b[i] = s[idx]
			i--
		}
		cache >>= idxBits
		remain--
	}
	return *(*string)(unsafe.Pointer(&b))
}

func getIdx(n int) (idxBits, idxMask, idxMax int) {
	i := 0
	for n != 0 {
		n >>= 1
		i++
	}
	return i, 1<<i - 1, 63 / i
}
