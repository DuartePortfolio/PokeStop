
import logger from "../utils/logger.js";
import axios from "axios";
import * as authService from "../services/authenticationService.js";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';

export async function register(req, res) {
	logger.info("Registering new user");
	const { username, password, displayName, avatar, bio, badges, stats } = req.body;
	if (!username || !password || !displayName) {
		logger.warn("Missing required fields for registration");
		return res.status(400).json({ message: 'Username, password, and displayName are required' });
	}
	try {
		logger.debug("Calling user-service to register user");
		const response = await axios.post(`${USER_SERVICE_URL}/users/register`, {
			username, password, displayName, avatar, bio, badges, stats
		});
		logger.info(`User ${username} registered successfully`);
		res.status(201).json({ message: 'User created', user: response.data.user });
	} catch (err) {
		logger.error(`Registration failed for ${username}: ${err.message}`);
		const status = err.response?.status || 500;
		const message = err.response?.data?.message || err.message;
		res.status(status).json({ message });
	}
};

export async function login(req, res) {
	const { username, password } = req.body;
	if (!username || !password) {
		logger.warn("Missing username or password for login");
		return res.status(400).json({ message: 'Username and password required' });
	}
	try {
		logger.debug(`Validating credentials for user ${username}`);
		const response = await axios.post(`${USER_SERVICE_URL}/users/validate`, {
			username, password
		});
		const user = response.data.user;
		if (!user) {
			logger.warn(`Login failed: Invalid credentials for ${username}`);
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		const token = authService.generateToken(user);
		logger.info(`User ${username} logged in successfully`);
		res.json({ message: 'Login successful', token });
	} catch (err) {
		logger.error(`Login failed for ${username}: ${err.message}`);
		const status = err.response?.status || 401;
		const message = err.response?.data?.message || 'Invalid credentials';
		res.status(status).json({ message });
	}
};
