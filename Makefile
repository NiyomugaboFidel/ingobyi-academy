.PHONY: help docker-check docker-init docker-up docker-down docker-logs docker-seed docker-health docker-rebuild docker-dev docker-dev-down docker-ps compose

COMPOSE := ./scripts/compose.sh
COMPOSE_DEV := $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml

help:
	@echo "Ingobyi Academy"
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
	@echo "Docker (development — hot reload):"
	@echo "  make docker-dev      Start postgres + API + frontend with live reload"
	@echo "  make docker-dev-down Stop dev stack"

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

staging-up: docker-up
staging-down: docker-down
staging-logs: docker-logs
staging-seed: docker-seed
staging-health: docker-health
staging-rebuild: docker-rebuild
