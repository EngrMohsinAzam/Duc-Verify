package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/docverify/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailTaken         = errors.New("email already registered")
	ErrInvalidInput       = errors.New("invalid input")
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, org *models.Organization) error {
	return r.db.WithContext(ctx).Create(org).Error
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (*models.Organization, error) {
	var org models.Organization
	err := r.db.WithContext(ctx).Where("email = ?", strings.ToLower(email)).First(&org).Error
	if err != nil {
		return nil, err
	}
	return &org, nil
}

func (r *Repository) FindByID(ctx context.Context, id uuid.UUID) (*models.Organization, error) {
	var org models.Organization
	err := r.db.WithContext(ctx).First(&org, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &org, nil
}

type Service struct {
	repo      *Repository
	jwtSecret []byte
	jwtExpiry time.Duration
}

func NewService(repo *Repository, jwtSecret string, jwtExpiry time.Duration) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
		jwtExpiry: jwtExpiry,
	}
}

type RegisterInput struct {
	Name     string
	Email    string
	Password string
}

type LoginInput struct {
	Email    string
	Password string
}

type AuthResult struct {
	Token string                `json:"token"`
	Org   OrganizationResponse  `json:"organization"`
}

type OrganizationResponse struct {
	ID    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Email string    `json:"email"`
}

type Claims struct {
	OrgID uuid.UUID `json:"org_id"`
	Email string    `json:"email"`
	jwt.RegisteredClaims
}

func (s *Service) Register(ctx context.Context, input RegisterInput) (*AuthResult, error) {
	name := strings.TrimSpace(input.Name)
	email := strings.ToLower(strings.TrimSpace(input.Email))
	password := input.Password

	if name == "" || email == "" || len(password) < 8 {
		return nil, ErrInvalidInput
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	org := &models.Organization{
		Name:         name,
		Email:        email,
		PasswordHash: string(hash),
	}

	if err := s.repo.Create(ctx, org); err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) || strings.Contains(err.Error(), "duplicate") {
			return nil, ErrEmailTaken
		}
		return nil, err
	}

	token, err := s.generateToken(org)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		Token: token,
		Org: OrganizationResponse{
			ID:    org.ID,
			Name:  org.Name,
			Email: org.Email,
		},
	}, nil
}

func (s *Service) Login(ctx context.Context, input LoginInput) (*AuthResult, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if email == "" || input.Password == "" {
		return nil, ErrInvalidInput
	}

	org, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(org.PasswordHash), []byte(input.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	token, err := s.generateToken(org)
	if err != nil {
		return nil, err
	}

	return &AuthResult{
		Token: token,
		Org: OrganizationResponse{
			ID:    org.ID,
			Name:  org.Name,
			Email: org.Email,
		},
	}, nil
}

func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func (s *Service) generateToken(org *models.Organization) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		OrgID: org.ID,
		Email: org.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   org.ID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.jwtExpiry)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

func (s *Service) GetOrganization(ctx context.Context, id uuid.UUID) (*models.Organization, error) {
	return s.repo.FindByID(ctx, id)
}
