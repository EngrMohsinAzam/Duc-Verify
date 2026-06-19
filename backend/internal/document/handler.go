package document

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/docverify/backend/internal/middleware"
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

// Upload godoc
// @Summary Upload a document
// @Tags documents
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "Document file"
// @Param recipient_name formData string true "Recipient name"
// @Param doc_type formData string false "Document type"
// @Param expires_at formData string false "Expiry date (RFC3339)"
// @Success 201 {object} response.Envelope
// @Router /api/docs [post]
func (h *Handler) Upload(c *gin.Context) {
	orgID, ok := middleware.OrgID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		response.BadRequest(c, "file is required")
		return
	}
	defer file.Close()

	recipient := c.PostForm("recipient_name")
	docType := c.PostForm("doc_type")

	var expiresAt *time.Time
	if raw := c.PostForm("expires_at"); raw != "" {
		t, err := time.Parse(time.RFC3339, raw)
		if err != nil {
			response.BadRequest(c, "expires_at must be RFC3339 format")
			return
		}
		expiresAt = &t
	}

	result, err := h.service.Upload(c.Request.Context(), UploadInput{
		OrgID:         orgID,
		RecipientName: recipient,
		DocType:       docType,
		ExpiresAt:     expiresAt,
		Filename:      header.Filename,
		ContentType:   header.Header.Get("Content-Type"),
		File:          file,
		IP:            c.ClientIP(),
	})
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidUpload):
			response.BadRequest(c, "invalid upload data")
		case errors.Is(err, ErrFileTooLarge):
			response.Error(c, http.StatusRequestEntityTooLarge, "file_too_large", "file exceeds maximum allowed size")
		case errors.Is(err, ErrUnsupportedType):
			response.BadRequest(c, "unsupported file type")
		default:
			response.Internal(c, "failed to upload document")
		}
		return
	}

	response.Created(c, result)
}

// List godoc
// @Summary List organization documents
// @Tags documents
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Param status query string false "Filter by status"
// @Success 200 {object} response.Envelope
// @Router /api/docs [get]
func (h *Handler) List(c *gin.Context) {
	orgID, ok := middleware.OrgID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	status := c.Query("status")

	docs, total, err := h.service.List(c.Request.Context(), ListFilter{
		OrgID:    orgID,
		Status:   status,
		Page:     page,
		PageSize: pageSize,
	})
	if err != nil {
		response.Internal(c, "failed to list documents")
		return
	}

	response.OKWithMeta(c, docs, gin.H{
		"page":      page,
		"page_size": pageSize,
		"total":     total,
	})
}

// Get godoc
// @Summary Get document by ID
// @Tags documents
// @Produce json
// @Security BearerAuth
// @Param id path string true "Document ID"
// @Success 200 {object} response.Envelope
// @Router /api/docs/{id} [get]
func (h *Handler) Get(c *gin.Context) {
	orgID, ok := middleware.OrgID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid document id")
		return
	}

	doc, err := h.service.GetByID(c.Request.Context(), id, orgID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.NotFound(c, "document not found")
			return
		}
		response.Internal(c, "failed to get document")
		return
	}

	response.OK(c, doc)
}

// Revoke godoc
// @Summary Revoke a document
// @Tags documents
// @Produce json
// @Security BearerAuth
// @Param id path string true "Document ID"
// @Success 200 {object} response.Envelope
// @Router /api/docs/{id}/revoke [patch]
func (h *Handler) Revoke(c *gin.Context) {
	orgID, ok := middleware.OrgID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid document id")
		return
	}

	doc, err := h.service.Revoke(c.Request.Context(), id, orgID, c.ClientIP())
	if err != nil {
		switch {
		case errors.Is(err, ErrNotFound):
			response.NotFound(c, "document not found")
		case errors.Is(err, ErrAlreadyRevoked):
			response.Conflict(c, "document already revoked")
		default:
			response.Internal(c, "failed to revoke document")
		}
		return
	}

	response.OK(c, doc)
}

// Stats godoc
// @Summary Dashboard analytics
// @Tags documents
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Envelope
// @Router /api/docs/stats [get]
func (h *Handler) Stats(c *gin.Context) {
	orgID, ok := middleware.OrgID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	stats, err := h.service.DashboardStats(c.Request.Context(), orgID)
	if err != nil {
		response.Internal(c, "failed to load dashboard stats")
		return
	}

	response.OK(c, stats)
}

// DownloadPDF godoc
// @Summary Download PDF certificate
// @Tags documents
// @Produce application/pdf
// @Security BearerAuth
// @Param id path string true "Document ID"
// @Success 200 {file} binary
// @Router /api/docs/{id}/pdf [get]
func (h *Handler) DownloadPDF(c *gin.Context) {
	orgID, ok := middleware.OrgID(c)
	if !ok {
		response.Unauthorized(c, "unauthorized")
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid document id")
		return
	}

	pdfBytes, filename, err := h.service.GeneratePDF(c.Request.Context(), id, orgID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.NotFound(c, "document not found")
			return
		}
		response.Internal(c, "failed to generate pdf")
		return
	}

	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Data(http.StatusOK, "application/pdf", pdfBytes)
}
