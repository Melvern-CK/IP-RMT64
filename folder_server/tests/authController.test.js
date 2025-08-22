const request = require('supertest');
const express = require('express');
const AuthController = require('../controllers/authController');
const { User } = require('../models');
const { hashPassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

// Mock dependencies
jest.mock('../models');
jest.mock('../helpers/bcrypt');
jest.mock('../helpers/jwt');
jest.mock('google-auth-library');

const app = express();
app.use(express.json());

// Set up routes for testing
app.post('/register', AuthController.register);
app.post('/login', AuthController.login);
app.post('/google-login', AuthController.googleLogin);

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.name === 'Unauthorized') {
    res.status(401).json({ message: err.message });
  } else if (err.name === 'BadRequest') {
    res.status(400).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      hashPassword.mockReturnValue('hashedpassword123');
      User.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123'
      });
    });

    it('should handle registration errors', async () => {
      User.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user'
      };

      User.findOne.mockResolvedValue(mockUser);
      signToken.mockReturnValue('jwt-token-123');

      // Mock bcrypt comparison directly from the mock
      const { comparePassword } = require('../helpers/bcrypt');
      comparePassword.mockReturnValue(true);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: 'jwt-token-123',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      });
    });

    it('should reject invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject wrong password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword'
      };

      User.findOne.mockResolvedValue(mockUser);
      
      const { comparePassword } = require('../helpers/bcrypt');
      comparePassword.mockReturnValue(false);

      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /google-login', () => {
    it('should login with Google OAuth for existing user', async () => {
      const mockUser = {
        id: 1,
        username: 'John Doe',
        email: 'john@example.com'
      };

      // Mock Google OAuth client
      const { OAuth2Client } = require('google-auth-library');
      const mockClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'john@example.com',
            name: 'John Doe'
          })
        })
      };
      OAuth2Client.mockImplementation(() => mockClient);

      User.findOne.mockResolvedValue(mockUser);
      signToken.mockReturnValue('google-jwt-token');

      const response = await request(app)
        .post('/google-login')
        .send({
          token: 'google-id-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        access_token: 'google-jwt-token',
        user: {
          id: 1,
          username: 'John Doe',
          email: 'john@example.com'
        }
      });
    });

    it('should create new user for Google OAuth first-time login', async () => {
      const mockNewUser = {
        id: 2,
        username: 'Jane Doe',
        email: 'jane@example.com'
      };

      // Mock Google OAuth client
      const { OAuth2Client } = require('google-auth-library');
      const mockClient = {
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => ({
            email: 'jane@example.com',
            name: 'Jane Doe'
          })
        })
      };
      OAuth2Client.mockImplementation(() => mockClient);

      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.create.mockResolvedValue(mockNewUser);
      signToken.mockReturnValue('new-google-jwt-token');
      hashPassword.mockReturnValue('hashed-google-password');

      const response = await request(app)
        .post('/google-login')
        .send({
          token: 'google-id-token'
        });

      expect(response.status).toBe(200);
      expect(User.create).toHaveBeenCalledWith({
        username: 'Jane Doe',
        email: 'jane@example.com',
        password: 'hashed-google-password'
      });
    });

    it('should handle Google OAuth verification failure', async () => {
      // Mock Google OAuth client to throw error
      const { OAuth2Client } = require('google-auth-library');
      const mockClient = {
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token'))
      };
      OAuth2Client.mockImplementation(() => mockClient);

      const response = await request(app)
        .post('/google-login')
        .send({
          token: 'invalid-google-token'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Google authentication failed'
      });
    });
  });
});
