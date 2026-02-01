package experience

import (
	"context"
	"strings"

	"github.com/go-ego/gse"
	"github.com/jinzhu/copier"
	"github.com/xichan96/cortex-lab/internal/appdto"
	"github.com/xichan96/cortex-lab/internal/infra/model"
	"github.com/xichan96/cortex-lab/internal/infra/persist"
	"gorm.io/gorm"
)

type AppIer interface {
	CreateExperience(ctx context.Context, userID, roleID string, req *appdto.CreateExperienceReq) (string, error)
	UpdateExperience(ctx context.Context, req *appdto.UpdateExperienceReq) error
	DeleteExperience(ctx context.Context, id string) error
	GetExperience(ctx context.Context, id string) (*appdto.Experience, error)
	GetExperienceList(ctx context.Context, roleID string, req *appdto.GetExperienceReq) ([]*appdto.Experience, int64, error)
	SearchExperience(ctx context.Context, roleID string, keywords []string) ([]*appdto.Experience, error)
}

type app struct {
	kp   persist.ExperiencePersistIer
	rkrp persist.RoleExperienceRelationPersistIer
	seg  gse.Segmenter
}

func NewApp(kp persist.ExperiencePersistIer, rkrp persist.RoleExperienceRelationPersistIer) AppIer {
	var seg gse.Segmenter
	// Use embedded dictionary to avoid file path issues in Docker
	seg.LoadDictEmbed()
	return &app{kp: kp, rkrp: rkrp, seg: seg}
}

func (a *app) CreateExperience(ctx context.Context, userID, roleID string, req *appdto.CreateExperienceReq) (string, error) {
	var sourceID *string
	if req.SourceID != "" {
		sourceID = &req.SourceID
	}
	k := &model.Experience{
		Type:      req.Type,
		Title:     req.Title,
		Content:   req.Content,
		SourceID:  sourceID,
		Tags:      req.Tags,
		CreatedBy: userID,
	}
	id, err := a.kp.Create(ctx, k)
	if err != nil {
		return "", err
	}

	// Create Role Relation
	if roleID != "" {
		err = a.rkrp.Create(ctx, &model.RoleExperienceRelation{
			RoleID:       roleID,
			ExperienceID: id,
		})
		if err != nil {
			// Best effort or rollback? For now, log error or return.
			// Ideally we should use transaction.
			// But for simplicity, we return error.
			return id, err
		}
	}

	return id, nil
}

func (a *app) UpdateExperience(ctx context.Context, req *appdto.UpdateExperienceReq) error {
	k, err := a.kp.GetByID(ctx, req.ID)
	if err != nil {
		return err
	}

	if req.Content != "" {
		k.Content = req.Content
	}
	if req.Title != "" {
		k.Title = req.Title
	}
	if req.Tags != "" {
		k.Tags = req.Tags
	}

	return a.kp.Update(ctx, k)
}

func (a *app) DeleteExperience(ctx context.Context, id string) error {
	k, err := a.kp.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return a.kp.Delete(ctx, k)
}

func (a *app) GetExperience(ctx context.Context, id string) (*appdto.Experience, error) {
	k, err := a.kp.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	dto := &appdto.Experience{}
	copier.Copy(dto, k)
	return dto, nil
}

func (a *app) GetExperienceList(ctx context.Context, roleID string, req *appdto.GetExperienceReq) ([]*appdto.Experience, int64, error) {
	opts := []func(*gorm.DB) *gorm.DB{}

	if roleID != "" {
		// Subquery to find knowledge IDs for the role
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			subQuery := db.Session(&gorm.Session{NewDB: true}).Table(model.TableRoleExperienceRelation).Select("experience_id").Where("role_id = ?", roleID)
			return db.Where("id IN (?)", subQuery)
		})
	}

	if req.Type != "" {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Where("type = ?", req.Type)
		})
	}

	keyword := req.Keyword
	if keyword == "" && req.Q != "" {
		keyword = req.Q
	}

	if keyword != "" {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			return db.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
		})
	}

	total, err := a.kp.Count(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}

	if req.Page > 0 && req.PageSize > 0 {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			offset := (req.Page - 1) * req.PageSize
			return db.Offset(offset).Limit(req.PageSize)
		})
	}

	list, err := a.kp.GetList(ctx, opts...)
	if err != nil {
		return nil, 0, err
	}
	dtos := make([]*appdto.Experience, len(list))
	for i, k := range list {
		dto := &appdto.Experience{}
		copier.Copy(dto, k)
		dtos[i] = dto
	}
	return dtos, total, nil
}

func (a *app) SearchExperience(ctx context.Context, roleID string, keywords []string) ([]*appdto.Experience, error) {
	if len(keywords) == 0 {
		return []*appdto.Experience{}, nil
	}
	segmentedKeywords := make(map[string]bool)
	for _, keyword := range keywords {
		words := strings.Split(keyword, " ")
		for _, word := range words {
			if word != "" && len(word) > 0 {
				segmentedKeywords[word] = true
			}
		}
	}
	keywords = make([]string, 0, len(segmentedKeywords))
	for word := range segmentedKeywords {
		keywords = append(keywords, word)
	}
	opts := []func(*gorm.DB) *gorm.DB{}

	if roleID != "" {
		opts = append(opts, func(db *gorm.DB) *gorm.DB {
			subQuery := db.Session(&gorm.Session{NewDB: true}).Table(model.TableRoleExperienceRelation).Select("experience_id").Where("role_id = ?", roleID)
			return db.Where("id IN (?)", subQuery)
		})
	}

	opts = append(opts, func(db *gorm.DB) *gorm.DB {
		if len(keywords) == 0 {
			return db
		}
		for i, k := range keywords {
			pattern := "%" + k + "%"
			if i == 0 {
				db = db.Where("title LIKE ? OR content LIKE ?", pattern, pattern)
			} else {
				db = db.Or("title LIKE ? OR content LIKE ?", pattern, pattern)
			}
		}
		return db
	})

	list, err := a.kp.GetList(ctx, opts...)
	if err != nil {
		return nil, err
	}

	dtos := make([]*appdto.Experience, len(list))
	for i, k := range list {
		dto := &appdto.Experience{}
		copier.Copy(dto, k)
		dtos[i] = dto
	}
	return dtos, nil
}
