# Define the default environment
ENV ?= local

.PHONY: setup run re-create build test deploy
.PHONY: db-migrate db-schema-apply db-seed

# Setup
setup:
	@echo "Setting up development environment..."
	@./scripts/setup-local.sh

# Run
run:
	@if [ "$(ENV)" = "local" ]; then \
		echo "Starting local development environment..."; \
		docker compose --env-file config/$(ENV).env -f compose.yml up -d --build; \
	else \
		echo "Run command is only for local environment"; \
	fi

re-create:
	@if [ "$(ENV)" = "local" ]; then \
		echo "Starting local development environment..."; \
		docker compose --env-file config/$(ENV).env -f compose.yml up -d --build --force-recreate; \
	else \
		echo "Run command is only for local environment"; \
	fi

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

# Help
help:
	@echo "Usage: make [target] [ENV=environment]"
	@echo ""
	@echo "Available targets:"
	@echo "  setup             : Set up development environment"
	@echo "  run               : Start local development environment (local only)"
	@echo "  deploy            : Deploy to specified environment"
	@echo "  db-migrate        : Run database migrations"
	@echo "  db-schema-apply   : Apply database migrations"
	@echo "  db-seed           : Seed database (local only)"
	@echo ""
	@echo "Environments:"
	@echo "  local (default), dev, staging, prod"
	@echo ""
	@echo "Example:"
	@echo "  make deploy ENV=prod"
