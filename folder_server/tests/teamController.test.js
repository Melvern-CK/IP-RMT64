const request = require('supertest');
const express = require('express');
const TeamController = require('../controllers/teamController');
const { Team, TeamPokemon, Pokemon } = require('../models');

// Mock dependencies
jest.mock('../models');

const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 1, role: 'user' };
  next();
};

// Set up routes for testing
app.post('/teams', mockAuth, TeamController.create);
app.get('/teams', mockAuth, TeamController.list);
app.get('/teams/:id', mockAuth, TeamController.getById);
app.put('/teams/:id', mockAuth, TeamController.update);
app.delete('/teams/:id', mockAuth, TeamController.delete);
app.post('/teams/:id/pokemon', mockAuth, TeamController.addPokemon);
app.delete('/teams/:id/pokemon/:pokemonId', mockAuth, TeamController.removePokemon);
app.patch('/teams/:teamId/pokemon/:pokemonId', mockAuth, TeamController.editPokemonDetails);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'NotFound') {
    res.status(404).json({ message: err.message });
  } else if (err.name === 'BadRequest') {
    res.status(400).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

describe('TeamController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /teams', () => {
    it('should create a new team', async () => {
      const mockTeam = { id: 1, name: 'My Team', userId: 1 };
      const mockTeamWithPokemons = { ...mockTeam, Pokemons: [] };

      Team.create.mockResolvedValue(mockTeam);
      Team.findByPk.mockResolvedValue(mockTeamWithPokemons);

      const response = await request(app)
        .post('/teams')
        .send({ name: 'My Team' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTeamWithPokemons);
      expect(Team.create).toHaveBeenCalledWith({ name: 'My Team', userId: 1 });
    });

    it('should handle missing request body', async () => {
      const response = await request(app)
        .post('/teams')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request body is required.');
    });

    it('should handle database errors', async () => {
      Team.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/teams')
        .send({ name: 'My Team' });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /teams', () => {
    it('should list all teams for user', async () => {
      const mockTeams = [
        { id: 1, name: 'Team 1', userId: 1, Pokemons: [] },
        { id: 2, name: 'Team 2', userId: 1, Pokemons: [] }
      ];

      Team.findAll.mockResolvedValue(mockTeams);

      const response = await request(app).get('/teams');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTeams);
      expect(Team.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: [{ model: Pokemon }]
      });
    });

    it('should handle database errors', async () => {
      Team.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/teams');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /teams/:id', () => {
    it('should get team by id with pokemon details', async () => {
      const mockTeam = { id: 1, name: 'My Team', userId: 1 };
      const mockTeamPokemons = [
        {
          id: 1,
          moves: ['tackle', 'growl'],
          ability: 'overgrow',
          nature: 'modest',
          slot: 1,
          Pokemon: { id: 1, name: 'bulbasaur' }
        }
      ];

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.findAll.mockResolvedValue(mockTeamPokemons);

      const response = await request(app).get('/teams/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'My Team',
        Pokemons: [
          {
            id: 1,
            Pokemon: { id: 1, name: 'bulbasaur' },
            moves: ['tackle', 'growl'],
            ability: 'overgrow',
            nature: 'modest',
            slot: 1
          }
        ]
      });
    });

    it('should return 404 when team not found', async () => {
      Team.findOne.mockResolvedValue(null);

      const response = await request(app).get('/teams/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('POST /teams/:id/pokemon', () => {
    it.skip('should add pokemon to team', async () => {
      const mockTeam = { id: 1, name: 'My Team', userId: 1 };
      const mockPokemon = { name: 'bulbasaur' };
      const mockTeamPokemon = { 
        teamId: 1, 
        pokemonId: 1, 
        slot: 1,
        toJSON: function() { return { teamId: 1, pokemonId: 1, slot: 1 }; }
      };

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.count.mockResolvedValue(0);
      TeamPokemon.findAll.mockResolvedValue([]);
      TeamPokemon.create.mockResolvedValue(mockTeamPokemon);
      Pokemon.findByPk.mockResolvedValue(mockPokemon);
      Team.findByPk.mockResolvedValue(mockTeam);

      const response = await request(app)
        .post('/teams/1/pokemon')
        .send({ pokemonId: 1 });

      expect(response.status).toBe(201);
      expect(response.body.team).toEqual(mockTeam);
      expect(response.body.pokemon.name).toBe('bulbasaur');
      expect(response.body.pokemon.teamId).toBe(1);
      expect(response.body.pokemon.pokemonId).toBe(1);
      expect(response.body.pokemon.slot).toBe(1);
      expect(TeamPokemon.create).toHaveBeenCalledWith({
        teamId: 1,
        pokemonId: 1,
        slot: 1
      });
    });

    it('should reject adding pokemon when team is full', async () => {
      const mockTeam = { id: 1, name: 'My Team', userId: 1 };

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.count.mockResolvedValue(6);

      const response = await request(app)
        .post('/teams/1/pokemon')
        .send({ pokemonId: 1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('A team can have a maximum of 6 Pokémon.');
    });

    it('should reject missing pokemonId', async () => {
      const response = await request(app)
        .post('/teams/1/pokemon')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('pokemonId is required.');
    });

    it('should return 404 when team not found', async () => {
      Team.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/teams/999/pokemon')
        .send({ pokemonId: 1 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('DELETE /teams/:id/pokemon/:pokemonId', () => {
    it('should remove pokemon from team', async () => {
      const mockTeam = { id: 1, name: 'My Team', userId: 1 };
      const mockTeamResult = { ...mockTeam, Pokemons: [] };

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.destroy.mockResolvedValue(1);
      Team.findByPk.mockResolvedValue(mockTeamResult);

      const response = await request(app).delete('/teams/1/pokemon/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTeamResult);
      expect(TeamPokemon.destroy).toHaveBeenCalledWith({
        where: { teamId: 1, pokemonId: '1' }
      });
    });

    it('should return 404 when pokemon not found in team', async () => {
      const mockTeam = { id: 1, name: 'My Team', userId: 1 };

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.destroy.mockResolvedValue(0);

      const response = await request(app).delete('/teams/1/pokemon/1');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Pokemon not found in team');
    });
  });

  describe('PATCH /teams/:teamId/pokemon/:pokemonId', () => {
    it('should update pokemon details', async () => {
      const mockTeamPokemon = {
        update: jest.fn().mockResolvedValue()
      };

      TeamPokemon.findOne.mockResolvedValue(mockTeamPokemon);

      const response = await request(app)
        .patch('/teams/1/pokemon/1')
        .send({
          moves: 'tackle, growl, vine whip',
          ability: 'overgrow',
          nature: 'modest'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Pokemon details updated successfully');
      expect(mockTeamPokemon.update).toHaveBeenCalledWith({
        moves: ['tackle', 'growl', 'vine whip'],
        ability: 'overgrow',
        nature: 'modest'
      });
    });

    it('should return 404 when pokemon not found in team', async () => {
      TeamPokemon.findOne.mockResolvedValue(null);

      const response = await request(app)
        .patch('/teams/1/pokemon/1')
        .send({
          moves: 'tackle',
          ability: 'overgrow'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pokemon not found in team');
    });

    it('should handle array moves input', async () => {
      const mockTeamPokemon = {
        update: jest.fn().mockResolvedValue()
      };

      TeamPokemon.findOne.mockResolvedValue(mockTeamPokemon);

      const response = await request(app)
        .patch('/teams/1/pokemon/1')
        .send({
          moves: ['tackle', 'growl'],
          ability: 'overgrow'
        });

      expect(response.status).toBe(200);
      expect(mockTeamPokemon.update).toHaveBeenCalledWith({
        moves: ['tackle', 'growl'],
        ability: 'overgrow',
        nature: null
      });
    });
  });

  describe('PUT /teams/:id', () => {
    it('should update team name', async () => {
      const mockTeam = {
        id: 1,
        name: 'Old Name',
        userId: 1,
        update: jest.fn().mockResolvedValue()
      };
      const mockUpdatedTeam = { ...mockTeam, name: 'New Name', Pokemons: [] };

      Team.findOne.mockResolvedValue(mockTeam);
      Team.findByPk.mockResolvedValue(mockUpdatedTeam);

      const response = await request(app)
        .put('/teams/1')
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(mockTeam.update).toHaveBeenCalledWith({ name: 'New Name' });
    });

    it('should update team pokemon composition', async () => {
      const mockTeam = {
        id: 1,
        name: 'My Team',
        userId: 1,
        update: jest.fn().mockResolvedValue()
      };

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.destroy.mockResolvedValue();
      TeamPokemon.bulkCreate.mockResolvedValue();
      Team.findByPk.mockResolvedValue({ ...mockTeam, Pokemons: [] });

      const response = await request(app)
        .put('/teams/1')
        .send({
          name: 'Updated Team',
          pokemonIds: [1, 2, 3]
        });

      expect(response.status).toBe(200);
      expect(TeamPokemon.destroy).toHaveBeenCalledWith({ where: { teamId: 1 } });
      expect(TeamPokemon.bulkCreate).toHaveBeenCalledWith([
        { teamId: 1, pokemonId: 1, slot: 1 },
        { teamId: 1, pokemonId: 2, slot: 2 },
        { teamId: 1, pokemonId: 3, slot: 3 }
      ]);
    });

    it('should reject team with more than 6 pokemon', async () => {
      const mockTeam = { id: 1, userId: 1 };
      Team.findOne.mockResolvedValue(mockTeam);

      const response = await request(app)
        .put('/teams/1')
        .send({
          pokemonIds: [1, 2, 3, 4, 5, 6, 7]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('A team can have a maximum of 6 Pokémon.');
    });

    it('should handle missing request body', async () => {
      const response = await request(app)
        .put('/teams/1')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Request body is required.');
    });
  });

  describe('DELETE /teams/:id', () => {
    it('should delete team and associated pokemon', async () => {
      const mockTeam = {
        id: 1,
        name: 'My Team',
        userId: 1,
        destroy: jest.fn().mockResolvedValue()
      };

      Team.findOne.mockResolvedValue(mockTeam);
      TeamPokemon.destroy.mockResolvedValue();

      const response = await request(app).delete('/teams/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Team deleted');
      expect(TeamPokemon.destroy).toHaveBeenCalledWith({ where: { teamId: 1 } });
      expect(mockTeam.destroy).toHaveBeenCalled();
    });

    it('should return 404 when team not found', async () => {
      Team.findOne.mockResolvedValue(null);

      const response = await request(app).delete('/teams/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });
});
