/**
 * DEPRECATED: This file is maintained for reference only.
 * 
 * The User Service has been converted to GraphQL.
 * All REST endpoints have been replaced with GraphQL operations.
 * 
 * Please use the GraphQL endpoint at POST /graphql instead.
 * See GRAPHQL_API.md for complete API documentation.
 * 
 * REST to GraphQL Mapping:
 * - POST /users/register      → Mutation: registerUser
 * - POST /users/validate      → Query: validateUser
 * - GET /users/               → Query: getAllUsers
 * - GET /users/:id            → Query: getUserById
 * - PUT /users/:id            → Mutation: updateUser
 * - DELETE /users/:id         → Mutation: deleteUser
 */

import express from "express";
const router = express.Router();

// All endpoints are now handled by GraphQL at /graphql
// This file is kept for documentation purposes only.

export default router;