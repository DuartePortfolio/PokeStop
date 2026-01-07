const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'pokesecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

function generateToken(user) {
	return jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (e) {
		return null;
	}
}

module.exports = { generateToken, verifyToken };