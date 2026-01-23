const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken');
const sequelize = require('./services/sequelize');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();

app.use(express.json());

// Minimal REST compatibility endpoints (used by other services)
const userService = require('./services/userService');

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

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

async function startServer() {
	try {
		await sequelize.sync();
		const PORT = process.env.PORT || 3001;
		app.listen(PORT, () => {
			console.log(`User service running on port ${PORT}`);
			console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
		});
	} catch (err) {
		console.error('Failed to start server:', err);
		process.exit(1);
	}
}

startServer();
