const axios = require('axios');
const authService = require("../services/authenticationService");

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';

exports.register = async (req, res) => {
	const { username, password, displayName, avatar, bio, badges, stats } = req.body;
	if (!username || !password || !displayName) {
		return res.status(400).json({ message: 'Username, password, and displayName are required' });
	}
	try {
		// Call user-service via HTTP
		const response = await axios.post(`${USER_SERVICE_URL}/users/register`, {
			username, password, displayName, avatar, bio, badges, stats
		});
		res.status(201).json({ message: 'User created', user: response.data.user });
	} catch (err) {
		const status = err.response?.status || 500;
		const message = err.response?.data?.message || err.message;
		res.status(status).json({ message });
	}
};

exports.login = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: 'Username and password required' });
	}
	try {
		// Call user-service to validate credentials
		const response = await axios.post(`${USER_SERVICE_URL}/users/validate`, {
			username, password
		});
		const user = response.data.user;
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const token = authService.generateToken(user);
		res.json({ message: 'Login successful', token });
	} catch (err) {
		const status = err.response?.status || 401;
		const message = err.response?.data?.message || 'Invalid credentials';
		res.status(status).json({ message });
	}
};
