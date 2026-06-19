package audit

import (
	"context"
	"time"

	"github.com/docverify/backend/internal/models"
	"github.com/google/uuid"
)

type TrendPoint struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type ActivityItem struct {
	Action        string    `json:"action"`
	ShortID       string    `json:"short_id,omitempty"`
	RecipientName string    `json:"recipient_name,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

func (l *Logger) CountByAction(ctx context.Context, orgID uuid.UUID, action string) (int64, error) {
	var count int64
	err := l.db.WithContext(ctx).Model(&models.AuditLog{}).
		Where("org_id = ? AND action = ?", orgID, action).
		Count(&count).Error
	return count, err
}

func (l *Logger) CountByActionSince(ctx context.Context, orgID uuid.UUID, action string, since time.Time) (int64, error) {
	var count int64
	err := l.db.WithContext(ctx).Model(&models.AuditLog{}).
		Where("org_id = ? AND action = ? AND created_at >= ?", orgID, action, since).
		Count(&count).Error
	return count, err
}

func (l *Logger) VerificationTrend(ctx context.Context, orgID uuid.UUID, days int) ([]TrendPoint, error) {
	since := time.Now().UTC().AddDate(0, 0, -days+1).Truncate(24 * time.Hour)

	type row struct {
		Day   time.Time
		Count int64
	}
	var rows []row

	err := l.db.WithContext(ctx).Model(&models.AuditLog{}).
		Select("DATE(created_at) as day, COUNT(*) as count").
		Where("org_id = ? AND action = ? AND created_at >= ?", orgID, models.AuditViewed, since).
		Group("DATE(created_at)").
		Order("day ASC").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	countByDay := make(map[string]int64, len(rows))
	for _, r := range rows {
		countByDay[r.Day.Format("2006-01-02")] = r.Count
	}

	points := make([]TrendPoint, days)
	for i := 0; i < days; i++ {
		day := since.AddDate(0, 0, i)
		key := day.Format("2006-01-02")
		points[i] = TrendPoint{Date: key, Count: countByDay[key]}
	}
	return points, nil
}

func (l *Logger) RecentActivity(ctx context.Context, orgID uuid.UUID, limit int) ([]ActivityItem, error) {
	if limit < 1 || limit > 50 {
		limit = 10
	}

	type row struct {
		Action        string
		ShortID       *string
		RecipientName *string
		CreatedAt     time.Time
	}
	var rows []row

	err := l.db.WithContext(ctx).
		Table("audit_logs AS al").
		Select("al.action, d.short_id, d.recipient_name, al.created_at").
		Joins("LEFT JOIN documents d ON d.id = al.doc_id").
		Where("al.org_id = ?", orgID).
		Order("al.created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	items := make([]ActivityItem, len(rows))
	for i, r := range rows {
		item := ActivityItem{Action: r.Action, CreatedAt: r.CreatedAt}
		if r.ShortID != nil {
			item.ShortID = *r.ShortID
		}
		if r.RecipientName != nil {
			item.RecipientName = *r.RecipientName
		}
		items[i] = item
	}
	return items, nil
}

func (l *Logger) VerificationCountsByDoc(ctx context.Context, orgID uuid.UUID) (map[string]int64, error) {
	type row struct {
		DocID uuid.UUID
		Count int64
	}
	var rows []row

	err := l.db.WithContext(ctx).Model(&models.AuditLog{}).
		Select("doc_id, COUNT(*) as count").
		Where("org_id = ? AND action = ? AND doc_id IS NOT NULL", orgID, models.AuditViewed).
		Group("doc_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	out := make(map[string]int64, len(rows))
	for _, r := range rows {
		out[r.DocID.String()] = r.Count
	}
	return out, nil
}
