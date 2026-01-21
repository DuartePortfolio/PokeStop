const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');
const Encounter = require('./Encounter');

const MinigameAttempt = sequelize.define('MinigameAttempt', {
  encounterId: { type: DataTypes.INTEGER, allowNull: false },
  attemptNumber: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  success: { type: DataTypes.BOOLEAN, defaultValue: false },
  attemptedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'MinigameAttempts',
  timestamps: false
});

MinigameAttempt.belongsTo(Encounter, { foreignKey: 'encounterId' });
Encounter.hasMany(MinigameAttempt, { foreignKey: 'encounterId' });

module.exports = MinigameAttempt;
