
const userService = require("../services/userService")
const authService = require("../services/authService")


exports.register = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' })
  }
  try {
    const user = await userService.createUser(username, password)
    res.status(201).json({ message: 'User created', user })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' })
  }
  const user = await userService.validateUser(username, password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const token = authService.generateToken(user)
  res.json({ message: 'Login successful', token })
}

exports.getAllUsers = (req, res) => {
  const users = userService.getAllUsers()
  res.json(users)
}

exports.getUserById = (req, res) => {
  const userId = parseInt(req.params.id)
  const user = userService.getUserById(userId)
  if (user) {
    res.json(user)
  } else {
    res.status(404).json({ error: "User not found" })
  }
}

exports.deleteUser = (req, res) => {
  const userId = parseInt(req.params.id)
  const deleted = userService.deleteUser(userId)
  if (deleted) {
    res.status(204).send()
  } else {
    res.status(404).json({ error: "User not found" })
  }
}

exports.updateUser = (req, res) => {
  const userId = parseInt(req.params.id)
  const { name, email } = req.body
  const user = userService.updateUser(userId, name, email)
  if (user) {
    res.json(user)
  } else {
    res.status(404).json({ error: "User not found" })
  }
}

exports.loginUser = async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password in request body' })
  }

  try {
    const user = await userService.loginUser(email, password)
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const { password: _p, ...publicUser } = user
    const token = authService.signToken({ id: publicUser.id, email: publicUser.email, role: publicUser.role || 'user' })
    return res.json({ user: publicUser, token })
  } catch (err) {
    return res.status(500).json({ error: 'Internal error' })
  }
}