#!/bin/bash

echo "=========================================="
echo "PokeStop System Health Check"
echo "=========================================="
echo ""

# Check Docker services
echo "1. Docker Containers Status:"
echo "--------------------------------"
docker ps --filter "label=com.docker.compose.project=pokestop" --format "table {{.Names}}\t{{.Status}}" | grep -E "^pokestop|^NAMES"
echo ""

# Check API Gateway
echo "2. API Gateway (NGINX):"
echo "--------------------------------"
curl -sS -I http://localhost/ | head -3
echo ""

# Check Authentication Service
echo "3. Authentication Service:"
echo "--------------------------------"
curl -sS -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' 2>/dev/null | jq '.message // .' 2>/dev/null || echo "Service is running"
echo ""

# Check User Service (REST)
echo "4. User Service (REST Endpoint):"
echo "--------------------------------"
curl -sS -I http://localhost:3001/users 2>/dev/null | head -1
echo ""

# Check User Service (GraphQL)
echo "5. User Service (GraphQL):"
echo "--------------------------------"
curl -sS -X OPTIONS http://localhost:3001/graphql -I 2>/dev/null | head -1
echo ""

# Check Encounter Service
echo "6. Encounter Service:"
echo "--------------------------------"
curl -sS -X OPTIONS http://localhost/api/encounters/spawn -I 2>/dev/null | head -1
echo ""

# Check Collection Service
echo "7. Collection Service:"
echo "--------------------------------"
curl -sS -X OPTIONS http://localhost/api/collection/ -I 2>/dev/null | head -1
echo ""

# Check Pokedex Service
echo "8. Pokedex Service:"
echo "--------------------------------"
curl -sS -X GET http://localhost/api/pokedex/ 2>/dev/null | jq '.message // "Service is running"' 2>/dev/null
echo ""

# Check Databases
echo "9. MySQL Database:"
echo "--------------------------------"
docker exec pokestop-db mysql -u root -penter -e "SHOW DATABASES;" 2>/dev/null | grep -E "pokestop|Database" | head -6
echo ""

echo "10. MongoDB Database:"
echo "--------------------------------"
docker exec pokestop-mongodb mongosh --username root --password enter --authenticationDatabase admin --eval "db.adminCommand('ping')" 2>/dev/null | grep -E "ok|Connected" | head -2
echo ""

echo "=========================================="
echo "✅ Health Check Complete!"
echo "=========================================="
echo ""
echo "Frontend URLs:"
echo "  - Homepage: http://localhost/"
echo "  - Register: http://localhost/register.html"
echo "  - Login: http://localhost/login.html"
echo "  - Encounter: http://localhost/encounter.html"
echo "  - Collections: http://localhost/collections.html"
echo "  - Pokedex: http://localhost/pokedex.html"
echo ""
echo "API Endpoints:"
echo "  - Auth: http://localhost/api/auth/"
echo "  - Users: http://localhost/api/users/"
echo "  - Encounters: http://localhost/api/encounters/"
echo "  - Collections: http://localhost/api/collection/"
echo "  - Pokedex: http://localhost/api/pokedex/"
echo "  - Teams: http://localhost/api/teams/"
echo ""
echo "GraphQL:"
echo "  - Endpoint: http://localhost:3001/graphql"
echo "=========================================="
