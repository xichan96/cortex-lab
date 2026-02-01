package errcode

import "github.com/xichan96/cortex-lab/pkg/ec"

var baseErr = ec.NewErrorCode(1000, "base error")
var ErrCodeInvalid = ec.NewErrorCode(1001, "invalid code")
var ErrAdminNotFound = ec.NewErrorCode(1002, "admin not found")
var ErrCodeSend = ec.NewErrorCode(1003, "code send failed")
var UserPasswordError = ec.NewErrorCode(1004, "username or password error")
var UsernameExisted = ec.NewErrorCode(1005, "username already exists")
var EmailExisted = ec.NewErrorCode(1006, "email already exists")
var UserNotFound = ec.NewErrorCode(1007, "user not found")
var SkillNameExisted = ec.NewErrorCode(1008, "skill name already exists")
