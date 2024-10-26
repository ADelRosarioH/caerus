#!/bin/bash
# This script creates a new database and user for the Supertokens services.

set -e
set -u

echo "Creating Supertokens user and database..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
        CREATE USER supertokens WITH PASSWORD '$POSTGRES_PASSWORD';
	    CREATE DATABASE supertokens;
	    GRANT ALL PRIVILEGES ON DATABASE supertokens TO supertokens;
EOSQL

echo "Supertokens user and database created successfully."
