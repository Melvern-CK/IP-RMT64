'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Move extends Model {
    static associate(models) {}
  }
  Move.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Move',
  });
  return Move;
};
