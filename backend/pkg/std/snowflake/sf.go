package snowflake

import (
	"errors"
	"math"
	"math/rand"
	"net"
	"sync"
	"time"
)

const timeUnit = 1e7

type Settings struct {
	BitLenTime      uint
	BitLenMachineID uint
	BitLenSequence  uint
	StartTime       time.Time
	AllowPublicIP   bool
	AllowNotIP      bool
	MachineID       func() (uint16, error)
	CheckMachineID  func(uint16) bool
}

type Snowflake struct {
	bitLenTime      uint
	bitLenMachineID uint
	bitLenSequence  uint
	mutex           *sync.Mutex
	startTime       int64
	elapsedTime     int64
	sequence        uint16
	machineID       uint16
}

func NewSnowflake(st Settings) *Snowflake {
	sf := new(Snowflake)
	sf.mutex = new(sync.Mutex)

	totalBits := st.BitLenTime + st.BitLenSequence + st.BitLenMachineID
	if totalBits != 63 || st.BitLenTime == 0 || st.BitLenSequence == 0 || st.BitLenMachineID == 0 {
		return nil
	}
	if st.BitLenTime < 38 {
		return nil
	}
	sf.bitLenTime = st.BitLenTime
	sf.bitLenSequence = st.BitLenSequence
	sf.bitLenMachineID = st.BitLenMachineID
	sf.sequence = uint16(1<<sf.bitLenSequence - 1)

	if st.StartTime.After(time.Now()) {
		return nil
	}
	sf.startTime = toSnowflakeTime(st.StartTime)

	var err error
	if st.MachineID == nil {
		sf.machineID, err = lower16BitPrivateIP(st.AllowPublicIP, st.AllowNotIP)
		max := uint16(math.Pow(2, float64(sf.bitLenMachineID)) - 1)
		if sf.machineID > max {
			return nil
		}
	} else {
		sf.machineID, err = st.MachineID()
	}
	if err != nil || (st.CheckMachineID != nil && !st.CheckMachineID(sf.machineID)) {
		return nil
	}

	return sf
}

func (sf *Snowflake) NextID() (id uint64, error error) {
	maskSequence := uint16(1<<sf.bitLenSequence - 1)

	sf.mutex.Lock()
	defer sf.mutex.Unlock()

	current := currentElapsedTime(sf.startTime)
	if sf.elapsedTime < current {
		sf.elapsedTime = current
		sf.sequence = 0
	} else {
		sf.sequence = (sf.sequence + 1) & maskSequence
		if sf.sequence == 0 {
			sf.elapsedTime++
			overtime := sf.elapsedTime - current
			time.Sleep(sleepTime(overtime))
		}
	}

	return sf.toID()
}

func toSnowflakeTime(t time.Time) int64 {
	return t.UTC().UnixNano() / timeUnit
}

func currentElapsedTime(startTime int64) int64 {
	return toSnowflakeTime(time.Now()) - startTime
}

func sleepTime(overtime int64) time.Duration {
	return time.Duration(overtime)*10*time.Millisecond -
		time.Duration(time.Now().UTC().UnixNano()%timeUnit)*time.Nanosecond
}

func (sf *Snowflake) toID() (id uint64, error error) {
	if sf.elapsedTime >= 1<<sf.bitLenTime {
		return 0, errors.New("over the time limit")
	}
	return uint64(sf.elapsedTime)<<(sf.bitLenSequence+sf.bitLenMachineID) |
		uint64(sf.machineID)<<sf.bitLenSequence |
		uint64(sf.sequence), nil
}

func isPrivateIPv4(ip net.IP) bool {
	return ip != nil &&
		(ip[0] == 10 || ip[0] == 172 && (ip[1] >= 16 && ip[1] < 32) || ip[0] == 192 && ip[1] == 168)
}

func getIPv4(allowPublicIP bool) (ip net.IP, error error) {
	as, err := net.InterfaceAddrs()
	if err != nil {
		return nil, err
	}

	for _, a := range as {
		ipnet, ok := a.(*net.IPNet)
		if !ok || ipnet.IP.IsLoopback() {
			continue
		}

		ip := ipnet.IP.To4()
		if ip == nil {
			continue
		}
		if allowPublicIP || isPrivateIPv4(ip) {
			return ip, nil
		}
	}
	return nil, errors.New("no ip address")
}

func lower16BitPrivateIP(allowPublicIP, allowNotIP bool) (lowerIP uint16, err error) {
	ip, err := getIPv4(allowPublicIP)
	if err == nil {
		return uint16(ip[2])<<8 + uint16(ip[3]), nil
	}

	if allowNotIP {
		ip2 := rand.Int31n(255)
		ip3 := rand.Int31n(255)
		return uint16(ip2<<8 + ip3), nil
	}

	return 0, err
}

func (sf *Snowflake) Decompose(id uint64) map[string]uint64 {
	maskSequence := uint64(1<<sf.bitLenSequence - 1)
	maskMachineID := uint64(1<<sf.bitLenMachineID-1) << sf.bitLenSequence
	msb := id >> 63
	tm := id >> (sf.bitLenSequence + sf.bitLenMachineID)
	sequence := id & maskSequence
	machineID := id & maskMachineID >> sf.bitLenSequence
	return map[string]uint64{
		"id":         id,
		"msb":        msb,
		"time":       tm,
		"sequence":   sequence,
		"machine-id": machineID,
	}
}
