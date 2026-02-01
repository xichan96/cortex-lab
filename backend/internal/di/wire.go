//go:build wireinject
// +build wireinject

package di

import (
	"github.com/google/wire"
	"github.com/xichan96/cortex-lab/internal/app/agent"
	"github.com/xichan96/cortex-lab/internal/app/chat"
	"github.com/xichan96/cortex-lab/internal/app/experience"
	"github.com/xichan96/cortex-lab/internal/app/role"
	"github.com/xichan96/cortex-lab/internal/app/setting"
	"github.com/xichan96/cortex-lab/internal/app/user"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
)

var UserAppSet = wire.NewSet(
	persist.NewUserPersist,
)

func NewUserApp() user.AppIer {
	panic(wire.Build(
		UserAppSet,
		user.NewApp,
	))
}

var UserApp = NewUserApp()

var RoleAppSet = wire.NewSet(
	persist.NewRolePersist,
)

func NewRoleApp() role.AppIer {
	panic(wire.Build(
		RoleAppSet,
		role.NewApp,
	))
}

var RoleApp = NewRoleApp()

var ExperienceAppSet = wire.NewSet(
	persist.NewExperiencePersist,
	persist.NewRoleExperienceRelationPersist,
)

func NewExperienceApp() experience.AppIer {
	panic(wire.Build(
		ExperienceAppSet,
		experience.NewApp,
	))
}

var ExperienceApp = NewExperienceApp()

var SettingAppSet = wire.NewSet(
	persist.NewSettingPersist,
)

func NewSettingApp() setting.AppIer {
	panic(wire.Build(
		SettingAppSet,
		setting.NewApp,
	))
}

var SettingApp = NewSettingApp()

var AgentAppSet = wire.NewSet(
	SettingAppSet,
	setting.NewApp,
)

func NewAgentApp() agent.AppIer {
	panic(wire.Build(
		AgentAppSet,
		agent.NewApp,
	))
}

var AgentApp = NewAgentApp()

var ChatAppSet = wire.NewSet(
	persist.NewChatSessionPersist,
	persist.NewChatMessagePersist,
	NewRoleApp,
	NewSettingApp,
	NewExperienceApp,
	chat.NewApp,
)

func NewChatApp() chat.AppIer {
	panic(wire.Build(
		ChatAppSet,
	))
}

var ChatApp = NewChatApp()
