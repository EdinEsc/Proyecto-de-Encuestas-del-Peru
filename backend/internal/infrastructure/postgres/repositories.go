package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"voting-platform/backend/internal/domain"
)

type Base struct{ DB *pgxpool.Pool }

type ElectionRepo struct{ Base }
type CandidateRepo struct{ Base }
type VoteRepo struct{ Base }
type CommentRepo struct{ Base }
type AdminRepo struct{ Base }
type CatalogRepo struct{ Base }

func (r ElectionRepo) List(activeOnly bool, electionType string, regionName string) ([]domain.Election, error) {
	rows, err := r.DB.Query(context.Background(), `SELECT e.id, e.title, e.slug, e.election_type_id, et.name, e.region_id, rg.name, e.is_active, e.end_date, e.banner_url, e.description, e.created_at
		FROM elections e JOIN election_types et ON et.id=e.election_type_id LEFT JOIN regions rg ON rg.id=e.region_id
		WHERE ($1=false OR (e.is_active=true AND e.end_date > now())) 
		AND ($2='' OR et.name=$2)
		AND ($3='' OR rg.name=$3)
		ORDER BY e.created_at DESC`, activeOnly, electionType, regionName)

	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Election
	for rows.Next() {
		var e domain.Election
		var regionID, regionName, slug *string
		if err := rows.Scan(&e.ID, &e.Title, &slug, &e.ElectionTypeID, &e.ElectionType, &regionID, &regionName, &e.IsActive, &e.EndDate, &e.BannerURL, &e.Description, &e.CreatedAt); err != nil {
			return nil, err
		}
		e.RegionID = regionID
		e.RegionName = regionName
		if slug != nil {
			e.Slug = *slug
		}
		list = append(list, e)
	}
	return list, rows.Err()
}
func (r ElectionRepo) GetByID(id string) (*domain.Election, error) {
	var e domain.Election
	var regionID, regionName, slug *string
	err := r.DB.QueryRow(context.Background(),
		`SELECT e.id, e.title, e.slug, e.election_type_id, et.name, e.region_id, rg.name, e.is_active, e.end_date, e.banner_url, e.description, e.created_at
		 FROM elections e
		 JOIN election_types et ON et.id = e.election_type_id
		 LEFT JOIN regions rg ON rg.id = e.region_id
		 WHERE e.id = $1`, id).Scan(&e.ID, &e.Title, &slug, &e.ElectionTypeID, &e.ElectionType, &regionID, &regionName, &e.IsActive, &e.EndDate, &e.BannerURL, &e.Description, &e.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("elección no encontrada")
	}
	e.RegionID = regionID
	e.RegionName = regionName
	if slug != nil {
		e.Slug = *slug
	}
	return &e, err
}
func (r ElectionRepo) GetBySlug(slug string) (*domain.Election, error) {
	var e domain.Election
	var regionID, regionName, dbSlug *string
	err := r.DB.QueryRow(context.Background(),
		`SELECT e.id, e.title, e.slug, e.election_type_id, et.name, e.region_id, rg.name, e.is_active, e.end_date, e.banner_url, e.description, e.created_at
		 FROM elections e
		 JOIN election_types et ON et.id = e.election_type_id
		 LEFT JOIN regions rg ON rg.id = e.region_id
		 WHERE e.slug = $1`, slug).Scan(&e.ID, &e.Title, &dbSlug, &e.ElectionTypeID, &e.ElectionType, &regionID, &regionName, &e.IsActive, &e.EndDate, &e.BannerURL, &e.Description, &e.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("elección no encontrada")
	}
	e.RegionID = regionID
	e.RegionName = regionName
	if dbSlug != nil {
		e.Slug = *dbSlug
	}
	return &e, err
}
func (r ElectionRepo) Create(e domain.Election) (*domain.Election, error) {
	err := r.DB.QueryRow(context.Background(), `INSERT INTO elections(title,slug,election_type_id,region_id,is_active,end_date,banner_url,description) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, created_at`, e.Title, e.Slug, e.ElectionTypeID, e.RegionID, e.IsActive, e.EndDate, e.BannerURL, e.Description).Scan(&e.ID, &e.CreatedAt)
	return &e, err
}
func (r ElectionRepo) Update(e domain.Election) error {
	_, err := r.DB.Exec(context.Background(), `UPDATE elections SET title=$1, election_type_id=$2, region_id=$3, is_active=$4, end_date=$5, banner_url=$6, description=$7 WHERE id=$8`, e.Title, e.ElectionTypeID, e.RegionID, e.IsActive, e.EndDate, e.BannerURL, e.Description, e.ID)
	return err
}
func (r ElectionRepo) Close(id string) error {
	_, err := r.DB.Exec(context.Background(), `UPDATE elections SET is_active=false WHERE id=$1`, id)
	return err
}
func (r ElectionRepo) Delete(id string) error {
	_, err := r.DB.Exec(context.Background(), `DELETE FROM elections WHERE id=$1`, id)
	return err
}

func (r CandidateRepo) ListByElection(electionID string) ([]domain.Candidate, error) {
	rows, err := r.DB.Query(context.Background(), `SELECT id,name,image_url,description,button_text,button_url,election_id FROM candidates WHERE election_id=$1 ORDER BY created_at ASC`, electionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Candidate
	for rows.Next() {
		var c domain.Candidate
		if err := rows.Scan(&c.ID, &c.Name, &c.ImageURL, &c.Description, &c.ButtonText, &c.ButtonURL, &c.ElectionID); err != nil {
			return nil, err
		}
		list = append(list, c)
	}
	return list, rows.Err()
}
func (r CandidateRepo) GetByID(id string) (*domain.Candidate, error) {
	var c domain.Candidate
	err := r.DB.QueryRow(context.Background(), `SELECT id,name,image_url,description,button_text,button_url,election_id FROM candidates WHERE id=$1`, id).Scan(&c.ID, &c.Name, &c.ImageURL, &c.Description, &c.ButtonText, &c.ButtonURL, &c.ElectionID)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("candidato no encontrado")
	}
	return &c, err
}
func (r CandidateRepo) Create(c domain.Candidate) (*domain.Candidate, error) {
	err := r.DB.QueryRow(context.Background(), `INSERT INTO candidates(name,image_url,description,button_text,button_url,election_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, c.Name, c.ImageURL, c.Description, c.ButtonText, c.ButtonURL, c.ElectionID).Scan(&c.ID)
	return &c, err
}
func (r CandidateRepo) Update(c domain.Candidate) error {
	_, err := r.DB.Exec(context.Background(), `UPDATE candidates SET name=$1, image_url=$2, description=$3, button_text=$4, button_url=$5 WHERE id=$6`, c.Name, c.ImageURL, c.Description, c.ButtonText, c.ButtonURL, c.ID)
	return err
}
func (r CandidateRepo) Delete(id string) error {
	_, err := r.DB.Exec(context.Background(), `DELETE FROM candidates WHERE id=$1`, id)
	return err
}

func (r VoteRepo) HasVoted(electionID string, ip string, browserID string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(context.Background(), `SELECT EXISTS(SELECT 1 FROM votes WHERE election_id=$1 AND (ip_address=$2::inet OR ($3<>'' AND browser_id=$3)))`, electionID, ip, browserID).Scan(&exists)
	return exists, err
}
func (r VoteRepo) Create(v domain.Vote) (*domain.Vote, error) {
	err := r.DB.QueryRow(context.Background(), `INSERT INTO votes(candidate_id,election_id,ip_address,browser_id) VALUES($1,$2,$3::inet,$4) RETURNING id,created_at`, v.CandidateID, v.ElectionID, v.IPAddress, v.BrowserID).Scan(&v.ID, &v.CreatedAt)
	return &v, err
}
func (r VoteRepo) AddManualVotes(electionID, candidateID string, count int) error {
	_, err := r.DB.Exec(context.Background(), `
		INSERT INTO votes(candidate_id, election_id, ip_address, browser_id)
		SELECT $1, $2, '0.0.0.0'::inet, 'manual-override'
		FROM generate_series(1, $3)
	`, candidateID, electionID, count)
	return err
}
func (r VoteRepo) Results(electionID string) ([]domain.ResultItem, error) {
	rows, err := r.DB.Query(context.Background(), `SELECT c.id,c.name,c.image_url,COUNT(v.id) votes FROM candidates c LEFT JOIN votes v ON v.candidate_id=c.id WHERE c.election_id=$1 GROUP BY c.id,c.name,c.image_url ORDER BY votes DESC,c.name`, electionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.ResultItem
	for rows.Next() {
		var it domain.ResultItem
		if err := rows.Scan(&it.CandidateID, &it.Name, &it.ImageURL, &it.Votes); err != nil {
			return nil, err
		}
		list = append(list, it)
	}
	return list, rows.Err()
}

func (r CommentRepo) Create(c domain.Comment) (*domain.Comment, error) {
	err := r.DB.QueryRow(context.Background(), `INSERT INTO comments(candidate_id,content,ip_address) VALUES($1,$2,$3::inet) RETURNING id,created_at`, c.CandidateID, c.Content, c.IPAddress).Scan(&c.ID, &c.CreatedAt)
	return &c, err
}
func (r CommentRepo) ListByCandidate(candidateID string) ([]domain.Comment, error) {
	rows, err := r.DB.Query(context.Background(), `SELECT id,candidate_id,content,ip_address::text,created_at FROM comments WHERE candidate_id=$1 ORDER BY created_at DESC LIMIT 100`, candidateID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Comment
	for rows.Next() {
		var cm domain.Comment
		if err := rows.Scan(&cm.ID, &cm.CandidateID, &cm.Content, &cm.IPAddress, &cm.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, cm)
	}
	return list, rows.Err()
}
func (r CommentRepo) CountRecentByIP(ip string, since time.Time) (int64, error) {
	var count int64
	err := r.DB.QueryRow(context.Background(), `SELECT COUNT(*) FROM comments WHERE ip_address=$1::inet AND created_at>$2`, ip, since).Scan(&count)
	return count, err
}

func (r AdminRepo) FindByEmail(email string) (*domain.User, error) {
	var u domain.User
	err := r.DB.QueryRow(context.Background(), `SELECT id,email,password,role FROM users WHERE email=$1`, email).Scan(&u.ID, &u.Email, &u.Password, &u.Role)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	return &u, err
}

func (r CatalogRepo) CreateElectionType(name string) (*domain.ElectionType, error) {
	var et domain.ElectionType
	err := r.DB.QueryRow(context.Background(), `INSERT INTO election_types(name) VALUES($1) RETURNING id,name`, name).Scan(&et.ID, &et.Name)
	return &et, err
}
func (r CatalogRepo) ListElectionTypes() ([]domain.ElectionType, error) {
	rows, err := r.DB.Query(context.Background(), `SELECT id, name FROM election_types ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.ElectionType
	for rows.Next() {
		var et domain.ElectionType
		if err := rows.Scan(&et.ID, &et.Name); err != nil {
			return nil, err
		}
		list = append(list, et)
	}
	return list, rows.Err()
}
func (r CatalogRepo) CreateRegion(region domain.Region) (*domain.Region, error) {
	err := r.DB.QueryRow(context.Background(), `INSERT INTO regions(name,parent_id,level) VALUES($1,$2,$3) RETURNING id`, region.Name, region.ParentID, region.Level).Scan(&region.ID)
	return &region, err
}
func (r CatalogRepo) ListRegions(level string, parentID string) ([]domain.Region, error) {
	rows, err := r.DB.Query(context.Background(), `SELECT id,name,parent_id,level FROM regions WHERE ($1='' OR level=$1) AND ($2='' OR parent_id=$2::uuid) ORDER BY name`, level, parentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []domain.Region
	for rows.Next() {
		var rg domain.Region
		if err := rows.Scan(&rg.ID, &rg.Name, &rg.ParentID, &rg.Level); err != nil {
			return nil, err
		}
		list = append(list, rg)
	}
	return list, rows.Err()
}
func (r CatalogRepo) DeleteRegion(id string) error {
	_, err := r.DB.Exec(context.Background(), `DELETE FROM regions WHERE id=$1`, id)
	return err
}

func (r CatalogRepo) DeleteElectionType(id string) error {
	_, err := r.DB.Exec(context.Background(), `DELETE FROM election_types WHERE id=$1`, id)
	return err
}
