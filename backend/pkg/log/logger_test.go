package log_test

import (
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/xichan96/cortex-lab/pkg/log"
)

func TestNewLogger(t *testing.T) {
	var logger = log.NewLogger(
		log.WithEnableFile(true),
		log.WithFilename("logs/aigc.log"),
		log.WithLevel(log.InfoLevel),
		log.WithFileMaxSize(1),
		//clog.WithDisableCaller(true),
		//clog.WithDisableConsole(true),
	)
	for i := 0; i < 1; i++ {
		logger.Warn("hellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohellohello")
	}
	time.Sleep(10 * time.Second)

}

func TestNewLogger2(t *testing.T) {
	var logger = log.NewLogger()
	logger.Debug("%s", 1)
	logger.Debugf("%s", 1)
	time.Sleep(10 * time.Second)
	logrus.Debugf("%d", 1)

}

func TestSetGlobal(t *testing.T) {
	log.SetGlobal(
		log.WithRemoveCaller(true),
		log.WithRemoveReserved(true),
		log.WithRemoveTraceID(true),
		log.WithRemoveUserID(true),
		log.WithRemoveLevel(true),
		log.WithFormatType(log.JSONFormat),
	)

	log.Debug("hello")
}

func TestNewLogger3(t *testing.T) {
	var logger = log.NewLogger()

	logger.Debug("11")
	logger.WithTraceID("hhh").Debug("11")
	logger.WithDisableCaller(true).Debug("11")
	logger.Debug("11")
}
