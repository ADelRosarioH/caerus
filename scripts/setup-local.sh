#!/bin/bash

set -e

echo "Setting up local development environment..."

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required but not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo >&2 "Docker Compose is required but not installed. Aborting."; exit 1; }
command -v go >/dev/null 2>&1 || { echo >&2 "Go is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo >&2 "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but not installed. Aborting."; exit 1; }
command -v atlas version >/dev/null 2>&1 || { echo >&2 "Atlas CLI is required but not installed. Aborting."; exit 1; }

# Install global dependencies
echo "Installing global dependencies..."
npm install -g @pulumi/pulumi

# Set up backend
echo "Setting up backend..."
cd backend
go mod download
cd ..

# Set up frontend
echo "Setting up frontend..."
cd frontend
npm install
cd ..

# Copy environment files
echo "Setting up environment files..."
cp config/example.env config/local.env

echo "Local development environment setup complete!"
echo "Please edit the .env files in the config directory with your specific configuration."
