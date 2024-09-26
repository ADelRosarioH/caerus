#!/bin/bash

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

# Load environment variables
source "./config/${ENV}.env"

echo "Applying migrations for ${ENV} environment..."

cd "backend"

# Use Atlas to run migrations

if [ "$ENV" == "local" ]; then
    DB="localhost:${DB_PORT}"
else
    DB="${DB_HOST}:${DB_PORT}"
fi

DB_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB}/${DB_NAME}?sslmode=disable"

atlas schema apply \
    --config file://atlas.hcl \
    --env gorm \
    --url "${DB_URL}"

echo "Migrations completed successfully."
