# Define the default environment
ENV ?= local

.PHONY: setup run build test deploy
.PHONY: db-migrate db-schema-apply db-seed
.PHONY: setup-typesense help

# Setup
setup:
	@echo "Setting up development environment..."
	@./scripts/setup-local.sh

# Run
run:
	@if [ "$(ENV)" = "local" ]; then \
		echo "Starting local development environment..."; \
		docker compose --env-file config/$(ENV).env -f compose.yml -f compose.override.yml up -d --build; \
	else \
		echo "Run command is only for local environment"; \
	fi

# Build
build-backend:
	@echo "Building backend for $(ENV) environment..."
	@cd backend && go build -o bin/api cmd/api/main.go

build-frontend:
	@echo "Building frontend for $(ENV) environment..."
	@cd frontend && npm run build

# Test
test-backend:
	@echo "Running backend tests..."
	@cd backend && go test ./...

test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test

# Deploy
deploy:
	@echo "Deploying to $(ENV) environment..."
	@cd infra && pulumi up --stack $(ENV) --yes

# Database
db-migrate:
	@echo "Running database migrations for $(ENV) environment..."
	@./scripts/db-migrate.sh $(ENV)

db-schema-apply:
	@echo "Applying database migrations for $(ENV) environment..."
	@./scripts/db-schema-apply.sh $(ENV)

db-seed:
	@if [ "$(ENV)" = "local" ]; then \
		echo "Seeding local database..."; \
		./scripts/seed.sh local; \
	else \
		echo "Seeding is only for local environment"; \
	fi

# Search
setup-typesense:
	@echo "Creating colleection schemas in Typesense for $(ENV) environment..."
	@./scripts/setup-typesense.sh $(ENV)

# Help
help:
	@echo "Usage: make [target] [ENV=environment]"
	@echo ""
	@echo "Available targets:"
	@echo "  setup             : Set up development environment"
	@echo "  run               : Start local development environment (local only)"
	@echo "  build-backend     : Build the backend"
	@echo "  build-frontend    : Build the frontend"
	@echo "  test-backend      : Run backend tests"
	@echo "  test-frontend     : Run frontend tests"
	@echo "  deploy            : Deploy to specified environment"
	@echo "  db-migrate        : Run database migrations"
	@echo "  db-schema-apply   : Apply database migrations"
	@echo "  db-seed           : Seed database (local only)"
	@echo "  setup-typesense   : Create collection schemas in Typesense"
	@echo ""
	@echo "Environments:"
	@echo "  local (default), dev, staging, prod"
	@echo ""
	@echo "Example:"
	@echo "  make deploy ENV=prod"
