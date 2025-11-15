const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Auth Middleware Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let testUser;
  let validToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sweet-shop-test');
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      is_admin: false,
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    validToken = jwt.sign(
      { userId: testUser._id, email: testUser.email },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );
  });

  describe('Valid Authentication', () => {
    it('should authenticate request with valid token', () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      auth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.userId).toBe(testUser._id.toString());
    });

    it('should extract userId from valid token', () => {
      mockReq.headers.authorization = `Bearer ${validToken}`;

      auth(mockReq, mockRes, mockNext);

      expect(mockReq.userId).toBeDefined();
    });
  });

  describe('Missing Authentication', () => {
    it('should reject request without authorization header', () => {
      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('No token'),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with empty authorization header', () => {
      mockReq.headers.authorization = '';

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Token Format', () => {
    it('should reject token without Bearer prefix', () => {
      mockReq.headers.authorization = validToken; // Missing "Bearer "

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject malformed token', () => {
      mockReq.headers.authorization = 'Bearer invalid.token.format';

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid token'),
        })
      );
    });
  });

  describe('Expired Token', () => {
    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Token has expired'),
        })
      );
    });
  });

  describe('Token with Wrong Secret', () => {
    it('should reject token signed with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { userId: testUser._id, email: testUser.email },
        'wrong_secret'
      );

      mockReq.headers.authorization = `Bearer ${wrongSecretToken}`;

      auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid token'),
        })
      );
    });
  });
});
