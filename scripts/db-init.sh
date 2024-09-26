#!/bin/bash
# This script creates a new database and user for the Ory services.

set -e
set -u

echo "Creating Ory user and database..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
        CREATE USER ory WITH PASSWORD '$POSTGRES_PASSWORD';
	    CREATE DATABASE ory;
	    GRANT ALL PRIVILEGES ON DATABASE ory TO ory;
EOSQL

echo "Ory user and database created successfully."
