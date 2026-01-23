# User Service - GraphQL API

This user service has been converted from REST to GraphQL while maintaining all original functionality.

## Overview

The service provides user management capabilities including registration, validation, profile management, and admin operations. All endpoints are now accessible via the single GraphQL endpoint at `/graphql`.

## API Endpoint

- **URL**: `http://localhost:3001/graphql`
- **Method**: POST
- **Content-Type**: `application/json`

## Authentication

Authentication is handled via Bearer tokens in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are optional for public operations but required for protected operations.

## GraphQL Operations

### Queries

#### 1. `getAllUsers` (Admin Only)
Get all users in the system.

**Original REST**: `GET /users/` (admin required)

**GraphQL Query**:
```graphql
query {
  getAllUsers {
    id
    username
    displayName
    avatar
    bio
    badges
    stats
    role
    createdAt
    updatedAt
  }
}
```

**Headers Required**:
```
Authorization: Bearer <admin_token>
```

---

#### 2. `getUserById`
Get a user by ID (authenticated users can only access their own profile).

**Original REST**: `GET /users/:id`

**GraphQL Query**:
```graphql
query {
  getUserById(id: 1) {
    id
    username
    displayName
    avatar
    bio
    badges
    stats
    role
    createdAt
    updatedAt
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

**Authorization**: User can only access their own resource

---

#### 3. `validateUser`
Validate user credentials (internal use by auth-service).

**Original REST**: `POST /users/validate`

**GraphQL Query**:
```graphql
query {
  validateUser(username: "john_doe", password: "password123") {
    user {
      id
      username
      displayName
      role
    }
  }
}
```

**Authorization**: None required (internal operation)

---

### Mutations

#### 1. `registerUser`
Register a new user (internal use by auth-service).

**Original REST**: `POST /users/register`

**GraphQL Mutation**:
```graphql
mutation {
  registerUser(
    username: "john_doe"
    password: "password123"
    displayName: "John Doe"
    avatar: "avatar_url"
    bio: "My bio"
    badges: "badge1,badge2"
    stats: "stats_json"
  ) {
    message
    user {
      id
      username
      displayName
      role
    }
  }
}
```

**Authorization**: None required (internal operation)

---

#### 2. `updateUser`
Update user profile (authenticated users can only update their own profile).

**Original REST**: `PUT /users/:id`

**GraphQL Mutation**:
```graphql
mutation {
  updateUser(
    id: 1
    displayName: "Jane Doe"
    bio: "Updated bio"
    avatar: "new_avatar_url"
  ) {
    id
    username
    displayName
    avatar
    bio
    badges
    stats
    role
    createdAt
    updatedAt
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

**Authorization**: User can only update their own profile

**Optional Fields**: All fields except `id` are optional. Only include fields you want to update.

---

#### 3. `deleteUser`
Delete a user account (authenticated users can only delete their own account).

**Original REST**: `DELETE /users/:id`

**GraphQL Mutation**:
```graphql
mutation {
  deleteUser(id: 1) {
    message
    success
  }
}
```

**Headers Required**:
```
Authorization: Bearer <token>
```

**Authorization**: User can only delete their own account

---

## User Type Definition

```graphql
type User {
  id: Int!
  username: String!
  displayName: String!
  avatar: String
  bio: String
  badges: String
  stats: String
  role: String!
  createdAt: String!
  updatedAt: String!
}
```

- `id`: Unique identifier for the user
- `username`: Unique username
- `displayName`: User's display name
- `avatar`: URL to user's avatar
- `bio`: User biography
- `badges`: User badges (stored as JSON string)
- `stats`: User statistics (stored as JSON string)
- `role`: User role (e.g., "user", "admin")
- `createdAt`: Account creation timestamp (ISO 8601)
- `updatedAt`: Last update timestamp (ISO 8601)

## Error Handling

Errors are returned in the following format:

```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "GRAPHQL_PARSE_FAILED"
      }
    }
  ]
}
```

Common error messages:
- `"Access denied. Token missing."` - Authentication required but no token provided
- `"Invalid or expired token."` - Token is invalid or expired
- `"Access forbidden: insufficient privileges."` - User does not have required role
- `"Forbidden: can only access your own resource"` - User trying to access another user's resource
- `"User not found"` - User with given ID does not exist
- `"User already exists"` - Username already taken during registration

## Health Check

A simple health check endpoint is available at:

```
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "ok"
}
```

## Migration from REST

The service maintains backward compatibility in functionality while fully transitioning to GraphQL. All original REST endpoints have been mapped to GraphQL operations as shown above.

### Summary of Mapping

| Original REST | GraphQL Type | Operation |
|---|---|---|
| `POST /users/register` | Mutation | `registerUser` |
| `POST /users/validate` | Query | `validateUser` |
| `GET /users/` | Query | `getAllUsers` |
| `GET /users/:id` | Query | `getUserById` |
| `PUT /users/:id` | Mutation | `updateUser` |
| `DELETE /users/:id` | Mutation | `deleteUser` |

## Example: Full Authentication Flow

1. **Register User** (via auth-service):
```graphql
mutation {
  registerUser(
    username: "alice"
    password: "secure123"
    displayName: "Alice"
  ) {
    message
    user {
      id
      username
    }
  }
}
```

2. **Validate Credentials** (via auth-service):
```graphql
query {
  validateUser(username: "alice", password: "secure123") {
    user {
      id
      username
      role
    }
  }
}
```

3. **Get User Profile** (with token):
```graphql
query {
  getUserById(id: 1) {
    id
    username
    displayName
    bio
    role
  }
}
```

4. **Update Profile** (with token):
```graphql
mutation {
  updateUser(id: 1, bio: "Updated bio") {
    id
    bio
    updatedAt
  }
}
```

## Testing with cURL

Register a user:
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{registerUser(username:\"test\",password:\"pass\",displayName:\"Test\"){message user{id username}}}"}'
```

Get all users (requires admin token):
```bash
curl -X POST http://localhost:3001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"query":"{getAllUsers{id username displayName role}}"}'
```

## Database

The service uses MySQL with Sequelize ORM. Database configuration is read from environment variables:

- `DB_HOST`: Database host (default: `db`)
- `DB_NAME`: Database name (default: `pokestop_users_db`)
- `DB_USER`: Database user (default: `root`)
- `DB_PASSWORD`: Database password (default: `enter`)

## Dependencies

- `@apollo/server`: ^4.10.1
- `apollo-server-express`: ^4.10.1
- `express`: ^5.1.0
- `graphql`: ^16.8.1
- `sequelize`: ^6.37.7
- `mysql2`: ^3.16.0
- `bcrypt`: ^6.0.0
- `jsonwebtoken`: ^9.0.3
