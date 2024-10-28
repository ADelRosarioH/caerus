#!/bin/bash

set -e

echo "Setting up local development environment..."

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required but not installed. Aborting."; exit 1; }
command -v go >/dev/null 2>&1 || { echo >&2 "Go is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }
command -v atlas version >/dev/null 2>&1 || { echo >&2 "Atlas CLI is required but not installed. Aborting."; exit 1; }
command -v pulumi >/dev/null 2>&1 || { echo >&2 "Pulumi is required but not installed. Aborting."; exit 1; }

# Copy environment files
echo "Setting up environment files..."
cp config/example.env config/local.env

echo "Local development environment setup complete!"
echo "Please edit the .env files in the config directory with your specific configuration."
