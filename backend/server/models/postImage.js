const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('PostImage', {
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });