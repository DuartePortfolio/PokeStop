const userService = require('../services/userService');

// Helper function to format user data for response
function formatUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    badges: user.badges,
    stats: user.stats,
    role: user.role,
    createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
  };
}

const resolvers = {
  getAllUsers: async (parent, args, context) => {
    // Authorization check: must be admin
    if (!context?.user) {
      throw new Error('Access denied. Token missing.');
    }
    const userRole = context.user.role || 'user';
    if (userRole !== 'admin') {
      throw new Error('Access forbidden: insufficient privileges.');
    }
    
    const users = await userService.getAllUsers();
    return users.map(u => formatUser(u));
  },

  getUserById: async (parent, args, context) => {
    const { id } = args;
    // Authorization check: must be authenticated and accessing own resource
    if (!context?.user) {
      throw new Error('Not authenticated.');
    }
    const userId = Number(context.user.id);
    if (Number.isNaN(id)) {
      throw new Error('Invalid user id parameter');
    }
    if (userId !== id) {
      throw new Error('Forbidden: can only access your own resource');
    }

    const user = await userService.getUserById(id);
    if (!user) {
      return null;
    }
    return formatUser(user);
  },

  validateUser: async (parent, args, context) => {
    const { token } = args;
    // No authentication required for this internal operation
    try {
      // Verify the token and extract user
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'pokestop-secret-change-in-production');
      const user = await userService.getUserById(decoded.id);
      return user ? true : false;
    } catch (err) {
      return false;
    }
  },

  registerUser: async (parent, args, context) => {
    const { username, password, displayName } = args;
    // No authentication required for registration (internal auth-service call)
    if (!username || !password || !displayName) {
      throw new Error('Username, password, and displayName are required');
    }
    
    try {
      const user = await userService.createUser({
        username,
        password,
        displayName,
        avatar: args.avatar,
        bio: args.bio,
        badges: args.badges,
        stats: args.stats
      });
      return {
        message: 'User created',
        user: formatUser(user)
      };
    } catch (err) {
      throw new Error(err.message);
    }
  },

  updateUser: async (parent, args, context) => {
    const { id } = args;
    // Authorization check: must be authenticated and updating own resource
    if (!context?.user) {
      throw new Error('Not authenticated.');
    }
    const userId = Number(context.user.id);
    if (Number.isNaN(id)) {
      throw new Error('Invalid user id parameter');
    }
    if (userId !== id) {
      throw new Error('Forbidden: can only access your own resource');
    }

    const updates = {};
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.bio !== undefined) updates.bio = args.bio;

    const user = await userService.updateUser(id, updates);
    if (!user) {
      throw new Error('User not found');
    }
    return formatUser(user);
  },

  deleteUser: async (parent, args, context) => {
    const { id } = args;
    // Authorization check: must be authenticated and deleting own resource
    if (!context?.user) {
      throw new Error('Not authenticated.');
    }
    const userId = Number(context.user.id);
    if (Number.isNaN(id)) {
      throw new Error('Invalid user id parameter');
    }
    if (userId !== id) {
      throw new Error('Forbidden: can only access your own resource');
    }

    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      throw new Error('User not found');
    }
    return {
      message: 'User deleted successfully',
      success: true
    };
  }
};

module.exports = resolvers;
