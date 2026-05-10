package httpapi

import (
	"github.com/gin-gonic/gin"
	"voting-platform/backend/internal/infrastructure/auth"
)

func RegisterRoutes(r *gin.Engine, h Handler, jwt auth.JWTService) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })
	r.Static("/uploads", "./uploads")

	r.GET("/elections", h.ListElections)
	r.GET("/elections/:id", h.GetElection)
	r.GET("/elections/:id/candidates", h.ListCandidates)
	r.GET("/election-by-slug/:slug", h.GetElectionBySlug)
	r.POST("/vote", h.Vote)
	r.GET("/results/:election_id", h.Results)
	r.POST("/comments", h.Comment)
	r.GET("/candidates/:candidate_id/comments", h.ListComments)
	r.GET("/regions", h.ListRegions)
	r.GET("/election-types", h.ListElectionTypes)

	admin := r.Group("/admin")
	admin.POST("/login", h.Login)
	admin.GET("/elections", h.ListAllElections)
	admin.Use(AuthMiddleware(jwt))
	admin.POST("/election-type", h.CreateElectionType)
	admin.POST("/region", h.CreateRegion)
	admin.POST("/election", h.CreateElection)
	admin.PUT("/election/:id", h.UpdateElection)
	admin.POST("/candidate", h.CreateCandidate)
	admin.PUT("/candidate/:id", h.UpdateCandidate)
	admin.POST("/upload", h.UploadImage)
	admin.PUT("/election/:id/close", h.CloseElection)
	admin.DELETE("/election/:id", h.DeleteElection)
	admin.DELETE("/candidate/:id", h.DeleteCandidate)
	admin.DELETE("/region/:id", h.DeleteRegion)
	admin.DELETE("/election-type/:id", h.DeleteElectionType)
	admin.POST("/add-vote", h.AddVotes)
}
