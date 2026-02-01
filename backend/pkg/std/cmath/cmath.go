package cmath

import (
	"math"

	"golang.org/x/exp/constraints"
)

func RoundFloat[T constraints.Float](num T, decimalPlaces int) T {
	power := math.Pow(10, float64(decimalPlaces))
	rounded := T(math.Round(float64(num)*power) / power)
	return rounded
}
