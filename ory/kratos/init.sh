#!/bin/sh

set -e

until nc -z postgres 5432; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 1
done

echo "Running Kratos migrations..."
kratos migrate sql -e --yes
echo "Kratos migrations completed."

kratos serve -c /etc/config/kratos/kratos.yml --dev --watch-courier
