const errorHandler = require('../middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle SequelizeValidationError', () => {
    const error = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'Validation error message' }]
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Validation error message' });
  });

  it('should handle SequelizeUniqueConstraintError', () => {
    const error = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ message: 'Email must be unique' }]
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email must be unique' });
  });

  it('should handle NotFound error', () => {
    const error = {
      name: 'NotFound',
      message: 'Resource not found'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Resource not found' });
  });

  it('should handle BadRequest error', () => {
    const error = {
      name: 'BadRequest',
      message: 'Invalid request data'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid request data' });
  });

  it('should handle Unauthorized error', () => {
    const error = {
      name: 'Unauthorized',
      message: 'Access denied'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
  });

  it('should handle JsonWebTokenError', () => {
    const error = {
      name: 'JsonWebTokenError',
      message: 'jwt malformed'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('should handle Forbidden error', () => {
    const error = {
      name: 'Forbidden',
      message: 'Access forbidden'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access forbidden' });
  });

  it('should handle unknown errors as internal server error', () => {
    const error = {
      name: 'UnknownError',
      message: 'Something went wrong'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('should handle errors without name property', () => {
    const error = {
      message: 'Generic error'
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });

  it('should handle errors with empty errors array', () => {
    const error = {
      name: 'SequelizeValidationError',
      errors: []
    };

    // This should throw an error when trying to access errors[0]
    expect(() => errorHandler(error, req, res, next)).toThrow();
  });

  it('should prioritize specific error types over generic ones', () => {
    const testCases = [
      { name: 'SequelizeValidationError', errors: [{ message: 'Validation failed' }], expectedStatus: 400 },
      { name: 'NotFound', message: 'Not found', expectedStatus: 404 },
      { name: 'Unauthorized', message: 'Unauthorized', expectedStatus: 401 },
      { name: 'JsonWebTokenError', message: 'JWT error', expectedStatus: 401 },
      { name: 'Forbidden', message: 'Forbidden', expectedStatus: 403 }
    ];

    testCases.forEach(({ name, expectedStatus, ...errorProps }) => {
      const error = { name, ...errorProps };
      
      errorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      
      // Reset mocks for next iteration
      jest.clearAllMocks();
    });
  });
});
