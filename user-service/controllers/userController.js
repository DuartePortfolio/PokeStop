/**
 * DEPRECATED: This file is maintained for reference only.
 * 
 * The User Service has been converted to GraphQL.
 * All controller functions have been replaced with GraphQL resolvers.
 * 
 * Please use the GraphQL endpoint at POST /graphql instead.
 * See GRAPHQL_API.md for complete API documentation.
 * 
 * The equivalent GraphQL resolvers are located in:
 * ./graphql/resolvers.js
 */

// Legacy controller functions kept for reference
// These are no longer used but show the mapping to GraphQL

const userService = require("../services/userService")

/**
 * @deprecated Use GraphQL Mutation: registerUser instead
 */
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

/**
 * @deprecated Use GraphQL Query: validateUser instead
 */
exports.validate = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  const user = await userService.validateUser(username, password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials', user: null });
  }
  res.json({ user });
};

/**
 * @deprecated Use GraphQL Query: getAllUsers instead
 */
exports.getAllUsers = async (req, res) => {
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

/**
 * @deprecated Use GraphQL Query: getUserById instead
 */
exports.getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);
  const user = await userService.getUserById(userId);
  if (user) {
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
    res.status(404).json({ error: 'User not found' });
  }
};

/**
 * @deprecated Use GraphQL Mutation: deleteUser instead
 */
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const deleted = await userService.deleteUser(userId);
  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'User not found' });
  }
};

/**
 * @deprecated Use GraphQL Mutation: updateUser instead
 */
exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;
  // Prevent role from being updated via this endpoint
  if ('role' in updates) delete updates.role;
  const user = await userService.updateUser(userId, updates);
  if (user) {
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
    res.status(404).json({ error: 'User not found' });
  }
};
