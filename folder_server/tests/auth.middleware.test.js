const authMiddleware = require('../middlewares/auth');
const { verifyToken } = require('../helpers/jwt');

// Mock the JWT helper
jest.mock('../helpers/jwt');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should authenticate valid token', () => {
    const mockPayload = { id: 1, role: 'user' };
    const token = 'valid.jwt.token';
    
    req.headers.authorization = `Bearer ${token}`;
    verifyToken.mockReturnValue(mockPayload);

    authMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(req.user).toEqual(mockPayload);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject request without authorization header', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('should reject request with empty authorization header', () => {
    req.headers.authorization = '';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with malformed authorization header', () => {
    req.headers.authorization = 'InvalidFormat token';
    
    // This will still try to verify the token, so mock verifyToken to throw error
    verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('token');
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should reject request with Bearer but no token', () => {
    req.headers.authorization = 'Bearer ';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with only Bearer', () => {
    req.headers.authorization = 'Bearer';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle JWT verification errors', () => {
    const token = 'invalid.jwt.token';
    const mockError = new Error('Invalid token');
    
    req.headers.authorization = `Bearer ${token}`;
    verifyToken.mockImplementation(() => {
      throw mockError;
    });

    authMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(next).toHaveBeenCalledWith(mockError);
    expect(req.user).toBeUndefined();
  });

  it('should handle JWT expired error', () => {
    const token = 'expired.jwt.token';
    const mockError = new Error('Token expired');
    mockError.name = 'TokenExpiredError';
    
    req.headers.authorization = `Bearer ${token}`;
    verifyToken.mockImplementation(() => {
      throw mockError;
    });

    authMiddleware(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith(token);
    expect(next).toHaveBeenCalledWith(mockError);
  });

  it('should handle different token formats', () => {
    const testCases = [
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'Bearer short.token',
      'Bearer very.long.token.with.multiple.parts.and.signatures'
    ];

    testCases.forEach(authHeader => {
      req.headers.authorization = authHeader;
      const expectedToken = authHeader.split(' ')[1];
      
      verifyToken.mockReturnValue({ id: 1 });
      
      authMiddleware(req, res, next);
      
      expect(verifyToken).toHaveBeenCalledWith(expectedToken);
      
      // Reset for next iteration
      jest.clearAllMocks();
    });
  });

  it('should preserve original request properties', () => {
    const mockPayload = { id: 1, role: 'user' };
    const token = 'valid.token';
    
    req.headers.authorization = `Bearer ${token}`;
    req.body = { test: 'data' };
    req.params = { id: '123' };
    req.query = { search: 'test' };
    
    verifyToken.mockReturnValue(mockPayload);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(mockPayload);
    expect(req.body).toEqual({ test: 'data' });
    expect(req.params).toEqual({ id: '123' });
    expect(req.query).toEqual({ search: 'test' });
  });
});
