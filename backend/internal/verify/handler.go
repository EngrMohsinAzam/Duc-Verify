package verify

import (
	"errors"

	"github.com/docverify/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Verify godoc
// @Summary Public document verification
// @Tags verify
// @Produce json
// @Param short_id path string true "Document short ID"
// @Success 200 {object} response.Envelope
// @Failure 404 {object} response.Envelope
// @Router /api/verify/{short_id} [get]
func (h *Handler) Verify(c *gin.Context) {
	shortID := c.Param("short_id")
	if shortID == "" {
		response.BadRequest(c, "short_id is required")
		return
	}

	result, err := h.service.VerifyByShortID(c.Request.Context(), shortID, c.ClientIP())
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.NotFound(c, "document not found")
			return
		}
		response.Internal(c, "verification failed")
		return
	}

	response.OK(c, result)
}

func (h *Handler) Preview(c *gin.Context) {
	shortID := c.Param("short_id")
	if shortID == "" {
		response.BadRequest(c, "short_id is required")
		return
	}

	file, err := h.service.GetPreview(c.Request.Context(), shortID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			response.NotFound(c, "document not found")
			return
		}
		response.Internal(c, "failed to load document preview")
		return
	}

	c.Header("Content-Type", file.ContentType)
	c.Header("Content-Disposition", "inline; filename=\""+file.Filename+"\"")
	c.Data(200, file.ContentType, file.Data)
}
