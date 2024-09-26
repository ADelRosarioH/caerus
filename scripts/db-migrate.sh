#!/bin/bash

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

# Load environment variables
source "./config/${ENV}.env"

echo "Running migrations for ${ENV} environment..."

cd "backend"

# Use Atlas to run migrations
if [ "$ENV" == "local" ]; then
    DB="localhost:${DB_PORT}"
else
    DB="${DB_HOST}:${DB_PORT}"
fi

DB_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB}/${DB_NAME}?sslmode=disable"

atlas migrate diff \
    --config file://atlas.hcl \
    --env gorm

echo "Migrations completed successfully."
