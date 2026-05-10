package usecases

import (
	"errors"
	"strings"
	"time"

	"voting-platform/backend/internal/domain"
)

var (
	ErrAlreadyVoted      = errors.New("Ya votaste en esta encuesta")
	ErrElectionClosed    = errors.New("la elección está cerrada")
	ErrCandidateMismatch = errors.New("el candidato no pertenece a esta elección")
	ErrCaptcha           = errors.New("captcha inválido")
	ErrCommentRateLimit  = errors.New("solo puedes comentar una vez cada 2 minutos")
)

type VoteUsecase struct {
	Elections  domain.ElectionRepository
	Candidates domain.CandidateRepository
	Votes      domain.VoteRepository
	Captcha    domain.CaptchaVerifier
}

type VoteInput struct {
	CandidateID    string `json:"candidate_id" binding:"required"`
	ElectionID     string `json:"election_id" binding:"required"`
	BrowserID      string `json:"browser_id"`
	RecaptchaToken string `json:"recaptcha_token"`
}

func (u VoteUsecase) Vote(input VoteInput, ip string) (*domain.Vote, error) {
	if u.Captcha != nil && !u.Captcha.Verify(input.RecaptchaToken, ip) {
		return nil, ErrCaptcha
	}

	election, err := u.Elections.GetByID(input.ElectionID)
	if err != nil {
		return nil, err
	}
	if !election.IsActive || time.Now().After(election.EndDate) {
		return nil, ErrElectionClosed
	}

	candidate, err := u.Candidates.GetByID(input.CandidateID)
	if err != nil {
		return nil, err
	}
	if candidate.ElectionID != input.ElectionID {
		return nil, ErrCandidateMismatch
	}

	browserID := strings.TrimSpace(input.BrowserID)
	exists, err := u.Votes.HasVoted(input.ElectionID, ip, browserID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyVoted
	}

	return u.Votes.Create(domain.Vote{
		CandidateID: input.CandidateID,
		ElectionID:  input.ElectionID,
		IPAddress:   ip,
		BrowserID:   browserID,
	})
}

type CommentUsecase struct {
	Comments   domain.CommentRepository
	Candidates domain.CandidateRepository
}

type CommentInput struct {
	CandidateID string `json:"candidate_id" binding:"required"`
	Content     string `json:"content" binding:"required,max=500"`
}

func (u CommentUsecase) Comment(input CommentInput, ip string) (*domain.Comment, error) {
	_, err := u.Candidates.GetByID(input.CandidateID)
	if err != nil {
		return nil, err
	}
	count, err := u.Comments.CountRecentByIP(ip, time.Now().Add(-2*time.Minute))
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, ErrCommentRateLimit
	}
	return u.Comments.Create(domain.Comment{CandidateID: input.CandidateID, Content: strings.TrimSpace(input.Content), IPAddress: ip})
}
