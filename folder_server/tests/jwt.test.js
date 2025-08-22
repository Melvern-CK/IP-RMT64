const { signToken, verifyToken } = require('../helpers/jwt');
const jwt = require('jsonwebtoken');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('JWT Helper', () => {
  const mockSecret = 'test-secret-key';
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = mockSecret;
  });

  describe('signToken', () => {
    it('should sign token with provided data', () => {
      const mockToken = 'mocked.jwt.token';
      const userData = { id: 1, username: 'testuser', role: 'user' };
      
      jwt.sign.mockReturnValue(mockToken);

      const result = signToken(userData);

      expect(jwt.sign).toHaveBeenCalledWith(userData, mockSecret);
      expect(result).toBe(mockToken);
    });

    it('should handle different user data', () => {
      const testCases = [
        { id: 1, role: 'user' },
        { id: 2, username: 'admin', role: 'admin' },
        { id: 3, username: 'test', email: 'test@example.com' }
      ];

      jwt.sign.mockReturnValue('token');

      testCases.forEach(userData => {
        signToken(userData);
        expect(jwt.sign).toHaveBeenCalledWith(userData, mockSecret);
      });
    });

    it('should handle empty data', () => {
      jwt.sign.mockReturnValue('empty.token');

      const result = signToken({});

      expect(jwt.sign).toHaveBeenCalledWith({}, mockSecret);
      expect(result).toBe('empty.token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const mockPayload = { id: 1, username: 'testuser', role: 'user' };
      const token = 'valid.jwt.token';
      
      jwt.verify.mockReturnValue(mockPayload);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, mockSecret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token';
      const mockError = new Error('Invalid token');
      
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
      expect(jwt.verify).toHaveBeenCalledWith(invalidToken, mockSecret);
    });

    it('should throw error for expired token', () => {
      const expiredToken = 'expired.token';
      const mockError = new jwt.TokenExpiredError('Token expired', new Date());
      
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => verifyToken(expiredToken)).toThrow();
      expect(jwt.verify).toHaveBeenCalledWith(expiredToken, mockSecret);
    });

    it('should handle malformed token', () => {
      const malformedToken = 'malformed.token';
      const mockError = new jwt.JsonWebTokenError('Malformed token');
      
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      expect(() => verifyToken(malformedToken)).toThrow();
      expect(jwt.verify).toHaveBeenCalledWith(malformedToken, mockSecret);
    });
  });
});
