import logger from "../utils/logger.js";

const userService = require("../services/userService");

// Internal endpoint for auth-service to create users
exports.register = async (req, res) => {
  logger.info('Registering user:', req.body);
  const { username, password, displayName, avatar, bio, badges, stats } = req.body;
  if (!username || !password || !displayName) {
    logger.warn('Missing required fields for registration');
    return res.status(400).json({ message: 'Username, password, and displayName are required' });
  }
  try {
    const user = await userService.createUser({ username, password, displayName, avatar, bio, badges, stats });
    logger.info('User created:', user);
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    logger.error('Error creating user:', err.message);
    res.status(400).json({ message: err.message });
  }
};

// Internal endpoint for auth-service to validate credentials
exports.validate = async (req, res) => {
  logger.info('Validating user credentials:', req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    logger.warn('Missing required fields for validation');
    return res.status(400).json({ message: 'Username and password required' });
  }
  const user = await userService.validateUser(username, password);
  if (!user) {
    logger.warn('Invalid credentials for user:', username);
    return res.status(401).json({ message: 'Invalid credentials', user: null });
  }
  logger.info('User validated:', user);
  res.json({ user });
};

exports.getAllUsers = async (req, res) => {
  logger.info('Fetching all users');
  const users = await userService.getAllUsers();
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    avatar: u.avatar,
    bio: u.bio,
    badges: u.badges,
    stats: u.stats,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  })));
};

exports.getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);
  logger.info('Fetching user by ID:', userId);
  const user = await userService.getUserById(userId);
  if (user) {
    logger.info('User found:', user);
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      badges: user.badges,
      stats: user.stats,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } else {
    logger.warn('User not found:', userId);
    res.status(404).json({ error: 'User not found' });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  logger.info('Deleting user by ID:', userId);
  const deleted = await userService.deleteUser(userId);
  if (deleted) {
    logger.info('User deleted:', userId);
    res.status(204).send();
  } else {
    logger.warn('User not found for deletion:', userId);
    res.status(404).json({ error: 'User not found' });
  }
};

exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;
  logger.info('Updating user by ID:', userId, 'with updates:', updates);
  // Prevent role from being updated via this endpoint
  if ('role' in updates) delete updates.role;
  const user = await userService.updateUser(userId, updates);
  if (user) {
    logger.info('User updated:', user);
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      badges: user.badges,
      stats: user.stats,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } else {
    logger.warn('User not found for update:', userId);
    res.status(404).json({ error: 'User not found' });
  }
};

// ...removed legacy loginUser...