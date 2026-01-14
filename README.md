# PokeStop - API Gateway Setup

This application now runs all backend requests through an NGINX API Gateway.

## Architecture

All microservices are containerized and communicate through a private Docker network. The NGINX gateway serves as the single entry point, routing requests to the appropriate services.

### Services

- **API Gateway** (NGINX) - Port 80
  - `/api/auth/*` → Authentication Service (Port 3000)
  - `/api/users/*` → User Service (Port 3001)
  - `/api/teams/*` → Team Service (Port 3002)
  - `/api/pokedex/*` → Pokedex Service (Port 3003)
  - `/api/collection/*` → Collection Service (Port 3004)
  - `/api/encounters/*` → Encounter Service (Port 3005)
  - `/` → Static HTML files

- **MySQL Database** (Port 3306 - internal only)

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository
2. Copy the environment file:
   ```bash
   copy .env.example .env
   ```
3. Build and start all services:
   ```bash
   docker-compose up --build
   ```

### Accessing the Application

Once running, access the application at:
- **Frontend**: http://localhost
- **Health Check**: http://localhost/health

### API Endpoints

All API requests should be made through the gateway:

- `POST /api/auth/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/:id` - Get user details
- `POST /api/teams` - Create team
- `GET /api/pokedex` - Get Pokédex data
- `POST /api/collection` - Add to collection
- `POST /api/encounters` - Record encounter

### Development

To stop all services:
```bash
docker-compose down
```

To view logs:
```bash
docker-compose logs -f [service-name]
```

To rebuild a specific service:
```bash
docker-compose up --build [service-name]
```

## Project Structure

```
PokeStop/
├── nginx.conf                 # NGINX configuration
├── docker-compose.yml         # Container orchestration
├── .env.example              # Environment variables template
├── authentication-service/   # Authentication microservice
├── user-service/             # User management microservice
├── team-service/             # Team management microservice
├── pokedex-service/          # Pokedex microservice
├── collection-service/       # Collection microservice
├── encounter-service/        # Encounter microservice
├── html/                     # Static frontend files
└── styles/                   # CSS files
```

## Notes

- All services run in isolated containers
- Database migrations run automatically on startup
- Frontend is served by the NGINX gateway
- Services communicate internally through the `pokestop-network`