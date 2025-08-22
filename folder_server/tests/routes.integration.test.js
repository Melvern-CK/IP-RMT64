const request = require('supertest');
const express = require('express');
const authRoute = require('../routes/authRoute');
const pokemonRoute = require('../routes/pokemonRoute');
const teamRoute = require('../routes/teamRoute');

// Mock all controllers and middleware
jest.mock('../controllers/authController');
jest.mock('../controllers/pokemonController');
jest.mock('../controllers/teamController');
jest.mock('../middlewares/auth');
jest.mock('../middlewares/errorHandler');

const AuthController = require('../controllers/authController');
const PokemonController = require('../controllers/pokemonController');
const TeamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/auth');

describe('Routes Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock auth middleware to just call next()
    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { id: 1, role: 'user' };
      next();
    });

    // Setup routes
    app.use('/auth', authRoute);
    app.use('/pokemon', pokemonRoute);
    app.use('/teams', teamRoute);

    jest.clearAllMocks();
  });

  describe('Auth Routes', () => {
    it('POST /auth/register should call AuthController.register', async () => {
      AuthController.register.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(AuthController.register).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('POST /auth/login should call AuthController.login', async () => {
      AuthController.login.mockImplementation((req, res) => {
        res.json({ token: 'jwt-token' });
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(AuthController.login).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('POST /auth/google should call AuthController.googleLogin', async () => {
      AuthController.googleLogin.mockImplementation((req, res) => {
        res.json({ success: true, access_token: 'google-jwt' });
      });

      const response = await request(app)
        .post('/auth/google')
        .send({
          token: 'google-id-token'
        });

      expect(AuthController.googleLogin).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Pokemon Routes', () => {
    it('GET /pokemon should call PokemonController.getAll', async () => {
      PokemonController.getAll.mockImplementation((req, res) => {
        res.json([{ id: 1, name: 'bulbasaur' }]);
      });

      const response = await request(app).get('/pokemon');

      expect(PokemonController.getAll).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('GET /pokemon/:id should call PokemonController.getById', async () => {
      PokemonController.getById.mockImplementation((req, res) => {
        res.json({ id: 1, name: 'bulbasaur' });
      });

      const response = await request(app).get('/pokemon/1');

      expect(PokemonController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should handle query parameters for pokemon search', async () => {
      PokemonController.getAll.mockImplementation((req, res) => {
        res.json([]);
      });

      await request(app)
        .get('/pokemon')
        .query({ search: 'pika', generation: 'generation-i' });

      expect(PokemonController.getAll).toHaveBeenCalled();
    });
  });

  describe('Team Routes', () => {
    it('POST /teams should call TeamController.create with auth', async () => {
      TeamController.create.mockImplementation((req, res) => {
        res.status(201).json({ id: 1, name: 'My Team' });
      });

      const response = await request(app)
        .post('/teams')
        .send({ name: 'My Team' });

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.create).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('GET /teams should call TeamController.list with auth', async () => {
      TeamController.list.mockImplementation((req, res) => {
        res.json([]);
      });

      const response = await request(app).get('/teams');

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.list).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('GET /teams/:id should call TeamController.getById with auth', async () => {
      TeamController.getById.mockImplementation((req, res) => {
        res.json({ id: 1, name: 'My Team' });
      });

      const response = await request(app).get('/teams/1');

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.getById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('PUT /teams/:id should call TeamController.update with auth', async () => {
      TeamController.update.mockImplementation((req, res) => {
        res.json({ id: 1, name: 'Updated Team' });
      });

      const response = await request(app)
        .put('/teams/1')
        .send({ name: 'Updated Team' });

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.update).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('DELETE /teams/:id should call TeamController.delete with auth', async () => {
      TeamController.delete.mockImplementation((req, res) => {
        res.json({ message: 'Team deleted' });
      });

      const response = await request(app).delete('/teams/1');

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.delete).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('POST /teams/:id/pokemon should call TeamController.addPokemon with auth', async () => {
      TeamController.addPokemon.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      const response = await request(app)
        .post('/teams/1/pokemon')
        .send({ pokemonId: 1 });

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.addPokemon).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('DELETE /teams/:id/pokemon/:pokemonId should call TeamController.removePokemon with auth', async () => {
      TeamController.removePokemon.mockImplementation((req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).delete('/teams/1/pokemon/1');

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.removePokemon).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('PATCH /teams/:teamId/pokemon/:pokemonId should call TeamController.editPokemonDetails with auth', async () => {
      TeamController.editPokemonDetails.mockImplementation((req, res) => {
        res.json({ message: 'Pokemon updated' });
      });

      const response = await request(app)
        .patch('/teams/1/pokemon/1')
        .send({ ability: 'overgrow' });

      expect(authMiddleware).toHaveBeenCalled();
      expect(TeamController.editPokemonDetails).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('Route Parameter Handling', () => {
    it('should pass route parameters correctly', async () => {
      let capturedReq;
      
      PokemonController.getById.mockImplementation((req, res) => {
        capturedReq = req;
        res.json({ id: req.params.id });
      });

      await request(app).get('/pokemon/123');

      expect(capturedReq.params.id).toBe('123');
    });

    it('should pass multiple parameters correctly', async () => {
      let capturedReq;
      
      TeamController.removePokemon.mockImplementation((req, res) => {
        capturedReq = req;
        res.json({ success: true });
      });

      await request(app).delete('/teams/5/pokemon/25');

      expect(capturedReq.params.id).toBe('5');
      expect(capturedReq.params.pokemonId).toBe('25');
    });

    it('should pass request body correctly', async () => {
      let capturedReq;
      
      TeamController.create.mockImplementation((req, res) => {
        capturedReq = req;
        res.status(201).json(req.body);
      });

      const testData = { name: 'Test Team', description: 'Test description' };
      await request(app)
        .post('/teams')
        .send(testData);

      expect(capturedReq.body).toEqual(testData);
    });
  });
});
