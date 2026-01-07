
const bcrypt = require('bcrypt')
const users = require('../data/mockUsers')

async function createUser(username, password) {
  if (!username || !password) {
    throw new Error('Username and password are required')
  }
  if (users.find(u => u.username === username)) {
    throw new Error('User already exists')
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = { id: users.length + 1, username, password: hashedPassword }
  users.push(user)
  return { id: user.id, username: user.username }
}

async function validateUser(username, password) {
  const user = users.find(u => u.username === username)
  if (!user) return false
  const match = await bcrypt.compare(password, user.password)
  return match ? { id: user.id, username: user.username } : false
}

function deleteUser(id) {
  const userIndex = users.findIndex((u) => u.id === id)
  if (userIndex !== -1) {
    users.splice(userIndex, 1)
    return true
  }
  return false
}

function updateUser(id, username) {
  const user = users.find((u) => u.id === id)
  if (user) {
    user.username = username || user.username
    return user
  }
  return null
}

function getAllUsers() {
  return users
}

function getUserById(id) {
  return users.find((u) => u.id === id)
}

module.exports = { createUser, validateUser, deleteUser, updateUser, getAllUsers, getUserById }