import { DataTypes } from 'sequelize';
import sequelize from '../services/sequelize.js';

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  displayName: { type: DataTypes.STRING, allowNull: false },
  avatar: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  badges: { type: DataTypes.JSON },
  stats: { type: DataTypes.JSON },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' }
}, {
  timestamps: true
});

export default User;
