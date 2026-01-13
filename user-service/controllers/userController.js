
const userService = require("../services/userService")

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

exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const deleted = await userService.deleteUser(userId);
  if (deleted) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'User not found' });
  }
};

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

// ...removed legacy loginUser...