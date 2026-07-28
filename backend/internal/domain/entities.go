package domain

import "time"

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"-"`
	Role     string `json:"role"`
}

type ElectionType struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Region struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	ParentID *string `json:"parent_id,omitempty"`
	Level    string  `json:"level"`
}

type Election struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Slug           string    `json:"slug,omitempty"`
	ElectionTypeID string    `json:"election_type_id"`
	ElectionType   string    `json:"election_type,omitempty"`
	RegionID       *string   `json:"region_id,omitempty"`
	RegionName     *string   `json:"region_name,omitempty"`
	IsActive       bool      `json:"is_active"`
	BannerURL      *string   `json:"banner_url,omitempty"`
	Description    *string   `json:"description,omitempty"`
	EndDate        time.Time `json:"end_date"`
	CreatedAt      time.Time `json:"created_at"`
}

type Candidate struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	ImageURL    string  `json:"image_url"`
	Description *string `json:"description,omitempty"`
	ButtonText  *string `json:"button_text,omitempty"`
	ButtonURL   *string `json:"button_url,omitempty"`
	ElectionID  string  `json:"election_id"`
}

type Vote struct {
	ID          string    `json:"id"`
	CandidateID string    `json:"candidate_id"`
	ElectionID  string    `json:"election_id"`
	IPAddress   string    `json:"ip_address"`
	BrowserID   string    `json:"browser_id,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type ResultItem struct {
	CandidateID string `json:"candidate_id"`
	Name        string `json:"name"`
	ImageURL    string `json:"image_url"`
	Votes       int64  `json:"votes"`
}

type ElectionRepository interface {
	List(activeOnly bool, electionType string, regionName string) ([]Election, error)
	GetByID(id string) (*Election, error)
	GetBySlug(slug string) (*Election, error)
	Create(e Election) (*Election, error)
	Update(e Election) error
	Close(id string) error
	Delete(id string) error
}

type CandidateRepository interface {
	ListByElection(electionID string) ([]Candidate, error)
	GetByID(id string) (*Candidate, error)
	Create(c Candidate) (*Candidate, error)
	Update(c Candidate) error
	Delete(id string) error
}

type VoteRepository interface {
	HasVoted(electionID string, ip string, browserID string) (bool, error)
	Create(v Vote) (*Vote, error)
	AddManualVotes(electionID, candidateID string, count int) error
	Results(electionID string) ([]ResultItem, error)
}

type AdminRepository interface {
	FindByEmail(email string) (*User, error)
}

type CatalogRepository interface {
	CreateElectionType(name string) (*ElectionType, error)
	ListElectionTypes() ([]ElectionType, error)
	CreateRegion(r Region) (*Region, error)
	ListRegions(level string, parentID string) ([]Region, error)
	DeleteRegion(id string) error
	DeleteElectionType(id string) error
}

type CaptchaVerifier interface {
	Verify(token string, ip string) bool
}
