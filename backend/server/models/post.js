const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Post', {
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });