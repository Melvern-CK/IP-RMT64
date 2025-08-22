module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('TeamPokemons', 'moves', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('TeamPokemons', 'ability', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('TeamPokemons', 'nature', {
      type: Sequelize.STRING
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TeamPokemons', 'moves');
    await queryInterface.removeColumn('TeamPokemons', 'ability');
    await queryInterface.removeColumn('TeamPokemons', 'nature');
  }
};