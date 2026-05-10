#!/bin/sh
set -e

echo "[backend] Ejecutando migraciones..."
/app/migrate

echo "[backend] Ejecutando seed inicial..."
/app/seed

echo "[backend] Iniciando API..."
exec /app/api
