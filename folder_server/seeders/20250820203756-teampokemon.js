'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TeamPokemons', [
      // Ash's Team: Pikachu (id 1), Charizard (id 3)
      {
        teamId: 1,
        pokemonId: 1,
        slot: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        teamId: 1,
        pokemonId: 3,
        slot: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Misty's Team: Bulbasaur (id 2)
      {
        teamId: 2,
        pokemonId: 2,
        slot: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TeamPokemons', null, {});
  }
};