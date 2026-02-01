package sets

type Set[T comparable] map[T]struct{}

func NewSet[T comparable](es ...T) Set[T] {
	s := Set[T]{}
	s.Add(es...)
	return s
}

func (s Set[T]) Add(es ...T) {
	for _, e := range es {
		s[e] = struct{}{}
	}
}

func (s Set[T]) Has(v T) bool {
	_, ok := s[v]
	return ok
}
