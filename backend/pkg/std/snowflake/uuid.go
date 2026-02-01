package snowflake

import (
	"fmt"
	"log"
	"sync"
	"time"
)

var sf *Snowflake
var sfOnce = sync.Once{}

const (
	BitLenTime      = 39
	BitLenMachineID = 16
	BitLenSequence  = 63 - BitLenTime - BitLenMachineID
)

var startTime = time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)

var st = Settings{
	AllowPublicIP:   true,
	BitLenTime:      BitLenTime,
	BitLenMachineID: BitLenMachineID,
	BitLenSequence:  BitLenSequence,
	StartTime:       time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC),
}

func InitSetting(s Settings) {
	if s.StartTime.IsZero() {
		s.StartTime = startTime
	}
	if s.BitLenSequence == 0 && s.BitLenMachineID == 0 && s.BitLenTime == 0 {
		s.BitLenTime = BitLenTime
		s.BitLenMachineID = BitLenMachineID
		s.BitLenSequence = BitLenSequence
	}
	st = s
}

func NewUUID() string {
	sfOnce.Do(func() {
		sf = NewSnowflake(st)
		if sf == nil {
			log.Fatal("snowflake not created")
		}
	})
	i, _ := sf.NextID()
	return fmt.Sprintf("%0.16x", i)
}
