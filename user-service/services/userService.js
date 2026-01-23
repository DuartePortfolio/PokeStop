import bcrypt from 'bcrypt';
import User from '../models/User.js';

async function createUser({ username, password, displayName, avatar, bio, badges, stats }) {
  if (!username || !password || !displayName) {
    throw new Error('Username, password, and displayName are required');
  }
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    throw new Error('User already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
    displayName,
    avatar,
    bio,
    badges,
    stats,
    role: 'user' // Always set role to 'user' on registration
  });
  return { id: user.id, username: user.username, displayName: user.displayName, role: user.role };
}

async function validateUser(username, password) {
  const user = await User.findOne({ where: { username } });
  if (!user) return false;
  const match = await bcrypt.compare(password, user.password);
  return match ? { id: user.id, username: user.username, displayName: user.displayName, role: user.role } : false;
}

async function deleteUser(id) {
  const deleted = await User.destroy({ where: { id } });
  return !!deleted;
}

async function updateUser(id, updates) {
  const user = await User.findByPk(id);
  if (!user) return null;
  await user.update(updates);
  return user;
}

async function getAllUsers() {
  return await User.findAll();
}

async function getUserById(id) {
  return await User.findByPk(id);
}

async function getUserByUsername(username) {
  return await User.findOne({ where: { username } });
}

export { createUser, validateUser, deleteUser, updateUser, getAllUsers, getUserById, getUserByUsername };