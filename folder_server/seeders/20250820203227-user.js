'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        username: 'ashketchum',
        email: 'ash@pokehub.com',
        password: await bcrypt.hash('pikachu123', 10),
        role: 'trainer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'misty',
        email: 'misty@pokehub.com',
        password: await bcrypt.hash('staryu123', 10),
        role: 'trainer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin',
        email: 'admin@pokehub.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};