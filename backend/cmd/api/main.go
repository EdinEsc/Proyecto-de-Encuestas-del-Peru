package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"strings"
	"voting-platform/backend/internal/infrastructure/auth"
	"voting-platform/backend/internal/infrastructure/captcha"
	"voting-platform/backend/internal/infrastructure/postgres"
	httpapi "voting-platform/backend/internal/interfaces/http"
	"voting-platform/backend/internal/usecases"
)

func main() {
	_ = godotenv.Load()
	dbURL := mustEnv("DATABASE_URL")
	jwtSecret := mustEnv("JWT_SECRET")
	port := getenv("PORT", "8080")


	pool, err := postgres.NewPool(dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	base := postgres.Base{DB: pool}
	electionRepo := postgres.ElectionRepo{Base: base}
	candidateRepo := postgres.CandidateRepo{Base: base}
	voteRepo := postgres.VoteRepo{Base: base}
	commentRepo := postgres.CommentRepo{Base: base}
	adminRepo := postgres.AdminRepo{Base: base}
	catalogRepo := postgres.CatalogRepo{Base: base}
	jwtSvc := auth.JWTService{Secret: jwtSecret}
	captchaSvc := captcha.RecaptchaVerifier{Secret: os.Getenv("RECAPTCHA_SECRET")}

	voteUC := usecases.VoteUsecase{Elections: electionRepo, Candidates: candidateRepo, Votes: voteRepo, Captcha: captchaSvc}
	commentUC := usecases.CommentUsecase{Comments: commentRepo, Candidates: candidateRepo}
	adminUC := usecases.AdminUsecase{Admins: adminRepo, Catalog: catalogRepo, Elections: electionRepo, Candidates: candidateRepo, Votes: voteRepo, JWT: jwtSvc}

	handler := httpapi.Handler{
		Elections: electionRepo, Candidates: candidateRepo, Votes: voteRepo,
		Comments: commentRepo, Catalog: catalogRepo, VoteUC: voteUC, CommentUC: commentUC, AdminUC: adminUC,
	}

	frontendOrigin := strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN"))
	allowedOrigins := []string{"http://localhost:3000", "http://localhost:3001"}
	if frontendOrigin != "" && frontendOrigin != "*" {
		
		allowedOrigins = allowedOrigins[:0]
		for _, o := range strings.Split(frontendOrigin, ",") {
			if o = strings.TrimRight(strings.TrimSpace(o), "/"); o != "" {
				allowedOrigins = append(allowedOrigins, o)
			}
		}
	}
	log.Printf("CORS: orígenes permitidos = %v (comodín: %t)", allowedOrigins, frontendOrigin == "*")

	r := gin.Default()
	
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}

	if frontendOrigin == "*" {
		corsConfig.AllowAllOrigins = true
	} else {
		corsConfig.AllowOrigins = allowedOrigins
	}

	r.Use(cors.New(corsConfig))

	httpapi.RegisterRoutes(r, handler, jwtSvc)
	log.Fatal(r.Run(":" + port))
}

func mustEnv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		log.Fatalf("%s requerido", k)
	}
	return v
}
func getenv(k, fallback string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return fallback
}
