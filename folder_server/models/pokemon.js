'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pokemon extends Model {
    static associate(models) {
      Pokemon.belongsToMany(models.Team, { through: models.TeamPokemon, foreignKey: 'pokemonId' });
    }
  }
  Pokemon.init({
    name: DataTypes.STRING,
    pokeApiId: DataTypes.INTEGER,
    types: DataTypes.ARRAY(DataTypes.STRING),
    sprite: DataTypes.STRING,
    height: DataTypes.INTEGER,
    weight: DataTypes.INTEGER,
    baseStats: DataTypes.JSON, // {hp, attack, defense, special_attack, special_defense, speed}
    abilities: DataTypes.ARRAY(DataTypes.STRING),
    moves: DataTypes.ARRAY(DataTypes.STRING),
    order: DataTypes.INTEGER,
    base_experience: DataTypes.INTEGER,
    is_default: DataTypes.BOOLEAN,
    forms: DataTypes.ARRAY(DataTypes.STRING),
  flavor_text_entries: DataTypes.JSON, // array of {flavor_text, language, version}
  moves_detail: DataTypes.JSON, // array of {move, method, level, version}
  evolution_chain: DataTypes.JSON, // evolution chain data
  habitat: DataTypes.STRING,
  generation: DataTypes.STRING,
  capture_rate: DataTypes.INTEGER,
  growth_rate: DataTypes.STRING,
  ev_yield: DataTypes.JSON, // {stat: value}
  base_happiness: DataTypes.INTEGER,
  egg_groups: DataTypes.ARRAY(DataTypes.STRING),
  egg_cycle: DataTypes.INTEGER,
  gender_ratio: DataTypes.JSON, // {male: %, female: %}
  type_effectiveness: DataTypes.JSON // {type: multiplier}
  }, {
    sequelize,
    modelName: 'Pokemon',
  });
  return Pokemon;
};