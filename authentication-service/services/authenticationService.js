const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'pokestop-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function generateToken(user) {
	return jwt.sign({ username: user.username, id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (e) {
		return null;
	}
}

module.exports = { generateToken, verifyToken };
