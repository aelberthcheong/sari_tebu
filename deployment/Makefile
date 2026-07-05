SARI_TEBU_DIR?= /home/akunsialbert/Projects/Sari-Tebu
COMPOSE_FILE := $(SARI_TEBU_DIR)/deployment/compose.yaml

.DEFAULT_GOAL := help
.PHONY: up down build scale-up scale-down help migrate reset help

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

build: ## Build the docker containers
	docker compose -f "$(COMPOSE_FILE)" build

up: ## Run backend and frontend containers
	docker compose -f "$(COMPOSE_FILE)" up -d

scale-up: ## Scale up a second container for backend and frontend server
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale server=2 --no-recreate server
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale frontend=2 --no-recreate frontend

scale-down: ## Scale down the old container for backend and frontend server
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale server=1 --no-recreate server
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale frontend=1 --no-recreate frontend

migrate: ## migrate database
	docker compose -f "$(COMPOSE_FILE)" run --rm server npx prisma migrate deploy

reset: ## reset database (All data will be lost)
	docker compose -f "$(COMPOSE_FILE)" run --rm server npx prisma migrate reset

down: ## Close down all containers
	docker compose -f "$(COMPOSE_FILE)" down