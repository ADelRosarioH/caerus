#!/bin/sh

set -e

until nc -z postgres 5432; do
    echo "Waiting for PostgreSQL to be ready..."
    sleep 1
done

echo "Running Keto migrations..."
keto migrate up --yes --config /etc/config/keto/keto.yml
echo "Keto migrations completed."

keto serve -c /etc/config/keto/keto.yml
