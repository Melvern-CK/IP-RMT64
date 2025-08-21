'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Teams', [
      {
        name: 'Ash’s Team',
        userId: 1, // Make sure this matches a seeded user
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Misty’s Team',
        userId: 2, // Make sure this matches a seeded user
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Teams', null, {});
  }
};