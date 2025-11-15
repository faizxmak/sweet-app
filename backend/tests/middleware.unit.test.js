const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware - Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  const validSecret = process.env.JWT_SECRET || 'test_secret_key';

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('Token Validation', () => {
    it('should call next middleware when token is valid', () => {
      const token = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        validSecret
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      auth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe('123');
    });

    it('should reject request with no Authorization header', () => {
      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token without Bearer prefix', () => {
      const token = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        validSecret
      );
      mockReq.headers.authorization = token;

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should reject malformed token', () => {
      mockReq.headers.authorization = 'Bearer invalid.token.here';

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should reject token with wrong secret', () => {
      const token = jwt.sign(
        { userId: '123', email: 'test@example.com' },
        'wrong_secret'
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
