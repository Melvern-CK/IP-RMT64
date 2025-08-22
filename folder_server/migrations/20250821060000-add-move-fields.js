'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Moves', 'moveType', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Moves', 'power', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Moves', 'accuracy', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Moves', 'moveType');
    await queryInterface.removeColumn('Moves', 'power');
    await queryInterface.removeColumn('Moves', 'accuracy');
  }
};
