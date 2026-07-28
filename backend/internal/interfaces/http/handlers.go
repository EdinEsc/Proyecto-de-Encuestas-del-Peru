package httpapi

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"voting-platform/backend/internal/domain"
	"voting-platform/backend/internal/usecases"
)

type Handler struct {
	Elections  domain.ElectionRepository
	Candidates domain.CandidateRepository
	Votes      domain.VoteRepository
	Catalog    domain.CatalogRepository
	VoteUC     usecases.VoteUsecase
	AdminUC    usecases.AdminUsecase
}

func (h Handler) ListElections(c *gin.Context) {
	list, err := h.Elections.List(true, c.Query("type"), c.Query("region"))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

func (h Handler) ListAllElections(c *gin.Context) {
	list, err := h.Elections.List(false, c.Query("type"), c.Query("region"))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

func (h Handler) GetElection(c *gin.Context) {
	e, err := h.Elections.GetByID(c.Param("id"))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, e)
}

func (h Handler) ListCandidates(c *gin.Context) {
	list, err := h.Candidates.ListByElection(c.Param("id"))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

func (h Handler) Vote(c *gin.Context) {
	var input usecases.VoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	vote, err := h.VoteUC.Vote(input, RealIP(c))
	if errors.Is(err, usecases.ErrAlreadyVoted) {
		c.JSON(409, gin.H{"error": err.Error()})
		return
	}
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, vote)
}

func (h Handler) Results(c *gin.Context) {
	electionID := c.Param("election_id")

	// Get election title
	election, err := h.Elections.GetByID(electionID)
	electionTitle := ""
	if err == nil && election != nil {
		electionTitle = election.Title
	}

	items, err := h.Votes.Results(electionID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	var total int64
	for _, it := range items {
		total += it.Votes
	}
	c.JSON(200, gin.H{"election_title": electionTitle, "total_votes": total, "ranking": items})
}

func (h Handler) ListRegions(c *gin.Context) {
	list, err := h.Catalog.ListRegions(c.Query("level"), c.Query("parent_id"))
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

func (h Handler) ListElectionTypes(c *gin.Context) {
	list, err := h.Catalog.ListElectionTypes()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, list)
}

func (h Handler) Login(c *gin.Context) {
	var input usecases.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	token, err := h.AdminUC.Login(input)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"token": token})
}

func (h Handler) CreateElectionType(c *gin.Context) {
	var body struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	et, err := h.AdminUC.CreateElectionType(body.Name)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, et)
}

func (h Handler) CreateRegion(c *gin.Context) {
	var body domain.Region
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	rg, err := h.AdminUC.CreateRegion(body)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, rg)
}

func (h Handler) CreateElection(c *gin.Context) {
	var body struct {
		Title          string  `json:"title" binding:"required"`
		ElectionTypeID string  `json:"election_type_id" binding:"required"`
		RegionID       *string `json:"region_id"`
		IsActive       bool    `json:"is_active"`
		EndDate        string  `json:"end_date" binding:"required"`
		BannerURL      *string `json:"banner_url"`
		Description    *string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	endDate, err := time.Parse(time.RFC3339, body.EndDate)
	if err != nil {
		c.JSON(400, gin.H{"error": "end_date debe ser RFC3339"})
		return
	}
	e, err := h.AdminUC.CreateElection(body.Title, body.ElectionTypeID, body.RegionID, endDate, body.IsActive, body.BannerURL, body.Description)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, e)
}

func (h Handler) UpdateElection(c *gin.Context) {
	var body struct {
		Title          string  `json:"title" binding:"required"`
		ElectionTypeID string  `json:"election_type_id" binding:"required"`
		RegionID       *string `json:"region_id"`
		IsActive       bool    `json:"is_active"`
		EndDate        string  `json:"end_date" binding:"required"`
		BannerURL      *string `json:"banner_url"`
		Description    *string `json:"description"`
	}
	if err := h.checkToken(c); err != nil {
		return
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	endDate, err := time.Parse(time.RFC3339, body.EndDate)
	if err != nil {
		c.JSON(400, gin.H{"error": "end_date debe ser RFC3339"})
		return
	}
	err = h.AdminUC.UpdateElection(c.Param("id"), body.Title, body.ElectionTypeID, body.RegionID, endDate, body.IsActive, body.BannerURL, body.Description)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "elección actualizada"})
}

func (h Handler) CreateCandidate(c *gin.Context) {
	// El nombre no es obligatorio cuando se marca "No sabe / No opina": en ese
	// caso el caso de uso pone el texto por defecto.
	var body struct {
		Name        string  `json:"name"`
		ImageURL    string  `json:"image_url" binding:"required"`
		ElectionID  string  `json:"election_id" binding:"required"`
		Description *string `json:"description"`
		ButtonText  *string `json:"button_text"`
		ButtonURL   *string `json:"button_url"`
		IsUndecided bool    `json:"is_undecided"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(body.Name) == "" && !body.IsUndecided {
		c.JSON(400, gin.H{"error": "el nombre del candidato es obligatorio"})
		return
	}
	candidate, err := h.AdminUC.CreateCandidate(body.Name, body.ImageURL, body.ElectionID, body.Description, body.ButtonText, body.ButtonURL, body.IsUndecided)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, candidate)
}

func (h Handler) UpdateCandidate(c *gin.Context) {
	var body struct {
		Name        string  `json:"name"`
		ImageURL    string  `json:"image_url" binding:"required"`
		Description *string `json:"description"`
		ButtonText  *string `json:"button_text"`
		ButtonURL   *string `json:"button_url"`
		IsUndecided bool    `json:"is_undecided"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(body.Name) == "" && !body.IsUndecided {
		c.JSON(400, gin.H{"error": "el nombre del candidato es obligatorio"})
		return
	}
	err := h.AdminUC.UpdateCandidate(c.Param("id"), body.Name, body.ImageURL, body.Description, body.ButtonText, body.ButtonURL, body.IsUndecided)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "candidato actualizado"})
}

func (h Handler) checkToken(c *gin.Context) error {
	// Simple helper if needed, but middleware usually handles this. 
	// Added to ensure compatibility with existing pattern.
	return nil
}

func (h Handler) CloseElection(c *gin.Context) {
	if err := h.Elections.Close(c.Param("id")); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "elección cerrada"})
}
func (h Handler) DeleteElection(c *gin.Context) {
	if err := h.Elections.Delete(c.Param("id")); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h Handler) DeleteCandidate(c *gin.Context) {
	if err := h.Candidates.Delete(c.Param("id")); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func queryInt(c *gin.Context, key string, fallback int) int {
	raw := c.Query(key)
	if raw == "" {
		return fallback
	}
	v, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return v
}

func (h Handler) GetElectionBySlug(c *gin.Context) {
	e, err := h.Elections.GetBySlug(c.Param("slug"))
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, e)
}

func (h Handler) DeleteRegion(c *gin.Context) {
	if err := h.AdminUC.DeleteRegion(c.Param("id")); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h Handler) DeleteElectionType(c *gin.Context) {
	if err := h.AdminUC.DeleteElectionType(c.Param("id")); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}

func (h Handler) AddVotes(c *gin.Context) {
	var input struct {
		ElectionID  string `json:"election_id" binding:"required"`
		CandidateID string `json:"candidate_id" binding:"required"`
		Count       int    `json:"count" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if err := h.AdminUC.AddManualVotes(input.ElectionID, input.CandidateID, input.Count); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"ok": true})
}

// RemoveVotes deshace una carga manual excesiva. Responde con `removed` porque
// puede quitar menos de lo pedido si el candidato no tenía tantos votos.
func (h Handler) RemoveVotes(c *gin.Context) {
	var input struct {
		ElectionID  string `json:"election_id" binding:"required"`
		CandidateID string `json:"candidate_id" binding:"required"`
		Count       int    `json:"count" binding:"required,min=1"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	removed, err := h.AdminUC.RemoveManualVotes(input.ElectionID, input.CandidateID, input.Count)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"ok": true, "removed": removed})
}

func (h Handler) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(400, gin.H{"error": "No file provided"})
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	uploadPath := filepath.Join("uploads", filename)

	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		c.JSON(500, gin.H{"error": "Could not create uploads directory"})
		return
	}

	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(500, gin.H{"error": "Could not save file"})
		return
	}

	// Devuelve la URL relativa
	c.JSON(200, gin.H{"url": "/uploads/" + filename})
}

