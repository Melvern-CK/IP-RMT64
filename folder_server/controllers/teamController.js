const { Team, TeamPokemon, Pokemon } = require('../models');

class TeamController {
  // POST /teams
  static async create(req, res, next) {
    try {
      if (!req.body) {
        throw { name: 'BadRequest', message: 'Request body is required.' };
      }
      const { name } = req.body;
      const userId = req.user.id;
      const team = await Team.create({ name, userId });
      const result = await Team.findByPk(team.id, {
        include: [{ model: Pokemon }]
      });
      res.status(201).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  // POST /teams/:id/pokemon
  static async addPokemon(req, res, next) {
    try {
      const { id } = req.params;
      const { pokemonId } = req.body;
      const userId = req.user.id;
      if (!pokemonId) throw { name: 'BadRequest', message: 'pokemonId is required.' };

      const team = await Team.findOne({ where: { id, userId }, include: [Pokemon] });
      if (!team) throw { name: 'NotFound', message: 'Team not found' };

      const count = await TeamPokemon.count({ where: { teamId: team.id } });
      if (count >= 6) throw { name: 'BadRequest', message: 'A team can have a maximum of 6 Pokémon.' };
      // Find next available slot
      const slots = await TeamPokemon.findAll({ where: { teamId: team.id }, order: [['slot', 'ASC']] });
      let slot = 1;
      for (; slot <= 6; slot++) {
        if (!slots.find(tp => tp.slot === slot)) break;
      }
      const teamPokemon = await TeamPokemon.create({ teamId: team.id, pokemonId, slot });
      // Fetch the Pokémon name only
      const pokemon = await Pokemon.findByPk(pokemonId, { attributes: ['name'] });
      const pokemonResult = {
        name: pokemon.name,
        ...teamPokemon.toJSON(),
        Pokemon: undefined // Remove nested object if present
      };
      // Fetch the full team with all Pokémon
      const fullTeam = await Team.findByPk(team.id);
      res.status(201).json({ team: fullTeam, pokemon: pokemonResult });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /teams/:id/pokemon/:pokemonId
  static async removePokemon(req, res, next) {
    try {
      const { id, pokemonId } = req.params;
      const userId = req.user.id;
      const team = await Team.findOne({ where: { id, userId } });
      if (!team) throw { name: 'NotFound', message: 'Team not found' };
      const deleted = await TeamPokemon.destroy({ where: { teamId: team.id, pokemonId: pokemonId } });
      if (!deleted) throw { name: 'NotFound', message: 'Pokemon not found in team' };
      const result = await Team.findByPk(team.id, { include: [{ model: Pokemon }] });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // PATCH /teams/:teamId/pokemon/:pokemonId
    static async editPokemonDetails(req, res, next) {
        try {
            const { teamId, pokemonId } = req.params;
            const { moves, ability, nature } = req.body;
            const userId = req.user.id;
            const team = await Team.findOne({ where: { id: teamId, userId } });
            if (!team) throw { name: 'NotFound', message: 'Team not found' };

            const teamPokemon = await TeamPokemon.findOne({ where: { teamId, pokemonId } });
            if (!teamPokemon) throw { name: 'NotFound', message: 'Pokemon not found in team' };

      await teamPokemon.update({ moves, ability, nature });
      // Fetch the Pokémon name only
      const pokemon = await Pokemon.findByPk(pokemonId, { attributes: ['name'] });
      const pokemonResult = {
        name: pokemon.name,
        ...teamPokemon.toJSON(),
        Pokemon: undefined // Remove nested object if present
      };
      // Fetch the full team with all Pokémon
      const fullTeam = await Team.findByPk(teamId);
      res.json({ team: fullTeam, pokemon: pokemonResult });
        } catch (err) {
            next(err);
        }
        }
        
  // GET /teams
  static async list(req, res, next) {
    try {
      const userId = req.user.id;
      const teams = await Team.findAll({
        where: { userId },
        include: [{ model: Pokemon }]
      });
      res.json(teams);
    } catch (err) {
        console.log(err)
      next(err);
    }
  }

  // GET /teams/:id
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      // Find the team
      const team = await Team.findOne({ where: { id, userId } });
      if (!team) throw { name: 'NotFound', message: 'Team not found' };
      // Get all TeamPokemon for this team, including Pokémon name
      const teamPokemons = await TeamPokemon.findAll({
        where: { teamId: team.id },
        include: [{ model: Pokemon }],
        order: [['slot', 'ASC']]
      });
      const formattedTeam = {
        id: team.id,
        name: team.name,
        Pokemons: teamPokemons.map(tp => ({
          id: tp.id, // TeamPokemon ID for deletion
          Pokemon: tp.Pokemon,
          moves: tp.moves,
          ability: tp.ability,
          nature: tp.nature,
          slot: tp.slot
        }))
      };
      res.json(formattedTeam);
    } catch (err) {
      console.log(err)
      next(err);
    }
  }

  // PUT /teams/:id
  static async update(req, res, next) {
    try {
      const { id } = req.params;
        if (!req.body) {
          throw { name: 'BadRequest', message: 'Request body is required.' };
        }
      const { name, pokemonIds } = req.body;
      const userId = req.user.id;
      const team = await Team.findOne({ where: { id, userId } });
      if (!team) throw { name: 'NotFound', message: 'Team not found' };
      if (name) await team.update({ name });
      if (Array.isArray(pokemonIds)) {
        if (pokemonIds.length > 6) {
          throw { name: 'BadRequest', message: 'A team can have a maximum of 6 Pokémon.' };
        }
        await TeamPokemon.destroy({ where: { teamId: team.id } });
        const teamPokemons = pokemonIds.map((pokemonId, idx) => ({
          teamId: team.id,
          pokemonId,
          slot: idx + 1
        }));
        await TeamPokemon.bulkCreate(teamPokemons);
      }
      const result = await Team.findByPk(team.id, {
        include: [{ model: Pokemon }]
      });
      res.json(result);
    } catch (err) {
        console.log(err)
      next(err);
    }
  }

  // DELETE /teams/:id
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const team = await Team.findOne({ where: { id, userId } });
      if (!team) throw { name: 'NotFound', message: 'Team not found' };
      await TeamPokemon.destroy({ where: { teamId: team.id } });
      await team.destroy();
      res.json({ message: 'Team deleted' });
    } catch (err) {
        console.log(err)
      next(err);
    }
  }
}

module.exports = TeamController;
