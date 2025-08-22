'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Pokemons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      pokeApiId: {
        type: Sequelize.INTEGER
      },
      types: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      sprite: {
        type: Sequelize.STRING
      },
      height: {
        type: Sequelize.INTEGER
      },
      weight: {
        type: Sequelize.INTEGER
      },
      baseStats: {
        type: Sequelize.JSON
      },
      abilities: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      moves: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      "order": {
        type: Sequelize.INTEGER
      },
      base_experience: {
        type: Sequelize.INTEGER
      },
      is_default: {
        type: Sequelize.BOOLEAN
      },
      forms: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      flavor_text_entries: {
        type: Sequelize.JSON
      },
      moves_detail: {
        type: Sequelize.JSON
      },
      evolution_chain: {
        type: Sequelize.JSON
      },
      habitat: {
        type: Sequelize.STRING
      },
      generation: {
        type: Sequelize.STRING
      },
      capture_rate: {
        type: Sequelize.INTEGER
      },
      growth_rate: {
        type: Sequelize.STRING
      },
      ev_yield: {
        type: Sequelize.JSON
      },
      base_happiness: {
        type: Sequelize.INTEGER
      },
      egg_groups: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      egg_cycle: {
        type: Sequelize.INTEGER
      },
      gender_ratio: {
        type: Sequelize.JSON
      },
      type_effectiveness: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Pokemons');
  }
};