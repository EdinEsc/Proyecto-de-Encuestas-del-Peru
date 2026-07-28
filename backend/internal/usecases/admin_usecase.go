package usecases

import (
	"errors"
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"voting-platform/backend/internal/domain"
	"voting-platform/backend/internal/infrastructure/auth"
)

type AdminUsecase struct {
	Admins     domain.AdminRepository
	Catalog    domain.CatalogRepository
	Elections  domain.ElectionRepository
	Candidates domain.CandidateRepository
	Votes      domain.VoteRepository
	JWT        auth.JWTService
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (u AdminUsecase) Login(input LoginInput) (string, error) {
	user, err := u.Admins.FindByEmail(input.Email)
	if err != nil || user == nil {
		return "", errors.New("credenciales inválidas")
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil {
		return "", errors.New("credenciales inválidas")
	}
	return u.JWT.Generate(user.ID, user.Email, user.Role)
}

func (u AdminUsecase) CreateElectionType(name string) (*domain.ElectionType, error) {
	return u.Catalog.CreateElectionType(name)
}

func (u AdminUsecase) CreateRegion(r domain.Region) (*domain.Region, error) {
	return u.Catalog.CreateRegion(r)
}

func (u AdminUsecase) CreateElection(title, typeID string, regionID *string, endDate time.Time, active bool, bannerURL *string, description *string) (*domain.Election, error) {
	slug := slugify(title)
	return u.Elections.Create(domain.Election{
		Title:          title,
		Slug:           slug,
		ElectionTypeID: typeID,
		RegionID:       regionID,
		EndDate:        endDate,
		IsActive:       active,
		BannerURL:      bannerURL,
		Description:    description,
	})
}

func slugify(s string) string {
	// Lowercase
	s = strings.ToLower(s)
	// Replace accented chars
	replacer := strings.NewReplacer(
		"á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u",
		"ñ", "n", "ü", "u",
	)
	s = replacer.Replace(s)
	// Remove non-alphanumeric (except spaces and hyphens)
	reg := regexp.MustCompile(`[^a-z0-9\s-]`)
	s = reg.ReplaceAllString(s, "")
	// Replace spaces with hyphens
	reg2 := regexp.MustCompile(`\s+`)
	s = reg2.ReplaceAllString(s, "-")
	// Remove leading/trailing hyphens
	s = strings.Trim(s, "-")
	return s
}

func (u AdminUsecase) UpdateElection(id, title, typeID string, regionID *string, endDate time.Time, active bool, bannerURL *string, description *string) error {
	return u.Elections.Update(domain.Election{
		ID:             id,
		Title:          title,
		ElectionTypeID: typeID,
		RegionID:       regionID,
		EndDate:        endDate,
		IsActive:       active,
		BannerURL:      bannerURL,
		Description:    description,
	})
}

// DefaultUndecidedName es el nombre que toma la opción "No sabe / No opina"
// cuando el administrador activa la casilla y no escribe uno propio.
const DefaultUndecidedName = "No sabe / No opina"

func (u AdminUsecase) CreateCandidate(name, imageURL, electionID string, description, btnText, btnURL *string, isUndecided bool) (*domain.Candidate, error) {
	return u.Candidates.Create(domain.Candidate{
		Name:        undecidedName(name, isUndecided),
		ImageURL:    imageURL,
		ElectionID:  electionID,
		Description: description,
		ButtonText:  btnText,
		ButtonURL:   btnURL,
		IsUndecided: isUndecided,
	})
}

func (u AdminUsecase) UpdateCandidate(id, name, imageURL string, description, btnText, btnURL *string, isUndecided bool) error {
	return u.Candidates.Update(domain.Candidate{
		ID:          id,
		Name:        undecidedName(name, isUndecided),
		ImageURL:    imageURL,
		Description: description,
		ButtonText:  btnText,
		ButtonURL:   btnURL,
		IsUndecided: isUndecided,
	})
}

// undecidedName respeta el nombre que escriba el administrador y solo pone el
// texto por defecto cuando la casilla está activa y el campo quedó vacío.
func undecidedName(name string, isUndecided bool) string {
	trimmed := strings.TrimSpace(name)
	if isUndecided && trimmed == "" {
		return DefaultUndecidedName
	}
	return trimmed
}

func (u AdminUsecase) DeleteRegion(id string) error {
	return u.Catalog.DeleteRegion(id)
}

func (u AdminUsecase) DeleteElectionType(id string) error {
	return u.Catalog.DeleteElectionType(id)
}

func (u AdminUsecase) AddManualVotes(electionID, candidateID string, count int) error {
	return u.Votes.AddManualVotes(electionID, candidateID, count)
}

// RemoveManualVotes descuenta votos ya cargados. Devuelve cuántos se quitaron
// realmente, que puede ser menos de lo pedido si el candidato no tenía tantos.
func (u AdminUsecase) RemoveManualVotes(electionID, candidateID string, count int) (int64, error) {
	return u.Votes.RemoveManualVotes(electionID, candidateID, count)
}
