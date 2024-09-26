#!/bin/bash

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

# Load environment variables
source "./config/${ENV}.env"

echo "Creating collection schemas in Typesense for ${ENV} environment..."

# Function to retry a command
retry() {
    local -r -i max_attempts="$1"; shift
    local -i attempt_num=1
    until "$@"
    do
        if ((attempt_num==max_attempts))
        then
            echo "Attempt $attempt_num failed and there are no more attempts left!"
            return 1
        else
            echo "Attempt $attempt_num failed! Trying again in $attempt_num seconds..."
            sleep $((attempt_num++))
        fi
    done
}

# Wait for Typesense to be ready
retry 5 curl -s -o /dev/null -w "%{http_code}" ${TYPESENSE_HOST}/health | grep 200

# Create schemas
echo "Creating Typesense schemas..."

# Loop from ../search/collections/*.schema.json and create collections
for schema_file in ../search/collections/*.schema.json; do
    echo "Creating collection from schema file: ${schema_file}"
    curl -X POST ${TYPESENSE_HOST}/collections \
        -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "@${schema_file}"
done

echo "Collection schemas created successfully!"
