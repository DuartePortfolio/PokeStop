const userService = require("../../user-service/services/userService");
const authService = require("../services/authenticationService");

exports.register = async (req, res) => {
	const { username, password, displayName, avatar, bio, badges, stats } = req.body;
	if (!username || !password || !displayName) {
		return res.status(400).json({ message: 'Username, password, and displayName are required' });
	}
	try {
		const user = await userService.createUser({ username, password, displayName, avatar, bio, badges, stats });
		res.status(201).json({ message: 'User created', user });
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
};

exports.login = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ message: 'Username and password required' });
	}
	const user = await userService.validateUser(username, password);
	if (!user) {
		return res.status(401).json({ message: 'Invalid credentials' });
	}
	const token = authService.generateToken(user);
	res.json({ message: 'Login successful', token });
};
