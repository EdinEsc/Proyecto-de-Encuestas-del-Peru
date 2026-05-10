package httpapi

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"voting-platform/backend/internal/infrastructure/auth"
)

func RealIP(c *gin.Context) string {
	if xff := c.GetHeader("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xrip := c.GetHeader("X-Real-IP"); xrip != "" {
		return xrip
	}
	return c.ClientIP()
}

func AuthMiddleware(jwt auth.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		if h == "" {
			h = c.GetHeader("authorization")
		}

		if h == "" || !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "autorización requerida (Bearer token faltante)"})
			return
		}

		tokenString := strings.TrimPrefix(h, "Bearer ")
		claims, err := jwt.Validate(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token inválido o expirado: " + err.Error()})
			return
		}

		if claims.Role != "admin" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "acceso denegado: se requiere rol de administrador"})
			return
		}

		c.Set("user", claims)
		c.Next()
	}
}
