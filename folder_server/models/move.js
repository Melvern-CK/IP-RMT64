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
    },
    moveType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    power: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    accuracy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Move',
  });
  return Move;
};
