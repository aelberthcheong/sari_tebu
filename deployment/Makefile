SARI_TEBU_DIR?= /home/akunsialbert/Projects/sari_tebu
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

scale-up: ## Scale up a second container for backend and frontend
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale api=2 --no-recreate api
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale web=2 --no-recreate web

scale-down: ## Scale down the old container for backend and frontend
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale api=1 --no-recreate api
	docker compose -f "$(COMPOSE_FILE)" up -d --no-deps --scale web=1 --no-recreate web

migrate: ## migrate database
	docker compose -f "$(COMPOSE_FILE)" run --rm api npx prisma migrate deploy

reset: ## reset database (All data will be lost)
	docker compose -f "$(COMPOSE_FILE)" run --rm api npx prisma migrate reset

down: ## Close down all containers
	docker compose -f "$(COMPOSE_FILE)" down