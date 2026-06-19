package auth

import (
	"errors"

	"github.com/docverify/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type registerRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=255"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=72"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register godoc
// @Summary Register a new organization
// @Tags auth
// @Accept json
// @Produce json
// @Param body body registerRequest true "Registration payload"
// @Success 201 {object} response.Envelope
// @Failure 400 {object} response.Envelope
// @Failure 409 {object} response.Envelope
// @Router /api/auth/register [post]
func (h *Handler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	result, err := h.service.Register(c.Request.Context(), RegisterInput{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrEmailTaken):
			response.Conflict(c, "email already registered")
		case errors.Is(err, ErrInvalidInput):
			response.BadRequest(c, "invalid registration data")
		default:
			response.Internal(c, "failed to register")
		}
		return
	}

	response.Created(c, result)
}

// Login godoc
// @Summary Login organization
// @Tags auth
// @Accept json
// @Produce json
// @Param body body loginRequest true "Login payload"
// @Success 200 {object} response.Envelope
// @Failure 400 {object} response.Envelope
// @Failure 401 {object} response.Envelope
// @Router /api/auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	result, err := h.service.Login(c.Request.Context(), LoginInput{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidCredentials):
			response.Unauthorized(c, "invalid email or password")
		case errors.Is(err, ErrInvalidInput):
			response.BadRequest(c, "invalid login data")
		default:
			response.Internal(c, "failed to login")
		}
		return
	}

	response.OK(c, result)
}

// Me godoc
// @Summary Get current organization profile
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Envelope
// @Failure 401 {object} response.Envelope
// @Router /api/auth/me [get]
func (h *Handler) Me(c *gin.Context) {
	orgID, ok := c.Get("org_id")
	if !ok {
		response.Unauthorized(c, "missing organization context")
		return
	}

	org, err := h.service.GetOrganization(c.Request.Context(), orgID.(uuid.UUID))
	if err != nil {
		response.NotFound(c, "organization not found")
		return
	}

	response.OK(c, OrganizationResponse{
		ID:    org.ID,
		Name:  org.Name,
		Email: org.Email,
	})
}
