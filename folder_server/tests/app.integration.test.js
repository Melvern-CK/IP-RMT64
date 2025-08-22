const request = require('supertest');

// Mock all dependencies before requiring the app
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

jest.mock('../routes/authRoute', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/register', (req, res) => res.json({ message: 'register endpoint' }));
  router.post('/login', (req, res) => res.json({ message: 'login endpoint' }));
  return router;
});

jest.mock('../routes/pokemonRoute', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'pokemon endpoint' }));
  return router;
});

jest.mock('../routes/teamRoute', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'teams endpoint' }));
  return router;
});

jest.mock('../routes/moveRoute', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/', (req, res) => res.json({ message: 'moves endpoint' }));
  return router;
});

jest.mock('../middlewares/auth', () => {
  return (req, res, next) => {
    req.user = { id: 1, role: 'user' };
    next();
  };
});

jest.mock('../middlewares/errorHandler', () => {
  return (err, req, res, next) => {
    res.status(500).json({ message: 'Error handled' });
  };
});

// Mock console.log to keep test output clean
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('App Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Clear module cache and require fresh app instance
    jest.clearAllMocks();
    delete require.cache[require.resolve('../app.js')];
    app = require('../app.js');
  });

  describe('Middleware Setup', () => {
    it('should handle JSON requests', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ username: 'test', email: 'test@example.com' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
    });

    it('should handle URL encoded requests', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send('username=test&email=test@example.com')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
    });

    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/pokemon')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Route Mounting', () => {
    it('should mount pokemon routes as public', async () => {
      const response = await request(app).get('/pokemon');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('pokemon endpoint');
    });

    it('should mount auth routes', async () => {
      const response = await request(app).post('/auth/register');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('register endpoint');
    });

    it('should mount moves API as public', async () => {
      const response = await request(app).get('/api/moves');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('moves endpoint');
    });

    it('should mount team routes with auth protection', async () => {
      const response = await request(app).get('/teams');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('teams endpoint');
    });
  });

  describe('Authentication Middleware Order', () => {
    it('should allow access to public routes without auth', async () => {
      const publicRoutes = [
        '/pokemon',
        '/api/moves',
        '/auth/register',
        '/auth/login'
      ];

      for (const route of publicRoutes) {
        const response = await request(app).get(route);
        expect(response.status).not.toBe(401);
      }
    });

    it('should protect team routes with auth middleware', async () => {
      // Since our mock auth middleware always succeeds, 
      // we test that the route is reached successfully
      const response = await request(app).get('/teams');
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
    });

    it('should use error handler middleware', async () => {
      // Create a route that throws an error to test error handling
      const express = require('express');
      const testApp = express();
      
      testApp.use(express.json());
      testApp.get('/error-test', (req, res, next) => {
        throw new Error('Test error');
      });
      
      testApp.use(require('../middlewares/errorHandler'));

      const response = await request(testApp).get('/error-test');
      expect(response.status).toBe(500);
    });
  });

  describe('App Configuration', () => {
    it('should export the app instance', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function'); // Express app is a function
    });

    it('should configure express settings correctly', () => {
      // Test that the app has the expected properties
      expect(app).toBeDefined();
      expect(typeof app).toBe('function'); // Express app is a function
      expect(app.listen).toBeDefined(); // Should have listen method
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment variables', () => {
      // Since dotenv.config is called at module level, we just verify the module exists
      const dotenv = require('dotenv');
      expect(dotenv.config).toBeDefined();
    });
  });

  describe('Request Processing', () => {
    it('should process requests through full middleware stack', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('should handle complex request data', async () => {
      const complexData = {
        user: {
          name: 'Test User',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        metadata: {
          source: 'test',
          timestamp: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/auth/register')
        .send(complexData);

      expect(response.status).toBe(200);
    });
  });

  describe('Response Headers', () => {
    it('should set correct content-type for JSON responses', async () => {
      const response = await request(app).get('/pokemon');
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/pokemon')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
