#!/bin/bash

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

if [ "$ENV" != "local" ]; then
    echo "Seeding is only allowed in the local environment."
    exit 1
fi

# Load environment variables
source "./config/${ENV}.env"

echo "Seeding database for ${ENV} environment..."

# Use psql to run the seed SQL file
psql "${DB_URL}" -f "./backend/seeds/001_initial_data.sql"

echo "Database seeding completed successfully."
