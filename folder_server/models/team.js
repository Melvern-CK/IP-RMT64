'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.belongsTo(models.User, { foreignKey: 'userId' });
      Team.belongsToMany(models.Pokemon, { through: models.TeamPokemon, foreignKey: 'teamId' });
    }
  }
  Team.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Team name is required' },
        notEmpty: { msg: 'Team name cannot be empty' }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'User ID is required' },
        isInt: { msg: 'User ID must be an integer' }
      }
    }
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};