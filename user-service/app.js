import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import jwt from 'jsonwebtoken';
import sequelize from './services/sequelize.js';
import schema from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';

const app = express();

app.use(express.json());

// Minimal REST compatibility endpoints (used by other services)
import * as userService from './services/userService.js';

// Register a new user (used by authentication-service)
app.post('/users/register', async (req, res) => {
	try {
		const { username, password, displayName, avatar, bio, badges, stats } = req.body;
		const user = await userService.createUser({ username, password, displayName, avatar, bio, badges, stats });
		return res.status(201).json({ user });
	} catch (err) {
		const status = err.message && err.message.includes('exists') ? 409 : 400;
		return res.status(status).json({ message: err.message });
	}
});

// Validate credentials (used by authentication-service)
app.post('/users/validate', async (req, res) => {
	try {
		const { username, password } = req.body;
		const user = await userService.validateUser(username, password);
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		return res.json({ user });
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
});

// Authentication middleware - extract token from Authorization header
import util from 'util';

app.use((req, res, next) => {
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.substring(7);
		try {
			req.user = jwt.verify(token, process.env.JWT_SECRET || 'pokestop-secret-change-in-production');
		} catch (err) {
			req.user = null;
		}
	} else {
		req.user = null;
	}
	next();
});

// Debug middleware: surface auth header and decoded token for troubleshooting
app.use((req, res, next) => {
	try {
		console.log('auth debug: Authorization=', req.headers.authorization);
		console.log('auth debug: typeof req.user=', typeof req.user, 'req.user=', util.inspect(req.user, { depth: 5 }));
	} catch (err) {
		console.error('auth debug: failed to inspect req.user', err);
	}
	next();
});

// Helper: resolve numeric user ID, with fallback to username lookup
async function resolveUserId(req) {
	if (!req.user) return null;
	const maybeId = Number(req.user.id);
	if (!Number.isNaN(maybeId)) return maybeId;
	// if id not numeric, try username fallback
	if (req.user.username) {
		const u = await userService.getUserByUsername(req.user.username);
		if (u) return u.id;
	}
	return null;
}

// REST endpoints for current authenticated user (convenience)
app.get('/users/me', async (req, res) => {
	console.log('GET /users/me called, authHeader=', req.headers.authorization, 'req.user=', JSON.stringify(req.user));
	if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
	const userId = await resolveUserId(req);
	if (!userId) return res.status(400).json({ error: 'Invalid user id parameter' });
	if (!dbConnected) return res.status(503).json({ error: 'Service temporarily unavailable (DB)' });
	userService.getUserById(userId).then(user => {
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar, bio: user.bio, badges: user.badges, stats: user.stats, role: user.role, createdAt: user.createdAt });
	}).catch(err => { console.error('Error in GET /users/me', err); res.status(500).json({ error: err.message }); });
});

app.put('/users/me', express.json(), async (req, res) => {
	console.log('PUT /users/me called, req.user=', JSON.stringify(req.user), 'bodyLength=', req.headers['content-length'], 'bodyKeys=', Object.keys(req.body || {}));
	if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
	const userId = await resolveUserId(req);
	if (!userId) return res.status(400).json({ error: 'Invalid user id parameter' });
	if (!dbConnected) return res.status(503).json({ error: 'Service temporarily unavailable (DB)' });
	const updates = req.body || {};
	// Prevent role changes from client
	if ('role' in updates) delete updates.role;
	userService.updateUser(userId, updates).then(user => {
		if (!user) return res.status(404).json({ error: 'User not found' });
		res.json({ id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar, bio: user.bio, badges: user.badges, stats: user.stats, role: user.role, createdAt: user.createdAt });
	}).catch(err => { console.error('Error in PUT /users/me', err); res.status(500).json({ error: err.message }); });
});

// JSON parsing error handler
app.use((err, req, res, next) => {
	if (err && err.type === 'entity.parse.failed') {
		console.error('Failed to parse JSON body:', err.message || err);
		return res.status(400).json({ error: 'Malformed JSON in request body' });
	}
	next(err);
});

app.delete('/users/me', async (req, res) => {
	console.log('DELETE /users/me called, user=', req.user?.id, 'req.user=', JSON.stringify(req.user));
	if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
	const userId = await resolveUserId(req);
	if (!userId) return res.status(400).json({ error: 'Invalid user id parameter' });
	if (!dbConnected) return res.status(503).json({ error: 'Service temporarily unavailable (DB)' });
	userService.deleteUser(userId).then(deleted => {
		if (!deleted) return res.status(404).json({ error: 'User not found' });
		res.json({ message: 'User deleted', success: true });
	}).catch(err => { console.error('Error in DELETE /users/me', err); res.status(500).json({ error: err.message }); });
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP((req) => ({
	schema: schema,
	rootValue: resolvers,
	graphiql: true,
	context: {
		user: req.user || null,
		resolvers: resolvers
	}
})));

let dbConnected = true;
// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok', db: dbConnected });
});

async function startServer() {
	try {
		await sequelize.sync();
		console.log('Database connected');
	} catch (err) {
		dbConnected = false;
		console.error('Database connection failed, starting in degraded mode:', err.message || err);
		console.warn('Server will start without DB; some endpoints may return errors until DB is available.');
	}
	const PORT = process.env.PORT || 3001;
	app.listen(PORT, () => {
		console.log(`User service running on port ${PORT}`);
		console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
	});
}

startServer();
