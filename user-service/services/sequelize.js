const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('pokestop_user_service', 'root', 'enter', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;
