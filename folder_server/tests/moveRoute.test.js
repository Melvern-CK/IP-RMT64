const request = require('supertest');
const express = require('express');
const moveRoute = require('../routes/moveRoute');
const { Move } = require('../models');

// Mock dependencies
jest.mock('../models');

const app = express();
app.use(express.json());
app.use('/api/moves', moveRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Internal server error' });
});

describe('Move Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/moves/:name', () => {
    it.skip('should get move by name', async () => {
      const mockMove = {
        id: 1,
        name: 'tackle',
        accuracy: 100,
        power: 40,
        pp: 35,
        category: 'normal'
      };

      Move.findOne.mockResolvedValue(mockMove);

      const response = await request(app).get('/api/moves/tackle');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMove);
    });

    it('should handle move not found', async () => {
      Move.findOne.mockResolvedValue(null);

      const response = await request(app).get('/api/moves/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle database errors', async () => {
      Move.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/moves/tackle');

      expect(response.status).toBe(500);
    });
  });
});
