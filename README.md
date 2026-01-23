# PokeStop - Pokémon Encounter and Collection Platform

[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://mongodb.com)
[![GraphQL](https://img.shields.io/badge/GraphQL-API-pink.svg)](https://graphql.org)

PokeStop is a comprehensive Pokémon encounter and collection platform built with a microservices architecture. Inspired by Pokémon, it allows users to register, login, encounter wild Pokémon, attempt to catch them through mini-games, build collections, and manage teams.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication system
- **Pokémon Encounters**: Random wild Pokémon spawning with location-based mechanics
- **Catch Mechanics**: Interactive mini-game system with score-based capture rates
- **Collection Management**: Store and manage caught Pokémon in MongoDB
- **Team Building**: Create and manage Pokémon teams (up to 6 members)
- **Pokédex Integration**: Comprehensive Pokémon database with detailed information

### Technical Features
- **Microservices Architecture**: 6 independent services with clear separation of concerns
- **API Gateway**: NGINX-based routing for unified API access
- **GraphQL API**: Modern query language for user service operations
- **Containerized Deployment**: Full Docker orchestration with docker-compose
- **Multi-Database**: MySQL for relational data, MongoDB for collections
- **Health Monitoring**: Built-in health checks and monitoring endpoints

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────────┐
│   Web Browser   │────│   NGINX API Gateway  │
│                 │    │       (Port 80)      │
└─────────────────┘    └──────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼───┐
            │Auth Service│ │User   │ │Team   │
            │  (3000)    │ │Service│ │Service│
            │            │ │(3001) │ │(3002) │
            └───────▲───┘ └───────┘ └───────┘
                    │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼───┐
            │Pokedex     │ │Collection│ │Encounter│
            │Service     │ │Service  │ │Service  │
            │(3003)      │ │(3004)   │ │(3005)  │
            └────────────┘ └────────┘ └────────┘
                    │         │         │
            ┌───────▼─────────▼─────────▼───────┐
            │           Databases               │
            │   MySQL (3306) │ MongoDB (27017)  │
            └───────────────────────────────────┘
```

### Services Overview

| Service | Technology | Database | Port | Purpose |
|---------|------------|----------|------|---------|
| **API Gateway** | NGINX | - | 80 | Request routing and static file serving |
| **Authentication** | Node.js/Express | MySQL | 3000 | User login/registration, JWT token management |
| **User** | Node.js/Express/GraphQL | MySQL | 3001 | User profile management, GraphQL API |
| **Team** | Node.js/Express | MySQL | 3002 | Pokémon team creation and management |
| **Pokedex** | Node.js/Express | MySQL | 3003 | Pokémon data and information service |
| **Collection** | Python/Flask | MongoDB | 3004 | User's caught Pokémon storage |
| **Encounter** | Node.js/Express | MySQL | 3005 | Wild Pokémon encounters and catch mechanics |

## 🛠️ Technologies Used

### Backend Services
- **Node.js** - Runtime for 5 microservices
- **Python/Flask** - Collection service
- **Express.js** - Web framework for Node.js services
- **GraphQL** - Query language for user service API

### Databases
- **MySQL 8.0** - Relational data (users, teams, encounters, pokedex)
- **MongoDB 7.0** - Document storage for Pokémon collections

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **NGINX** - API gateway and reverse proxy
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Frontend
- **HTML5/CSS3/JavaScript** - Static web interface
- **Fetch API** - Client-side HTTP requests

## 📋 Prerequisites

- **Docker** (20.10+)
- **Docker Compose** (2.0+)
- **Git** (for cloning the repository)
- **Web Browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd PokeStop
```

### 2. Environment Configuration
The project uses default environment variables. For production deployment, create a `.env` file:

```bash
# Copy example environment file (if available)
cp .env.example .env

# Or create manually with custom values
echo "JWT_SECRET=your-super-secret-jwt-key" > .env
echo "DB_PASSWORD=your-mysql-password" >> .env
echo "MONGO_PASSWORD=your-mongo-password" >> .env
```

### 3. Start the Application
```bash
# Build and start all services
docker-compose up --build -d

# Check service health
./health_check.ps1  # Windows PowerShell
# or
./health_check.sh   # Linux/macOS
```

### 4. Verify Installation
- **Web Interface**: http://localhost
- **Health Check**: http://localhost/health
- **GraphQL Playground**: http://localhost:3001/graphql

## 📖 Usage

### Web Interface
1. **Register**: Visit http://localhost/register.html to create an account
2. **Login**: Use http://localhost/login.html to authenticate
3. **Explore**: Navigate through collections, teams, encounters, and pokedex

### API Endpoints

All API requests go through the NGINX gateway at `http://localhost`:

#### Authentication
```bash
# Login
POST /api/auth/login
Content-Type: application/json
{
  "username": "your-username",
  "password": "your-password"
}

# Register
POST /api/auth/register
Content-Type: application/json
{
  "username": "new-username",
  "password": "new-password",
  "displayName": "Display Name"
}
```

#### User Management (GraphQL)
```bash
# Get user details
POST /api/users/graphql
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "query": "query { getUserById(id: 1) { id username displayName } }"
}

# Update user profile
POST /api/users/graphql
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "query": "mutation { updateUser(id: 1, displayName: \"New Name\") { id displayName } }"
}
```

#### Teams
```bash
# Get user's teams
GET /api/teams/user/1
Authorization: Bearer <jwt-token>

# Create team
POST /api/teams/user/1
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "name": "My Team",
  "members": [1, 2, 3, 4, 5, 6]
}
```

#### Encounters
```bash
# Spawn encounter
POST /api/encounters
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "latitude": 40.7128,
  "longitude": -74.0060
}

# Attempt catch
POST /api/encounters/catch
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "encounterId": 1,
  "score": 85
}
```

#### Collection
```bash
# Get user's collection
GET /api/collection/user/1
Authorization: Bearer <jwt-token>

# Add to collection
POST /api/collection
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "pokemonId": 25,
  "nickname": "Pikachu"
}
```

#### Pokedex
```bash
# Get all Pokemon
GET /api/pokedex

# Get specific Pokemon
GET /api/pokedex/25
```

## 🔧 Development

### Local Development Setup
```bash
# Start databases only
docker-compose up -d db mongodb

# Install dependencies for each service
cd authentication-service && npm install
cd ../user-service && npm install
cd ../collection-service && pip install -r requirements.txt
# ... repeat for other services

# Start individual services
cd authentication-service && npm start
cd ../user-service && npm start
# ... etc
```

### Service Development
Each service can be developed independently:

```bash
# Rebuild specific service
docker-compose up --build authentication-service

# View service logs
docker-compose logs -f authentication-service

# Access service directly (bypass gateway)
curl http://localhost:3000/health
```

### Database Management
```bash
# Access MySQL
docker exec -it pokestop-db mysql -u root -penter pokestop_users_db

# Access MongoDB
docker exec -it pokestop-mongodb mongosh -u root -p enter pokestop_collection_db

# Reset databases
docker-compose down -v  # Remove volumes
docker-compose up -d db mongodb
```

### Testing
```bash
# Run health checks
./health_check.ps1

# Test API endpoints with Postman
# Import PokeStop.postman_collection.json

# Manual testing
curl -X GET http://localhost/health
```

## 📁 Project Structure

```
PokeStop/
├── docker-compose.yml          # Service orchestration
├── docker-stack.yml           # Swarm deployment (optional)
├── nginx.conf                 # API gateway configuration
├── health_check.ps1           # Windows health monitoring
├── health_check.sh            # Linux health monitoring
├── setup.ps1                  # Windows setup script
├── setup.sh                   # Linux setup script
├── QUICK_START.md             # Quick start guide
├── ADVANCED_GUIDE.md          # Advanced configuration
├── COMPLETION_STATUS.md       # Project status
├── PokeStop.postman_collection.json  # API testing collection
│
├── authentication-service/    # JWT authentication service
│   ├── app.js
│   ├── package.json
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── middleware/
│
├── user-service/              # User management (GraphQL)
│   ├── app.js
│   ├── package.json
│   ├── controllers/
│   ├── graphql/
│   ├── routes/
│   └── models/
│
├── team-service/              # Team management
│   ├── app.js
│   ├── package.json
│   └── ...
│
├── pokedex-service/           # Pokemon data service
│   ├── app.js
│   ├── package.json
│   └── ...
│
├── collection-service/        # Collection storage (Python)
│   ├── app.py
│   ├── requirements.txt
│   └── ...
│
├── encounter-service/         # Encounter mechanics
│   ├── app.js
│   ├── package.json
│   └── ...
│
├── database-schemas/          # Database initialization
│   ├── init-mysql.sql
│   ├── init-mongodb.js
│   └── *.sql
│
├── html/                      # Frontend static files
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── collections.html
│   ├── teams.html
│   ├── encounter.html
│   ├── pokedex.html
│   └── modal.js
│
├── styles/                    # CSS stylesheets
│   └── register.css
│
└── docs/                      # Documentation
    └── teams.md
```

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password storage
- **Input Validation**: Request validation on all endpoints
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data stored securely
- **Network Isolation**: Services communicate through private Docker network

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Add tests for new features
- Update documentation as needed
- Ensure all services build and run correctly
- Test end-to-end functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Pokémon
- Built for educational purposes in Cloud Services and Interfaces course
- Demonstrates microservices architecture patterns
- Showcases modern web development technologies

## 📞 Support

For issues and questions:
1. Check the [ADVANCED_GUIDE.md](ADVANCED_GUIDE.md) for troubleshooting
2. Review service logs: `docker-compose logs -f`
3. Test individual endpoints with the Postman collection
4. Open an issue on GitHub

---

**Status**: ✅ Fully operational and tested end-to-end
**Last Updated**: January 23, 2026