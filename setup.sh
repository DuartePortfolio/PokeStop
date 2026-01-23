#!/bin/bash

# ============================================
# PokeStop Application - Quick Start Script
# ============================================
# This script automates the complete setup process

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          PokeStop Application - Setup Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/5]${NC} Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found, creating from defaults...${NC}"
    cp .env.example .env 2>/dev/null || cat > .env << 'EOF'
DB_USER=root
DB_PASSWORD=enter
MONGO_USER=root
MONGO_PASSWORD=enter
JWT_SECRET=pokestop-secret-change-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=production
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Stop existing containers
echo ""
echo -e "${BLUE}[2/5]${NC} Preparing Docker environment..."
if docker-compose ps | grep -q "running"; then
    echo -e "${YELLOW}⚠ Stopping existing containers...${NC}"
    docker-compose down --remove-orphans 2>/dev/null || true
fi
echo -e "${GREEN}✓ Docker environment ready${NC}"

# Build services
echo ""
echo -e "${BLUE}[3/5]${NC} Building Docker images (this may take a few minutes)..."
docker-compose build --no-cache 2>&1 | grep -E "Step|Building|Successfully" || true
echo -e "${GREEN}✓ Docker images built${NC}"

# Start services
echo ""
echo -e "${BLUE}[4/5]${NC} Starting services..."
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"

# Wait for databases to be ready
echo ""
echo -e "${BLUE}[5/5]${NC} Waiting for databases to initialize..."
echo "   This may take 30-60 seconds..."

# Check MySQL
MYSQL_READY=0
for i in {1..30}; do
    if docker exec pokestop-db mysqladmin ping -h localhost -u root -penter &> /dev/null; then
        MYSQL_READY=1
        break
    fi
    echo -n "."
    sleep 2
done

if [ $MYSQL_READY -eq 1 ]; then
    echo -e "\n${GREEN}✓ MySQL database ready${NC}"
else
    echo -e "\n${RED}✗ MySQL database failed to start${NC}"
    exit 1
fi

# Check MongoDB
MONGO_READY=0
for i in {1..30}; do
    if docker exec pokestop-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null 2>&1; then
        MONGO_READY=1
        break
    fi
    echo -n "."
    sleep 2
done

if [ $MONGO_READY -eq 1 ]; then
    echo -e "\n${GREEN}✓ MongoDB database ready${NC}"
else
    echo -e "\n${YELLOW}⚠ MongoDB may still be initializing (this is normal)${NC}"
fi

# Verify services
echo ""
echo -e "${BLUE}Verifying services...${NC}"
SERVICES=("pokestop-api-gateway" "pokestop-authentication-service" "pokestop-user-service" "pokestop-team-service" "pokestop-pokedex-service" "pokestop-collection-service" "pokestop-encounter-service" "pokestop-db" "pokestop-mongodb")

for service in "${SERVICES[@]}"; do
    if docker ps | grep -q "$service"; then
        echo -e "${GREEN}✓${NC} $service"
    else
        echo -e "${YELLOW}⚠${NC} $service (may still be starting...)"
    fi
done

# Final summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║              Setup Complete! ✓                            ║${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Access Points:"
echo "   • Web Interface:     http://localhost/"
echo "   • GraphQL Explorer:  http://localhost:3001/graphql"
echo "   • API Gateway:       http://localhost/"
echo ""
echo "🗄️  Database Access:"
echo "   • MySQL:    localhost:3307"
echo "   • MongoDB:  localhost:27017"
echo ""
echo "📊 Useful Commands:"
echo "   • View logs:    docker-compose logs -f"
echo "   • Stop:         docker-compose down"
echo "   • Restart:      docker-compose restart"
echo "   • Status:       docker-compose ps"
echo ""
echo "📚 Documentation:"
echo "   • Setup Guide:    SETUP.md"
echo "   • GraphQL API:    user-service/GRAPHQL_API.md"
echo ""
echo "🔐 Test Credentials:"
echo "   • Username:  testuser"
echo "   • Password:  (check database-schemas/pokestop_users_db.sql)"
echo ""
echo "For more information, see SETUP.md"
