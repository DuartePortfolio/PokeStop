# ============================================
# PokeStop Application - Quick Start Script (Windows)
# ============================================
# This script automates the complete setup process for Windows

param(
    [switch]$Force = $false,
    [switch]$Clean = $false
)

# Color codes
function Write-Success { Write-Host "$args" -ForegroundColor Green }
function Write-Error { Write-Host "$args" -ForegroundColor Red }
function Write-Warning { Write-Host "$args" -ForegroundColor Yellow }
function Write-Info { Write-Host "$args" -ForegroundColor Cyan }
function Write-Step { Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $args" -ForegroundColor Blue }

Clear-Host
Write-Host ""
Write-Host "========================================================"
Write-Host "  PokeStop Application - Setup Script (Windows)"
Write-Host "========================================================"
Write-Host ""

# Check prerequisites
Write-Step "Checking prerequisites..."
$dockerCheck = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Docker is not installed or not accessible"
    Write-Host "   Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
}
Write-Success "[OK] Docker found: $dockerCheck"

$composeCheck = docker-compose --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "[ERROR] Docker Compose is not installed"
    exit 1
}
Write-Success "[OK] Docker Compose found: $composeCheck"

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Warning "[WARNING] .env file not found, creating from defaults..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        @"
DB_USER=root
DB_PASSWORD=enter
MONGO_USER=root
MONGO_PASSWORD=enter
JWT_SECRET=pokestop-secret-change-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=production
"@ | Out-File -Encoding ASCII ".env"
    }
    Write-Success "[OK] .env file created"
} else {
    Write-Success "[OK] .env file exists"
}

# Clean option
if ($Clean) {
    Write-Step "Cleaning existing containers and volumes..."
    Write-Warning "[WARNING] This will delete all data!"
    $confirm = Read-Host "Type 'yes' to confirm"
    if ($confirm -eq "yes") {
        docker-compose down -v 2>&1 | Out-Null
        Write-Success "[OK] Cleaned up"
    } else {
        Write-Warning "[WARNING] Cleanup cancelled"
    }
}

# Stop existing containers
Write-Host ""
Write-Step "Preparing Docker environment..."
$runningContainers = docker-compose ps 2>&1
if ($runningContainers -match "running") {
    Write-Warning "[WARNING] Stopping existing containers..."
    docker-compose down --remove-orphans 2>&1 | Out-Null
}
Write-Success "[OK] Docker environment ready"

# Build services
Write-Host ""
Write-Step "Building Docker images (this may take a few minutes)..."
Write-Host "   Building... " -NoNewline
$buildOutput = docker-compose build --no-cache 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "[OK] Docker images built"
} else {
    Write-Error "[ERROR] Failed to build Docker images"
    Write-Host $buildOutput
    exit 1
}

# Start services
Write-Host ""
Write-Step "Starting services..."
docker-compose up -d 2>&1 | Out-Null
Write-Success "[OK] Services started"

# Wait for databases
Write-Host ""
Write-Step "Waiting for databases to initialize (30 to 60 seconds)..."

# Check MySQL
Write-Host "   Checking MySQL... " -NoNewline
$mysqlReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        docker exec pokestop-db mysqladmin ping -h localhost -u root -penter 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $mysqlReady = $true
            break
        }
    } catch {
    }
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
}

if ($mysqlReady) {
    Write-Success "`n[OK] MySQL database ready"
} else {
    Write-Error "`n[ERROR] MySQL database failed to start"
    exit 1
}

# Check MongoDB
Write-Host "   Checking MongoDB... " -NoNewline
$mongoReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        docker exec pokestop-mongodb mongosh --eval "db.adminCommand('ping')" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $mongoReady = $true
            break
        }
    } catch {
    }
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
}

if ($mongoReady) {
    Write-Success "`n[OK] MongoDB database ready"
} else {
    Write-Warning "`n[WARNING] MongoDB may still be initializing (this is normal)"
}

# Verify services
Write-Host ""
Write-Info "Verifying services..."
$services = @(
    "pokestop-api-gateway",
    "pokestop-authentication-service",
    "pokestop-user-service",
    "pokestop-team-service",
    "pokestop-pokedex-service",
    "pokestop-collection-service",
    "pokestop-encounter-service",
    "pokestop-db",
    "pokestop-mongodb"
)

foreach ($service in $services) {
    $status = docker ps --filter "name=$service" --format "{{.Status}}" 2>&1
    if ($status) {
        Write-Success "[OK] $service"
    } else {
        Write-Warning "[WARNING] $service (may still be starting...)"
    }
}

# Final summary
Write-Host ""
Write-Host "========================================================"
Write-Success "              Setup Complete!"
Write-Host "========================================================"
Write-Host ""
Write-Info "[ACCESS] Access Points:"
Write-Host "   . Web Interface:     http://localhost/"
Write-Host "   . GraphQL Explorer:  http://localhost:3001/graphql"
Write-Host "   . API Gateway:       http://localhost/"
Write-Host ""
Write-Info "[DATABASE] Database Access:"
Write-Host "   . MySQL:    localhost:3307"
Write-Host "   . MongoDB:  localhost:27017"
Write-Host ""
Write-Info "[COMMANDS] Useful Commands:"
Write-Host "   . View logs:    docker-compose logs -f"
Write-Host "   . Stop:         docker-compose down"
Write-Host "   . Restart:      docker-compose restart"
Write-Host "   . Status:       docker-compose ps"
Write-Host ""
Write-Info "[DOCS] Documentation:"
Write-Host "   . Setup Guide:    SETUP.md"
Write-Host "   . GraphQL API:    user-service\GRAPHQL_API.md"
Write-Host ""
Write-Info "[CREDS] Test Credentials:"
Write-Host "   . Username:  testuser"
Write-Host "   . Password:  (check database-schemas/pokestop_users_db.sql)"
Write-Host ""
Write-Host "For more information, see SETUP.md"
Write-Host ""

# Pause so user can read output
Read-Host "Press Enter to continue"
