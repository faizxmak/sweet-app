const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Auth Controller Tests', () => {
  let testUser;
  let testToken;

  beforeAll(async () => {
    // Connect to test database (use a separate MongoDB for testing)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sweet-shop-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.message).toContain('Registration successful');
    });

    it('should not register user with duplicate email', async () => {
      // Create first user
      await User.create({
        name: 'User 1',
        email: 'duplicate@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicate@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already registered');
    });

    it('should require all fields for registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          // Missing email and password
        });

      expect(response.status).toBe(400);
    });

    it('should generate admin code on registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin Test',
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      const user = await User.findOne({ email: 'admin@example.com' });
      expect(user.adminCode).toBeDefined();
      expect(user.adminCodeExpiry).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        is_admin: false,
      });
    });

    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return JWT token on successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toMatch(/^[\w\-]+\.[\w\-]+\.[\w\-]+$/); // JWT format
    });
  });

  describe('POST /api/auth/verify-admin-code', () => {
    let adminCode;

    beforeEach(async () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      adminCode = '123456';
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        is_admin: false,
        adminCode,
        adminCodeExpiry: future,
      });
    });

    it('should verify admin code and grant admin status', async () => {
      const response = await request(app)
        .post('/api/auth/verify-admin-code')
        .send({
          email: 'test@example.com',
          adminCode: '123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.is_admin).toBe(true);
      expect(response.body.message).toContain('Admin status granted');

      // Verify in database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user.is_admin).toBe(true);
      expect(user.adminCode).toBeNull();
    });

    it('should reject incorrect admin code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-admin-code')
        .send({
          email: 'test@example.com',
          adminCode: 'wrongcode',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid admin code');
    });

    it('should reject expired admin code', async () => {
      // Create user with expired code
      const past = new Date(Date.now() - 1000); // 1 second ago
      await User.findByIdAndUpdate(testUser._id, {
        adminCodeExpiry: past,
      });

      const response = await request(app)
        .post('/api/auth/verify-admin-code')
        .send({
          email: 'test@example.com',
          adminCode: adminCode,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('expired');
    });
  });
});
