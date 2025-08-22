const { Pokemon } = require('../models');
const { Op } = require('sequelize');
class PokemonController {
  // GET /pokemon
  static async getAll(req, res, next) {
    try {
      const { generation, search } = req.query;
      const where = {};

      // Filtering by generation
      if (generation) {
        where.generation = generation;
      }

      // Searching by name or id
        if (search) {
            if (!isNaN(search)) {
                where.pokeApiId = Number(search);
            } else {
                where.name = { [Op.iLike]: `%${search}%` };
            }
        }

      const pokemons = await Pokemon.findAll({
        where,
        order: [['pokeApiId', 'ASC']]
      });
      res.json(pokemons);
    } catch (err) {
        console.log(err);
        next(err);
    }
  }

  // GET /pokemon/:id
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pokemon = await Pokemon.findByPk(id);
      if (!pokemon) throw { name: 'NotFound', message: 'Pokemon not found' };
      res.json(pokemon);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PokemonController;
