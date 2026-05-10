package main

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()
	pool, err := pgxpool.New(context.Background(), mustEnv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	seedAdmin(ctx, pool)
	if strings.EqualFold(getenv("SEED_DEMO_DATA", "true"), "true") {
		seedDemo(ctx, pool)
	}
}

func seedAdmin(ctx context.Context, pool *pgxpool.Pool) {
	email := getenv("ADMIN_EMAIL", "admin@votaciones.local")
	password := getenv("ADMIN_PASSWORD", "admin123456")
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	_, err = pool.Exec(ctx, `
		INSERT INTO users(email,password,role)
		VALUES($1,$2,'admin')
		ON CONFLICT(email) DO NOTHING
	`, email, string(hash))
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("admin listo: %s", email)
}

func seedDemo(ctx context.Context, pool *pgxpool.Pool) {
	// Tipos
	presidentialTypeID := mustGetElectionType(ctx, pool, "presidencial")
	regionalTypeID := mustGetElectionType(ctx, pool, "regional")
	provincialTypeID := mustGetElectionType(ctx, pool, "provincial")
	distritalTypeID := mustGetElectionType(ctx, pool, "distrital")

	// País
	countryID := getOrCreateRegion(ctx, pool, "República del Perú", nil, "country")

	// Regiones
	regiones := []string{"Ancash", "Amazonas", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "Lambayeque"}
	for _, r := range regiones {
		rID := getOrCreateRegion(ctx, pool, "Región "+r, &countryID, "region")
		eID := upsertElection(ctx, pool, "Gobierno Regional de "+r, regionalTypeID, &rID)
		seedCandidate(ctx, pool, eID, "Ninguno / Blanco", "https://ui-avatars.com/api/?name=Ninguno&background=000000&color=fff&size=200")
	}

	// Lima
	limaRegionID := getOrCreateRegion(ctx, pool, "Lima", &countryID, "region")
	limaProvID := getOrCreateRegion(ctx, pool, "Provincia de Lima", &limaRegionID, "province")
	limaElectionID := upsertElection(ctx, pool, "Alcaldía de Lima", provincialTypeID, &limaProvID)
	seedCandidate(ctx, pool, limaElectionID, "Ninguno / Blanco", "https://ui-avatars.com/api/?name=Ninguno&background=000000&color=fff&size=200")

	// Distritos de Lima
	distritosLima := []string{"Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María"}
	for _, d := range distritosLima {
		dID := getOrCreateRegion(ctx, pool, d, &limaProvID, "district")
		eID := upsertElection(ctx, pool, "Alcaldía de "+d, distritalTypeID, &dID)
		seedCandidate(ctx, pool, eID, "Ninguno / Blanco", "https://ui-avatars.com/api/?name=Ninguno&background=000000&color=fff&size=200")
	}

	// Callao
	callaoRegionID := getOrCreateRegion(ctx, pool, "Callao", &countryID, "region")
	callaoProvID := getOrCreateRegion(ctx, pool, "Provincia Constitucional del Callao", &callaoRegionID, "province")
	callaoElectionID := upsertElection(ctx, pool, "Alcaldía del Callao", provincialTypeID, &callaoProvID)
	seedCandidate(ctx, pool, callaoElectionID, "Ninguno / Blanco", "https://ui-avatars.com/api/?name=Ninguno&background=000000&color=fff&size=200")

	distritosCallao := []string{"Bellavista", "Carmen de la Legua", "La Perla", "La Punta", "Ventanilla", "Mi Perú"}
	for _, d := range distritosCallao {
		dID := getOrCreateRegion(ctx, pool, d, &callaoProvID, "district")
		eID := upsertElection(ctx, pool, "Alcaldía de "+d, distritalTypeID, &dID)
		seedCandidate(ctx, pool, eID, "Ninguno / Blanco", "https://ui-avatars.com/api/?name=Ninguno&background=000000&color=fff&size=200")
	}

	// Presidencial
	pElectionID := upsertElection(ctx, pool, "Elecciones Presidenciales 2026", presidentialTypeID, &countryID)
	p1 := seedCandidate(ctx, pool, pElectionID, "Alianza por el Progreso Digital", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200")
	p2 := seedCandidate(ctx, pool, pElectionID, "Frente de Innovación Nacional", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200")
	p3 := seedCandidate(ctx, pool, pElectionID, "Ninguno / Blanco", "https://ui-avatars.com/api/?name=Ninguno&background=000000&color=fff&size=200")

	// Seed Random Votes
	seedRandomVotes(ctx, pool, pElectionID, []string{p1, p2, p3}, 1250)
	
	log.Println("Datos de elecciones y regiones generados correctamente.")
}

func seedCandidate(ctx context.Context, pool *pgxpool.Pool, electionID, name, imageURL string) string {
	var id string
	err := pool.QueryRow(ctx, `
		SELECT id FROM candidates WHERE election_id = $1::uuid AND name = $2::varchar
	`, electionID, name).Scan(&id)
	
	if err == nil {
		return id
	}

	err = pool.QueryRow(ctx, `
		INSERT INTO candidates(name,image_url,election_id)
		VALUES($1, $2, $3::uuid)
		RETURNING id
	`, name, imageURL, electionID).Scan(&id)
	
	if err != nil {
		log.Fatal(err)
	}
	return id
}

func seedRandomVotes(ctx context.Context, pool *pgxpool.Pool, electionID string, candidateIDs []string, count int) {
	for i := 0; i < count; i++ {
		cID := candidateIDs[i%len(candidateIDs)]
		if i%3 == 0 { cID = candidateIDs[0] } // Favoring first for visual lead
		
		_, _ = pool.Exec(ctx, `
			INSERT INTO votes(election_id, candidate_id, browser_id, ip_address)
			VALUES($1::uuid, $2::uuid, $3, $4)
		`, electionID, cID, "seed-browser-"+time.Now().String(), "127.0.0.1")
	}
}

func getOrCreateRegion(ctx context.Context, pool *pgxpool.Pool, name string, parentID *string, level string) string {
	var id string
	err := pool.QueryRow(ctx, `
		SELECT id FROM regions
		WHERE name=$1 AND level=$2 AND parent_id IS NOT DISTINCT FROM $3::uuid
		LIMIT 1
	`, name, level, parentID).Scan(&id)
	if err == nil {
		return id
	}
	if err := pool.QueryRow(ctx, `
		INSERT INTO regions(name,parent_id,level)
		VALUES($1,$2,$3)
		RETURNING id
	`, name, parentID, level).Scan(&id); err != nil {
		log.Fatal(err)
	}
	return id
}

func mustGetElectionType(ctx context.Context, pool *pgxpool.Pool, name string) string {
	var id string
	if err := pool.QueryRow(ctx, `SELECT id FROM election_types WHERE name=$1`, name).Scan(&id); err != nil {
		log.Fatal(err)
	}
	return id
}

func upsertElection(ctx context.Context, pool *pgxpool.Pool, title, typeID string, regionID *string) string {
	var id string
	if err := pool.QueryRow(ctx, `
		INSERT INTO elections(title,election_type_id,region_id,is_active,end_date)
		VALUES($1,$2,$3,true,now()+interval '90 days')
		ON CONFLICT(title) DO UPDATE SET is_active=true, end_date=EXCLUDED.end_date
		RETURNING id
	`, title, typeID, regionID).Scan(&id); err != nil {
		log.Fatal(err)
	}
	return id
}

func mustEnv(key string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		log.Fatalf("%s requerido", key)
	}
	return value
}

func getenv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}


