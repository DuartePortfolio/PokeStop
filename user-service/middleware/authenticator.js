/**
 * DEPRECATED: This file is maintained for reference only.
 * 
 * The User Service has been converted to GraphQL.
 * Authentication middleware has been replaced with GraphQL context handling.
 * 
 * The equivalent GraphQL authentication middleware is located in:
 * ./graphql/authMiddleware.js
 * 
 * Authorization is now handled directly in the GraphQL resolvers:
 * ./graphql/resolvers.js
 */

const authService = require('../services/authService');

/**
 * @deprecated Use GraphQL authentication middleware instead
 */
function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Access denied. Token missing.' });
	}
	const token = authHeader.split(' ')[1];
	const payload = authService.verifyToken(token);
	if (!payload) {
		return res.status(401).json({ error: 'Invalid or expired token.' });
	}
	req.user = payload;
	next();
}

/**
 * @deprecated Use authorization logic in GraphQL resolvers instead
 */
function authorizeRole(requiredRole) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
		const userRole = req.user.role || 'user';
		const allowed = Array.isArray(requiredRole) ? requiredRole.includes(userRole) : userRole === requiredRole;
		if (!allowed) return res.status(403).json({ error: 'Access forbidden: insufficient privileges.' });
		next();
	};
}

/**
 * @deprecated Use authorization logic in GraphQL resolvers instead
 */
function authorizeSelf(req, res, next) {
	if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
	const paramId = Number(req.params.id);
	const userId = Number(req.user.id);
	if (Number.isNaN(paramId)) return res.status(400).json({ error: 'Invalid user id parameter' });
	if (userId !== paramId) return res.status(403).json({ error: 'Forbidden: can only access your own resource' });
	next();
}

module.exports = { authenticateToken, authorizeRole, authorizeSelf };
