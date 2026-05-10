# Plataforma de votaciones / encuestas políticas

Aplicación web full-stack para crear elecciones configurables por nivel político, registrar votos anónimos con protección básica antifraude y administrar candidatos desde un panel privado.

## Stack

- Frontend: Next.js
- Backend: Go + Gin
- Base de datos: PostgreSQL local en Docker o Neon
- Autenticación admin: JWT
- Imágenes: URL externa desde Cloudinary o Amazon S3
- Arquitectura backend: Clean Architecture

## Estructura

```txt
voting-platform/
├── backend/
│   ├── cmd/
│   │   ├── api/          # API HTTP Gin
│   │   ├── migrate/      # migrador SQL interno
│   │   └── seed/         # admin inicial y data demo
│   ├── internal/
│   │   ├── domain/       # entidades e interfaces de repositorio
│   │   ├── usecases/     # reglas de aplicación
│   │   ├── interfaces/   # handlers, rutas, middlewares HTTP
│   │   └── infrastructure/# postgres, jwt, recaptcha
│   ├── migrations/
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.neon.yml
├── .env.example
└── Makefile
```

## Ejecución rápida 100% Docker local

### 1. Copiar variables de entorno

```bash
cp .env.example .env
```

### 2. Levantar todo

```bash
docker compose up --build
```

También puedes usar:

```bash
make up
```

### 3. Abrir la aplicación

- Frontend: `http://localhost:3000`
- Backend healthcheck: `http://localhost:8080/health`
- Admin: `http://localhost:3000/admin`

Credenciales iniciales por defecto:

```txt
Email: admin@votaciones.local
Password: admin123456
```

Estas credenciales se configuran en `.env`:

```env
ADMIN_EMAIL=admin@votaciones.local
ADMIN_PASSWORD=admin123456
```

## Modo con Neon

Edita `.env` y coloca tu URL real de Neon:

```env
DATABASE_URL=postgresql://usuario:password@host.neon.tech/db?sslmode=require
```

Luego ejecuta:

```bash
docker compose -f docker-compose.neon.yml up --build
```

O con Makefile:

```bash
make neon
```

En modo Neon no se levanta el contenedor `postgres`; el backend se conecta directamente a Neon.

## Servicios Docker

### `postgres`

Base de datos local PostgreSQL 16.

Datos persistidos en el volumen:

```txt
postgres_data
```

### `backend`

Al iniciar ejecuta automáticamente:

1. `/app/migrate`: aplica migraciones SQL pendientes.
2. `/app/seed`: crea admin inicial y datos demo.
3. `/app/api`: levanta Gin en el puerto 8080.

### `frontend`

Levanta Next.js en producción en el puerto 3000.

Usa dos URLs de API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
INTERNAL_API_URL=http://backend:8080
```

- `NEXT_PUBLIC_API_URL`: usada por el navegador.
- `INTERNAL_API_URL`: usada por Next.js dentro del contenedor para renderizado server-side.

## Comandos útiles

```bash
# Levantar todo
docker compose up --build

# Levantar en segundo plano
docker compose up -d --build

# Ver logs
docker compose logs -f

# Ver logs solo backend
docker compose logs -f backend

# Ver logs solo frontend
docker compose logs -f frontend

# Apagar sin borrar base de datos
docker compose down

# Apagar y borrar volumen de PostgreSQL
docker compose down -v

# Reconstruir sin caché
docker compose build --no-cache
```

## Endpoints públicos

```txt
GET  /health
GET  /elections
GET  /elections?type=presidencial
GET  /elections/:id
GET  /elections/:id/candidates
POST /vote
GET  /results/:election_id
POST /comments
GET  /regions
```

## Endpoints admin

Todos requieren JWT excepto login.

```txt
POST   /admin/login
POST   /admin/election-type
POST   /admin/region
POST   /admin/election
POST   /admin/candidate
PUT    /admin/election/:id/close
DELETE /admin/candidate/:id
```

Header requerido:

```txt
Authorization: Bearer TU_TOKEN
```

## Ejemplos con curl

### Login admin

```bash
curl -X POST http://localhost:8080/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@votaciones.local","password":"admin123456"}'
```

### Listar elecciones

```bash
curl http://localhost:8080/elections
```

### Listar elecciones presidenciales

```bash
curl "http://localhost:8080/elections?type=presidencial"
```

### Listar candidatos de una elección

```bash
curl http://localhost:8080/elections/ELECTION_ID/candidates
```

### Votar

```bash
curl -X POST http://localhost:8080/vote \
  -H "Content-Type: application/json" \
  -d '{
    "election_id":"ELECTION_ID",
    "candidate_id":"CANDIDATE_ID",
    "browser_id":"mi-navegador-demo",
    "recaptcha_token":""
  }'
```

Si ya votaste, responderá:

```json
{"error":"Ya votaste en esta encuesta"}
```

### Ver resultados

```bash
curl http://localhost:8080/results/ELECTION_ID
```

### Comentar candidato

```bash
curl -X POST http://localhost:8080/comments \
  -H "Content-Type: application/json" \
  -d '{"candidate_id":"CANDIDATE_ID","content":"Buen candidato"}'
```

## Seguridad incluida

- JWT para rutas admin.
- Hash de password con bcrypt.
- Validación de voto único por:
  - IP
  - `browser_id` generado en navegador y guardado en localStorage/cookie.
- Índices únicos en PostgreSQL para evitar votos duplicados.
- Captura de IP desde `X-Forwarded-For`, `X-Real-IP` o `ClientIP`.
- reCAPTCHA opcional.
- Rate limit básico de comentarios: 1 comentario por IP cada 2 minutos.
- CORS restringido por `FRONTEND_ORIGIN`.

## reCAPTCHA

En desarrollo, si `RECAPTCHA_SECRET` está vacío, el backend permite votar sin token.

Para producción:

```env
RECAPTCHA_SECRET=tu_secret_key_de_google
```

En el frontend falta conectar el widget visual de Google reCAPTCHA. El backend ya valida el token enviado en `recaptcha_token`.

## Imágenes Cloudinary o S3

La tabla `candidates` guarda:

```txt
image_url
```

Por ahora el admin permite pegar una URL pública de Cloudinary o S3.

Ejemplo Cloudinary:

```txt
https://res.cloudinary.com/tu-cloud/image/upload/v123/candidato.jpg
```

Ejemplo S3 público:

```txt
https://tu-bucket.s3.amazonaws.com/candidato.jpg
```

Para producción se recomienda agregar un endpoint de upload firmado.

## Tablas principales

- `users`
- `election_types`
- `regions`
- `elections`
- `candidates`
- `votes`
- `comments`
- `schema_migrations`

## Notas importantes para producción

1. Cambia `JWT_SECRET` por un valor largo y seguro.
2. Cambia `ADMIN_PASSWORD` antes del primer arranque.
3. Usa HTTPS.
4. Configura `FRONTEND_ORIGIN` con el dominio real.
5. Activa reCAPTCHA.
6. Coloca el backend detrás de proxy configurado correctamente para preservar IP real.
7. Considera protección adicional antifraude: fingerprinting, rate-limit distribuido, auditoría y moderación de comentarios.

## Limitación del voto anónimo

El sistema no requiere login. Por eso el control de “1 voto por usuario” se basa en IP + navegador. Es útil como protección básica, pero no garantiza identidad única real. Usuarios con VPN, modo incógnito, limpieza de cookies o redes compartidas pueden afectar la precisión.
