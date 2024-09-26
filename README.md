# AWS-based Web Application

This project is a web application deployed on AWS, using Pulumi for infrastructure management, Go Fiber for the backend, Next.js for the frontend, and various supporting technologies like Ory for authentication and authorization, GORM with Atlas for database management, and Typesense for search functionality.

## Prerequisites

Before you begin, ensure you have the following tools installed on your system:

- Go (1.20+ LTS)
- Node.js (18+ LTS) and npm
- Docker and Docker Compose
- Pulumi CLI
- Atlas CLI
- AWS CLI (configured with your credentials)

We recommend using version managers for Go and Node.js to easily switch between versions:

- Go: Use [gvm](https://github.com/moovweb/gvm)
- Node.js: Use [nvm](https://github.com/nvm-sh/nvm)

### Installation Instructions

#### macOS

1. Install Homebrew (if not already installed):
   ```
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install gvm and Go:
   ```
   xcode-select --install
   brew install mercurial
   bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
   gvm install go1.20 -B
   gvm use go1.20
   ```

3. Install nvm and Node.js:
   ```
   brew install nvm
   nvm install --lts
   nvm use --lts
   ```

4. Install other required tools:
   ```
   brew install docker docker-compose pulumi awscli
   brew tap ariga/tap
   brew install atlas
   ```

5. Start Docker Desktop application

#### Linux (Ubuntu/Debian)

1. Update package list:
   ```
   sudo apt update
   ```

2. Install gvm and Go:
   ```
   sudo apt-get install curl git mercurial make binutils bison gcc build-essential
   bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
   source ~/.gvm/scripts/gvm
   gvm install go1.20 -B
   gvm use go1.20
   ```

3. Install nvm and Node.js:
   ```
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   ```

4. Install Docker and Docker Compose:
   ```
   sudo apt install docker.io docker-compose
   ```

5. Install Pulumi:
   ```
   curl -fsSL https://get.pulumi.com | sh
   ```

6. Install AWS CLI:
   ```
   sudo apt install awscli
   ```

7. Install Atlas:
   ```
   curl -sSf https://atlasgo.sh | sh -s -- --community
   ```

#### Windows

1. Install Chocolatey (if not already installed):
   - Open PowerShell as Administrator and run:
     ```
     Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
     ```

2. Install required tools:
   ```
   choco install golang nodejs docker-desktop pulumi awscli
   ```

3. Install Atlas:
   - Download the latest release from https://github.com/ariga/atlas/releases
   - Extract the executable and add it to your PATH

4. For version management on Windows:
   - Go: Use [gvm-windows](https://github.com/andrewkroh/gvm)
   - Node.js: Use [nvm-windows](https://github.com/coreybutler/nvm-windows)

5. Start Docker Desktop application

## Local Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```
   make setup
   ```

3. Start the local development environment:
   ```
   make run
   ```

4. Run database migrations:
   ```
   make db:migrate
   ```

5. Seed the database (local environment only):
   ```
   make db:seed
   ```

6. Initialize Keto (for authorization):
   ```
   make auth:init
   ```

7. Index data in Typesense:
   ```
   make search:index
   ```

## Local Development with Docker

This project uses Docker Compose for local development. The setup includes a `docker-compose.override.yml` file that enhances the development experience.

### Features of the Local Development Setup

- Live reloading for both backend and frontend
- Exposed ports for all services for easy debugging
- MailHog for email testing
- Development-specific Dockerfiles for backend and frontend

### Running the Local Development Environment

1. Ensure you have Docker and Docker Compose installed.

2. Start the development environment:
```
docker-compose up -d
```

This command will use both `docker-compose.yml` and `docker-compose.override.yml`.

3. Access the services:
- Backend API: http://localhost:8080
- Frontend: http://localhost:3000
- MailHog Web UI: http://localhost:8025
- Kratos Public API: http://localhost:4433
- Kratos Admin API: http://localhost:4434
- Keto Read API: http://localhost:4466
- Keto Write API: http://localhost:4467
- Oathkeeper API: http://localhost:4456
- Typesense API: http://localhost:8108

4. To stop the environment:
```
docker-compose down
```

### Debugging

- Backend: The Go debugger (Delve) is exposed on port 2345. You can connect to it using your IDE's remote debugging feature.
- Frontend: You can use your browser's developer tools as usual.

### Customizing the Local Environment

If you need to make changes specific to your local setup:

1. Create a `docker-compose.override.local.yml` file.
2. Add your custom configurations to this file.
3. Run Docker Compose with:
```
docker-compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.override.local.yml up -d
```

This way, you can have personal customizations without affecting the shared development configuration.

## Environment Configuration

This project uses environment-specific configuration files located in the `config/` directory. The available environments are:

- `local`: For local development
- `dev`: For the development environment
- `staging`: For the staging environment
- `prod`: For the production environment

### Setting Up Your Local Environment

1. Copy the example configuration file:
   ```
   cp config/example.env config/local.env
   ```

2. Edit `config/local.env` and fill in the appropriate values for your local setup.

### Using Environment Configurations

The application determines which environment file to use based on the `ENV` environment variable. If not set, it defaults to `local`.

- Backend (Go):
  The application automatically loads the appropriate `.env` file based on the `ENV` variable.

- Infrastructure (Pulumi):
  Pulumi scripts load the environment variables from the appropriate `.env` file based on the Pulumi stack.

- Frontend (Next.js):
  The `next.config.js` file loads the appropriate `.env` file and exposes necessary variables to the browser.

### Running in Different Environments

To run the application in a specific environment, set the `ENV` variable before running your commands:

```
ENV=dev make run
```

For Pulumi deployments, the environment is determined by the Pulumi stack:

```
pulumi stack select dev
make deploy
```

## Building the Application

- Build the backend:
  ```
  make build:backend
  ```

- Build the frontend:
  ```
  make build:frontend
  ```

## Running Tests

- Run backend tests:
  ```
  make test:backend
  ```

- Run frontend tests:
  ```
  make test:frontend
  ```

## Deployment

Deploy to a specific environment (dev, staging, prod):

```
make deploy ENV=dev
```

## Project Structure

- `infra/`: Pulumi infrastructure as code
- `backend/`: Go Fiber backend application
- `frontend/`: Next.js frontend application
- `ory/`: Ory (Kratos, Keto, Oathkeeper) configurations
- `scripts/`: Utility scripts
- `config/`: Environment-specific configuration files

## Backend Development

This project uses Air for live-reloading during Go development.

### Installing Air

```bash
go install github.com/cosmtrek/air@latest
```

### Using Air

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run your application with Air:
   ```
   air
   ```

Air will now watch your Go files and automatically rebuild and restart your application when changes are detected.

### Configuring Air

You can customize Air's behavior by creating a `.air.toml` file in your project root. See the Air documentation for more details on configuration options.

# Ory Stack Setup

This project includes a custom Docker setup for the Ory stack (Kratos, Keto, and Oathkeeper) along with PostgreSQL and Mailslurper for email testing.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Create your configuration files:
   - `ory/kratos/kratos.yml`
   - `ory/keto/keto.yml`
   - `ory/oathkeeper/oathkeeper.yml`
   - `ory/oathkeeper/access-rules.yml`

3. Build and start the services:
   ```
   docker-compose up --build
   ```

   For development with hot-reloading of configuration files:
   ```
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
   ```

4. Access the services:
   - Kratos Public API: http://localhost:4433
   - Kratos Admin API: http://localhost:4434
   - Keto Read API: http://localhost:4466
   - Keto Write API: http://localhost:4467
   - Oathkeeper Proxy: http://localhost:4455
   - Oathkeeper API: http://localhost:4456
   - Mailslurper Web Interface: http://localhost:4436

## Email Testing with Mailslurper

Mailslurper is included in this setup to capture all outgoing emails from Kratos. This is useful for testing email-based flows like registration and password reset without sending actual emails.

To view captured emails:
1. Open the Mailslurper web interface at http://localhost:4436
2. Any emails sent by Kratos will appear here

## Development

For local development, the `docker-compose.override.yml` file mounts the configuration files as volumes, allowing you to make changes without rebuilding the containers. It also enables development mode and hot-reloading where available.

## Customization

You can customize the Dockerfiles, configuration files, and docker-compose files to suit your specific needs. Remember to update the `init-db.sql` file if you need to create additional databases or users.

## Security Note

The passwords and secrets in this setup are for demonstration purposes only. In a production environment, use strong, unique passwords and store them securely (e.g., using Docker secrets or environment variables injected at runtime).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
