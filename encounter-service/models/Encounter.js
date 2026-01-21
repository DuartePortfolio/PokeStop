const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const Encounter = sequelize.define('Encounter', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  pokemonId: { type: DataTypes.INTEGER, allowNull: false },
  pokemonName: { type: DataTypes.STRING, allowNull: false },
  pokemonSprite: { type: DataTypes.STRING },
  captureRate: { type: DataTypes.INTEGER, defaultValue: 45 },
  isShiny: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { 
    type: DataTypes.ENUM('active', 'caught', 'fled', 'skipped'), 
    defaultValue: 'active' 
  },
  maxAttempts: { type: DataTypes.INTEGER, defaultValue: 3 },
  attemptsUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
  nickname: { type: DataTypes.STRING, allowNull: true },
  encounteredAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completedAt: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'Encounters',
  timestamps: false
});

module.exports = Encounter;
