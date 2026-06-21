.PHONY: help dev dev-local docker-check docker-init docker-up docker-down docker-logs docker-seed docker-health docker-rebuild docker-dev docker-dev-down docker-ps compose railway-setup railway-seed railway-health

COMPOSE := ./scripts/compose.sh
COMPOSE_DEV := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml

help:
	@echo "Ingobyi Academy"
	@echo ""
	@echo "Local development (no Docker for app):"
	@echo "  make dev             Start API + frontend (PostgreSQL must be running)"
	@echo ""
	@echo "Docker (staging / in-house test):"
	@echo "  make docker-check    Verify Docker + Compose installed"
	@echo "  make docker-init     Create .env with generated secrets"
	@echo "  make docker-up       Build & start full stack (nginx + API + web + db)"
	@echo "  make docker-down     Stop stack"
	@echo "  make docker-logs     Follow logs"
	@echo "  make docker-seed     Load demo users + sample data"
	@echo "  make docker-health   Ping /api/health"
	@echo "  make docker-rebuild  Force rebuild all images"
	@echo "  make docker-ps       Show running containers"
	@echo ""
	@echo "Railway (testing deploy):"
	@echo "  make railway-setup   Checklist + JWT secrets for Railway"
	@echo "  make railway-migrate Run migrations (needs DATABASE_URL)"
	@echo "  make railway-seed    Load demo users on deployed API"
	@echo "  make railway-health  Ping API + frontend URLs"
	@echo ""
	@echo "Docker (development — hot reload):"
	@echo "  make docker-dev      Start postgres + API + frontend with live reload"
	@echo "  make docker-dev-down Stop dev stack"
	@echo ""
	@echo "Local Node (API + frontend together):"
	@echo "  make dev             Start backend :3001 + frontend :3000 (requires postgres)"
	@echo "  npm run dev          Same as make dev"
	@echo "  npm run build        Build backend + frontend"
	@echo "  npm run start        Run both in production mode (run build first)"

dev:
	npm run dev

start:
	npm run start

build:
	npm run build

compose:
	@$(COMPOSE) version || true

docker-check:
	@./scripts/docker-check.sh

docker-init:
	@./scripts/docker-init.sh

docker-up:
	@./scripts/docker-up.sh

docker-down:
	$(COMPOSE) down

docker-logs:
	$(COMPOSE) logs -f

docker-seed:
	$(COMPOSE) --profile seed run --rm seed

docker-health:
	@curl -sf "$${PUBLIC_URL:-http://localhost}/api/health" | python3 -m json.tool

docker-rebuild:
	$(COMPOSE) up -d --build --force-recreate

docker-ps:
	$(COMPOSE) ps

docker-dev:
	$(COMPOSE_DEV) up --build

docker-dev-down:
	$(COMPOSE_DEV) down

dev:
	@chmod +x scripts/dev-local.sh
	@./scripts/dev-local.sh

dev-local: dev

staging-up: docker-up
staging-down: docker-down
staging-logs: docker-logs
staging-seed: docker-seed
staging-health: docker-health
staging-rebuild: docker-rebuild

railway-setup:
	@chmod +x scripts/railway-setup.sh scripts/railway-seed.sh scripts/railway-health.sh scripts/railway-migrate.sh backend/scripts/railway-start.sh
	@./scripts/railway-setup.sh

railway-migrate:
	@chmod +x scripts/railway-migrate.sh
	@./scripts/railway-migrate.sh

railway-seed:
	@chmod +x scripts/railway-seed.sh
	@./scripts/railway-seed.sh

railway-health:
	@chmod +x scripts/railway-health.sh
	@./scripts/railway-health.sh $(API_URL) $(FRONTEND_URL)
