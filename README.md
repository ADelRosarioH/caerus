# Caerus

This project is a web application deployed on AWS, using Pulumi for infrastructure management, Go Fiber for the backend, Remix for the frontend, and supporting technologies like Keycloak for authentication and authorization, and GORM with Atlas for database management.

## Prerequisites

Before you begin, ensure you have the following tools installed on your system:

- Go (1.20+ LTS)
- Node.js (18+ LTS) and npm
- Docker and Docker Compose
- Pulumi CLI
- Atlas CLI
- AWS CLI (configured with your credentials)

We recommend using version managers for Go and Node.js:
- Go: [gvm](https://github.com/moovweb/gvm)
- Node.js: [nvm](https://github.com/nvm-sh/nvm)

### Installation Instructions

#### macOS

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install gvm and Go
xcode-select --install
brew install mercurial
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
gvm install go1.20 -B
gvm use go1.20

# Install nvm and Node.js
brew install nvm
nvm install --lts
nvm use --lts

# Install other required tools
brew install docker docker-compose pulumi awscli
brew tap ariga/tap
brew install atlas
```

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install gvm and Go
sudo apt-get install curl git mercurial make binutils bison gcc build-essential
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
source ~/.gvm/scripts/gvm
gvm install go1.20 -B
gvm use go1.20

# Install nvm and Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install other tools
sudo apt install docker.io docker-compose
curl -fsSL https://get.pulumi.com | sh
sudo apt install awscli
curl -sSf https://atlasgo.sh | sh -s -- --community
```

#### Windows

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install required tools
choco install golang nodejs docker-desktop pulumi awscli
```

For Atlas, download the latest release from https://github.com/ariga/atlas/releases and add it to your PATH.

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Set up your local environment:
```bash
make setup
```

3. Start the local development environment:
```bash
make run
```

4. Run database migrations:
```bash
make db-migrate
make db-schema-apply
```

5. Seed the database (local environment only):
```bash
make db-seed
```

## Local Development with Docker

The project uses Docker Compose for local development, with features including:
- Live reloading for both backend (using Air) and frontend
- Remote debugging for the backend using Delve (port 2345)
- MailHog for email testing

### Available Services

- Backend API: http://localhost:8081 (configurable via environment variables)
- Frontend: http://localhost:3000
- Keycloak: http://localhost:8080
- MailHog Web UI: http://localhost:8025

### Customizing Local Environment

If you need to customize your local setup:
1. Create a `compose.override.yml` file
2. Add your custom configurations
3. Run with both files:
```bash
docker compose -f compose.yml -f compose.override.yml up -d
```

## Keycloak Configuration

The project includes a default realm configuration for Keycloak. During container startup, any realm JSON files in the `keycloak/realms` directory will be automatically imported.

A default realm (`caerus.json`) is provided with basic configuration. To add additional realms:

1. Create your realm JSON file in the `keycloak/realms` directory
2. Restart the Keycloak container to import the new realm:
```bash
docker compose restart keycloak
```

## Environment Configuration

The project uses environment-specific `.env` files located in the `config/` directory. For local development:

1. Copy the example configuration:
```bash
cp config/example.env config/local.env
```

2. Edit `config/local.env` with your local settings

The application determines which environment file to use based on the `ENV` environment variable (defaults to `local`).

## Available Make Commands

```bash
make setup              # Set up development environment
make run               # Start local development environment (local only)
make re-create         # Recreate and start local environment (local only)
make deploy ENV=<env>  # Deploy to specified environment
make db-migrate        # Run database migrations
make db-schema-apply   # Apply database migrations
make db-seed           # Seed database (local only)
```

## Debugging

### Backend

The Go debugger (Delve) is exposed on port 2345. VS Code launch configurations are provided in `.vscode/launch.json` for easy debugging setup.

### Frontend

Use your browser's developer tools for frontend debugging.

## Project Structure

```
.
├── infra/           # Pulumi infrastructure code
├── backend/         # Go Fiber backend application
├── frontend/        # Remix frontend application
├── keycloak/        # Keycloak configuration and realms
│   └── realms/      # Realm JSON files
├── scripts/         # Utility scripts
└── config/          # Environment configuration files
```
