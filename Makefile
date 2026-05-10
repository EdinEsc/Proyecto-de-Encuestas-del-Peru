.PHONY: up down logs ps rebuild clean neon

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

rebuild:
	docker compose build --no-cache

clean:
	docker compose down -v --remove-orphans

neon:
	docker compose -f docker-compose.neon.yml up --build
