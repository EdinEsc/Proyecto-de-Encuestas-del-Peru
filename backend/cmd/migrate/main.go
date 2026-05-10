package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	databaseURL := mustEnv("DATABASE_URL")
	pool, err := waitForDB(databaseURL, 60*time.Second)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	ctx := context.Background()
	if _, err := pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`); err != nil {
		log.Fatal(err)
	}

	migrationDir := getenv("MIGRATIONS_DIR", "/app/migrations")
	files, err := filepath.Glob(filepath.Join(migrationDir, "*.sql"))
	if err != nil {
		log.Fatal(err)
	}
	if len(files) == 0 {
		log.Printf("no se encontraron migraciones en %s", migrationDir)
		return
	}
	sort.Strings(files)

	for _, file := range files {
		version := filepath.Base(file)
		var exists bool
		if err := pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version=$1)`, version).Scan(&exists); err != nil {
			log.Fatal(err)
		}
		if exists {
			log.Printf("migración ya aplicada: %s", version)
			continue
		}
		sqlBytes, err := os.ReadFile(file)
		if err != nil {
			log.Fatal(err)
		}
		tx, err := pool.Begin(ctx)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := tx.Exec(ctx, string(sqlBytes)); err != nil {
			_ = tx.Rollback(ctx)
			log.Fatalf("error aplicando %s: %v", version, err)
		}
		if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations(version) VALUES($1)`, version); err != nil {
			_ = tx.Rollback(ctx)
			log.Fatal(err)
		}
		if err := tx.Commit(ctx); err != nil {
			log.Fatal(err)
		}
		log.Printf("migración aplicada: %s", version)
	}
}

func waitForDB(databaseURL string, timeout time.Duration) (*pgxpool.Pool, error) {
	deadline := time.Now().Add(timeout)
	var lastErr error
	for time.Now().Before(deadline) {
		pool, err := pgxpool.New(context.Background(), databaseURL)
		if err == nil {
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			pingErr := pool.Ping(ctx)
			cancel()
			if pingErr == nil {
				return pool, nil
			}
			lastErr = pingErr
			pool.Close()
		} else {
			lastErr = err
		}
		time.Sleep(2 * time.Second)
	}
	return nil, fmt.Errorf("database no disponible: %w", lastErr)
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
