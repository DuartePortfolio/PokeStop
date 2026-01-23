# PokeStop - Advanced Setup & Troubleshooting Guide

## Table of Contents
1. [Advanced Configuration](#advanced-configuration)
2. [Troubleshooting](#troubleshooting)
3. [Development Guide](#development-guide)
4. [Performance Tuning](#performance-tuning)
5. [Security Hardening](#security-hardening)

---

## Advanced Configuration

### Environment Variables

All services can be configured via environment variables in `docker-compose.yml`:

```yaml
environment:
  - JWT_SECRET=your-secret-key          # JWT signing secret
  - JWT_EXPIRES_IN=1h                   # Token expiration time
  - NODE_ENV=production                 # Node environment
  - DB_HOST=db                          # MySQL host
  - DB_USER=root                        # MySQL user
  - DB_PASSWORD=enter                   # MySQL password
  - DB_NAME=pokestop_users_db          # Database name
  - MONGO_URI=mongodb://...            # MongoDB connection string
```

### Custom Database Configuration

To use external databases:

1. **MySQL Connection**:
   ```yaml
   environment:
     - DB_HOST=your-mysql-host
     - DB_USER=your-user
     - DB_PASSWORD=your-password
     - DB_NAME=your-db
   ```

2. **MongoDB Connection**:
   ```yaml
   environment:
     - MONGO_URI=mongodb://user:pass@host:27017/db?authSource=admin
   ```

### Port Mapping Customization

To change external ports (edit `docker-compose.yml`):

```yaml
ports:
  - "8080:80"          # Change gateway from 80 to 8080
  - "3000:3000"        # Change auth service port
  - "5432:3306"        # MySQL on different port
```

---

## Troubleshooting

### Service Connection Issues

**Problem**: Containers can't communicate with each other

**Solution**:
```bash
# Check network connectivity
docker network inspect pokestop_pokestop-network

# Test from inside network
docker run --rm --network pokestop_pokestop-network \
  curlimages/curl curl -v http://user-service:3001/health
```

### JWT Token Issues

**Problem**: "Invalid or expired token" errors

**Solution**:
1. Verify JWT_SECRET is same across all services:
   ```bash
   docker exec pokestop-authentication-service sh -c 'echo $JWT_SECRET'
   docker exec pokestop-user-service sh -c 'echo $JWT_SECRET'
   ```

2. Check token expiration:
   ```bash
   # Tokens expire after 1 hour by default
   # Generate fresh token via login endpoint
   ```

3. Verify Bearer format in request:
   ```bash
   # Correct: "Authorization: Bearer <token>"
   # Wrong: "Authorization: <token>"
   ```

### Database Connection Issues

**Problem**: "Can't connect to database" errors

**Solution**:
```bash
# Check MySQL connectivity
docker exec pokestop-db mysql -u root -penter -e "SELECT 1"

# Check MongoDB connectivity
docker exec pokestop-mongodb mongosh --username root \
  --password enter --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Verify environment variables
docker exec pokestop-user-service sh -c 'echo "DB_HOST=$DB_HOST"'
```

### GraphQL Queries Not Working

**Problem**: "Not authenticated" or "Access denied" errors

**Solution**:
1. Ensure you're sending Authorization header:
   ```bash
   curl -X POST http://localhost:3001/graphql \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"query":"..."}'
   ```

2. Verify token is valid (not expired):
   ```bash
   # Re-login to get fresh token
   curl -X POST http://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}'
   ```

3. Check resolver function signatures (must include `parent` parameter):
   ```javascript
   // Correct
   async (parent, args, context) => { ... }
   
   // Wrong
   async (args, context) => { ... }
   ```

### NGINX Gateway Issues

**Problem**: 404 errors or paths not routing correctly

**Solution**:
1. Check NGINX configuration:
   ```bash
   docker exec pokestop-api-gateway nginx -t
   ```

2. View NGINX logs:
   ```bash
   docker logs pokestop-api-gateway
   ```

3. Test routing directly to service:
   ```bash
   # If gateway returns 404, try direct service call
   docker run --rm --network pokestop_pokestop-network curlimages/curl \
     http://user-service:3001/health
   ```

### MongoDB Insert Failures

**Problem**: "Command insert requires authentication" errors

**Solution**:
1. Verify MongoDB credentials in MONGO_URI:
   ```bash
   # Format: mongodb://username:password@host:port/database?authSource=admin
   ```

2. Test MongoDB connection:
   ```bash
   docker exec pokestop-mongodb mongosh \
     --username root --password enter \
     --authenticationDatabase admin \
     --eval "db.pokestop_collection_db.insertOne({test:1})"
   ```

3. Restart collection-service after fixing URI:
   ```bash
   docker-compose up -d collection-service
   ```

---

## Development Guide

### Adding a New GraphQL Query

1. **Update schema** (`user-service/graphql/schema.js`):
   ```javascript
   const QueryType = new GraphQLObjectType({
     name: 'Query',
     fields: {
       // ... existing queries ...
       myNewQuery: {
         type: UserType,
         args: { id: { type: new GraphQLNonNull(GraphQLInt) } },
         resolve: (parent, args, context) => context.resolvers.myNewQuery(parent, args, context)
       }
     }
   });
   ```

2. **Implement resolver** (`user-service/graphql/resolvers.js`):
   ```javascript
   myNewQuery: async (parent, args, context) => {
     // Authorization check if needed
     if (!context?.user) throw new Error('Not authenticated');
     
     // Business logic here
     const result = await userService.getMyData(args.id);
     return result;
   }
   ```

3. **Rebuild and test**:
   ```bash
   docker-compose build user-service
   docker-compose up -d user-service
   ```

### Adding a New REST Endpoint

1. **Create route** (`service-name/routes/filename.js`):
   ```javascript
   router.get('/endpoint', (req, res) => {
     res.json({ message: 'Hello' });
   });
   ```

2. **Register in app** (`service-name/app.js`):
   ```javascript
   const routes = require('./routes/filename');
   app.use('/api', routes);
   ```

3. **Add to NGINX config** (if external access needed):
   ```nginx
   location /api/endpoint/ {
     proxy_pass http://service-name:port/endpoint/;
     proxy_set_header Host $host;
   }
   ```

### Debugging Techniques

1. **Enable service logs**:
   ```bash
   docker logs -f pokestop-user-service
   ```

2. **Add console.log to code** and rebuild:
   ```javascript
   console.log('[DEBUG] myFunction called with:', args);
   ```

3. **Use GraphQL playground** (built-in at `/graphql`):
   - Visit http://localhost:3001/graphql
   - Use GraphiQL interface to test queries
   - Check documentation on right panel

4. **Test with curl/Postman**:
   ```bash
   # Save authentication token
   TOKEN=$(curl -X POST http://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"pass"}' | jq -r .token)
   
   # Use token in requests
   curl -X POST http://localhost:3001/graphql \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"query":"{ getUserById(id: 1) { id username } }"}'
   ```

---

## Performance Tuning

### Database Optimization

1. **Connection Pooling** (already configured in Sequelize):
   ```javascript
   // Adjust in user-service/services/sequelize.js
   new Sequelize({
     pool: {
       max: 5,        // Maximum connections
       min: 1,        // Minimum connections
       acquire: 30000, // Timeout for acquiring connection
       idle: 10000    // Idle connection timeout
     }
   });
   ```

2. **MongoDB Indexing**:
   ```javascript
   // collection-service setup
   db.pokemonInstances.createIndex({ userId: 1 });
   db.pokemonInstances.createIndex({ createdAt: -1 });
   ```

### Caching Strategies

1. **Redis Cache** (optional addition):
   ```bash
   # Add to docker-compose.yml
   redis:
     image: redis:7-alpine
     networks:
       - pokestop-network
   ```

2. **In-memory cache** (in-service):
   ```javascript
   const cache = new Map();
   
   async function getCachedUser(id) {
     if (cache.has(id)) return cache.get(id);
     const user = await userService.getUserById(id);
     cache.set(id, user);
     return user;
   }
   ```

### NGINX Optimization

Update `nginx.conf` for better performance:

```nginx
http {
  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json;
  
  # Connection settings
  keepalive_timeout 65;
  client_max_body_size 10m;
  
  # Caching
  proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m;
  
  upstream user_service {
    least_conn;  # Load balancing
    server user-service:3001;
  }
}
```

---

## Security Hardening

### 1. Change Default Credentials

**Before deployment to production**:

```bash
# Update docker-compose.yml
export JWT_SECRET="your-long-random-secret-key"
export DB_ROOT_PASSWORD="your-strong-password"
export MONGO_PASSWORD="your-strong-password"

docker-compose up -d
```

### 2. HTTPS/TLS Configuration

Add SSL to NGINX:

```nginx
server {
  listen 443 ssl http2;
  ssl_certificate /etc/nginx/certs/cert.pem;
  ssl_certificate_key /etc/nginx/certs/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 3. Input Validation

Example in user-service:

```javascript
// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate password strength
function validatePassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password);
}
```

### 4. Rate Limiting

Add to authentication-service:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // Limit each IP to 5 requests per windowMs
});

app.post('/login', limiter, authController.login);
app.post('/register', limiter, authController.register);
```

### 5. CORS Configuration

Add to all services:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost', 'https://yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

### 6. SQL Injection Prevention

Already handled by Sequelize ORM with parameterized queries:

```javascript
// Safe - uses parameterized queries
const user = await User.findOne({
  where: { username: userInput }
});

// Avoid string concatenation
// DON'T: `SELECT * FROM users WHERE username='${userInput}'`
```

### 7. XSS Protection

Add headers to NGINX:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 8. Monitoring & Logging

Implement centralized logging:

```javascript
// Add to all services
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('User login:', { userId, timestamp });
logger.error('Database error:', error);
```

---

## Scaling Considerations

### Horizontal Scaling

For production deployments with multiple instances:

1. **Use load balancer** instead of single NGINX
2. **Use managed database services** (AWS RDS, MongoDB Atlas)
3. **Implement session storage** (Redis) for stateless services
4. **Use container orchestration** (Kubernetes) instead of Compose

### Vertical Scaling

Increase resources for single-instance deployments:

```yaml
services:
  user-service:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [GraphQL Best Practices](https://graphql.org/learn)
- [Docker Compose Reference](https://docs.docker.com/compose)
- [JWT Authentication](https://jwt.io)
- [NGINX Configuration](https://nginx.org/en/docs)
- [Sequelize ORM](https://sequelize.org)
- [MongoDB Documentation](https://docs.mongodb.com)

---

**For technical support or contributions, please refer to the main README.md file.**
