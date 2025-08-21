'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TeamPokemon extends Model {
    static associate(models) {
      TeamPokemon.belongsTo(models.Pokemon, { foreignKey: 'pokemonId' });
    }
  }
  TeamPokemon.init({
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Team ID is required' },
        isInt: { msg: 'Team ID must be an integer' }
      }
    },
    pokemonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Pokemon ID is required' },
        isInt: { msg: 'Pokemon ID must be an integer' }
      }
    },
    slot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: 'Slot is required' },
        isInt: { msg: 'Slot must be an integer' },
        min: 1,
        max: 6
      }
    },
      moves: DataTypes.ARRAY(DataTypes.STRING),
      ability: DataTypes.STRING,
      nature: DataTypes.STRING
    }, {
    sequelize,
    modelName: 'TeamPokemon',
    indexes: [
      {
        unique: true,
        fields: ['teamId', 'slot']
      }
    ]
  });
  return TeamPokemon;
};