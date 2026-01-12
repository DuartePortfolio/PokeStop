const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pokestop_users_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'enter',
  {
    host: process.env.DB_HOST || 'db',
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
