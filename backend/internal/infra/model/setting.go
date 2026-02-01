package model

import (
	"time"

	"github.com/xichan96/cortex-lab/pkg/sql"
	"gorm.io/gen/field"
)

const TableSetting = "setting"

// NewGlobalFieldMetaMapping(struct, fieldMeta, as)
var SettingFM = sql.NewGlobalFieldMetaMapping(Setting{}, SettingFieldMeta{})

// Setting is .
type Setting struct {
	Group     string    `json:"group" gorm:"primaryKey;column:group;type:varchar(64);comment:group"` // 联合主键 group
	Key       string    `json:"key" gorm:"primaryKey;column:key;type:varchar(64);comment:key"`       // 联合主键 key
	Value     string    `json:"value" gorm:"column:value;type:text;not null;comment:value"`          // value
	CreatedAt time.Time `json:"created_at" gorm:"column:created_at;type:timestamp;not null;default:CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `json:"updated_at" gorm:"column:updated_at;type:timestamp;not null;default:CURRENT_TIMESTAMP"`
}

func (Setting) TableName() string {
	return TableSetting
}

type SettingFieldMeta struct {
	// []byte => field.Bytes
	// bool => field.Bool
	// int/int8/int16/int32/int64 => field.Int
	// uint/uint8/uint16/uint32/uint64 => field.Uint
	// float32/float64 => field.Float64
	// string => field.String
	// time.Time/*time.Time => field.Time
	sql.CTable
	ALL       field.Asterisk
	Group     field.String
	Key       field.String
	Value     field.String
	CreatedAt field.Time
	UpdatedAt field.Time
}
