package document

import (
	"context"
	"errors"

	"github.com/docverify/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ListFilter struct {
	OrgID    uuid.UUID
	Status   string
	Page     int
	PageSize int
}

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, doc *models.Document) error {
	return r.db.WithContext(ctx).Create(doc).Error
}

func (r *Repository) FindByIDAndOrg(ctx context.Context, id, orgID uuid.UUID) (*models.Document, error) {
	var doc models.Document
	err := r.db.WithContext(ctx).
		Preload("Organization").
		Where("id = ? AND org_id = ?", id, orgID).
		First(&doc).Error
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

func (r *Repository) FindByShortID(ctx context.Context, shortID string) (*models.Document, error) {
	var doc models.Document
	err := r.db.WithContext(ctx).
		Preload("Organization").
		Where("short_id = ?", shortID).
		First(&doc).Error
	if err != nil {
		return nil, err
	}
	return &doc, nil
}

func (r *Repository) ShortIDExists(ctx context.Context, shortID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Document{}).Where("short_id = ?", shortID).Count(&count).Error
	return count > 0, err
}

func (r *Repository) ListByOrg(ctx context.Context, filter ListFilter) ([]models.Document, int64, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 || filter.PageSize > 100 {
		filter.PageSize = 20
	}

	q := r.db.WithContext(ctx).Model(&models.Document{}).Where("org_id = ?", filter.OrgID)
	if filter.Status != "" {
		q = q.Where("status = ?", filter.Status)
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	var docs []models.Document
	offset := (filter.Page - 1) * filter.PageSize
	err := q.Order("created_at DESC").Offset(offset).Limit(filter.PageSize).Find(&docs).Error
	return docs, total, err
}

func (r *Repository) UpdateStatus(ctx context.Context, id, orgID uuid.UUID, status string) error {
	res := r.db.WithContext(ctx).
		Model(&models.Document{}).
		Where("id = ? AND org_id = ?", id, orgID).
		Update("status", status)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *Repository) MarkExpired(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Document{}).
		Where("id = ? AND status = ?", id, models.DocStatusValid).
		Update("status", models.DocStatusExpired).Error
}

var ErrNotFound = errors.New("document not found")
