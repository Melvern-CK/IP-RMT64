const request = require('supertest');
const express = require('express');
const PokemonController = require('../controllers/pokemonController');
const { Pokemon } = require('../models');

// Mock dependencies
jest.mock('../models');

const app = express();
app.use(express.json());

// Set up routes for testing
app.get('/pokemon', PokemonController.getAll);
app.get('/pokemon/:id', PokemonController.getById);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'NotFound') {
    res.status(404).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

describe('PokemonController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /pokemon', () => {
    it('should get all pokemon without filters', async () => {
      const mockPokemons = [
        {
          id: 1,
          name: 'bulbasaur',
          pokeApiId: 1,
          generation: 'generation-i',
          types: ['grass', 'poison']
        },
        {
          id: 2,
          name: 'ivysaur',
          pokeApiId: 2,
          generation: 'generation-i',
          types: ['grass', 'poison']
        }
      ];

      Pokemon.findAll.mockResolvedValue(mockPokemons);

      const response = await request(app).get('/pokemon');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPokemons);
      expect(Pokemon.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['pokeApiId', 'ASC']]
      });
    });

    it('should filter pokemon by generation', async () => {
      const mockPokemons = [
        {
          id: 1,
          name: 'bulbasaur',
          pokeApiId: 1,
          generation: 'generation-i'
        }
      ];

      Pokemon.findAll.mockResolvedValue(mockPokemons);

      const response = await request(app)
        .get('/pokemon')
        .query({ generation: 'generation-i' });

      expect(response.status).toBe(200);
      expect(Pokemon.findAll).toHaveBeenCalledWith({
        where: { generation: 'generation-i' },
        order: [['pokeApiId', 'ASC']]
      });
    });

    it('should search pokemon by name', async () => {
      const mockPokemons = [
        {
          id: 1,
          name: 'bulbasaur',
          pokeApiId: 1
        }
      ];

      Pokemon.findAll.mockResolvedValue(mockPokemons);

      const response = await request(app)
        .get('/pokemon')
        .query({ search: 'bulba' });

      expect(response.status).toBe(200);
      expect(Pokemon.findAll).toHaveBeenCalledWith({
        where: { 
          name: { 
            [require('sequelize').Op.iLike]: '%bulba%' 
          } 
        },
        order: [['pokeApiId', 'ASC']]
      });
    });

    it('should search pokemon by pokeApiId (numeric search)', async () => {
      const mockPokemons = [
        {
          id: 1,
          name: 'bulbasaur',
          pokeApiId: 1
        }
      ];

      Pokemon.findAll.mockResolvedValue(mockPokemons);

      const response = await request(app)
        .get('/pokemon')
        .query({ search: '1' });

      expect(response.status).toBe(200);
      expect(Pokemon.findAll).toHaveBeenCalledWith({
        where: { pokeApiId: 1 },
        order: [['pokeApiId', 'ASC']]
      });
    });

    it('should handle multiple filters', async () => {
      const mockPokemons = [];

      Pokemon.findAll.mockResolvedValue(mockPokemons);

      const response = await request(app)
        .get('/pokemon')
        .query({ 
          generation: 'generation-i',
          search: 'pika'
        });

      expect(response.status).toBe(200);
      expect(Pokemon.findAll).toHaveBeenCalledWith({
        where: { 
          generation: 'generation-i',
          name: { 
            [require('sequelize').Op.iLike]: '%pika%' 
          }
        },
        order: [['pokeApiId', 'ASC']]
      });
    });

    it('should handle database errors', async () => {
      Pokemon.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/pokemon');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /pokemon/:id', () => {
    it('should get pokemon by id', async () => {
      const mockPokemon = {
        id: 1,
        name: 'bulbasaur',
        pokeApiId: 1,
        types: ['grass', 'poison'],
        height: 7,
        weight: 69
      };

      Pokemon.findByPk.mockResolvedValue(mockPokemon);

      const response = await request(app).get('/pokemon/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPokemon);
      expect(Pokemon.findByPk).toHaveBeenCalledWith('1');
    });

    it('should return 404 when pokemon not found', async () => {
      Pokemon.findByPk.mockResolvedValue(null);

      const response = await request(app).get('/pokemon/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Pokemon not found');
    });

    it('should handle database errors', async () => {
      Pokemon.findByPk.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/pokemon/1');

      expect(response.status).toBe(500);
    });
  });
});
