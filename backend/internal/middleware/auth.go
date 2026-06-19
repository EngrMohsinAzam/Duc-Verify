package middleware

import (
	"strings"

	"github.com/docverify/backend/internal/auth"
	"github.com/docverify/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func JWTMiddleware(authService *auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			response.Unauthorized(c, "missing authorization header")
			c.Abort()
			return
		}

		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			response.Unauthorized(c, "invalid authorization header format")
			c.Abort()
			return
		}

		claims, err := authService.ValidateToken(parts[1])
		if err != nil {
			response.Unauthorized(c, "invalid or expired token")
			c.Abort()
			return
		}

		c.Set("org_id", claims.OrgID)
		c.Set("org_email", claims.Email)
		c.Next()
	}
}

func OrgID(c *gin.Context) (uuid.UUID, bool) {
	v, ok := c.Get("org_id")
	if !ok {
		return uuid.Nil, false
	}
	id, ok := v.(uuid.UUID)
	return id, ok
}
