const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Sweets Controller Tests', () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let regularToken;
  let testSweet;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sweet-shop-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Sweet.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', 10),
      is_admin: true,
    });

    // Create regular user
    regularUser = await User.create({
      name: 'Regular User',
      email: 'regular@example.com',
      password: await bcrypt.hash('password123', 10),
      is_admin: false,
    });

    // Generate tokens
    adminToken = jwt.sign(
      { userId: adminUser._id, email: adminUser.email },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );

    regularToken = jwt.sign(
      { userId: regularUser._id, email: regularUser.email },
      process.env.JWT_SECRET || 'your_jwt_secret'
    );

    // Create a test sweet
    testSweet = await Sweet.create({
      name: 'Chocolate Cake',
      description: 'Delicious chocolate cake',
      price: 150,
      quantity: 10,
      category: 'Cakes',
      image: '🍰',
      created_by: adminUser._id,
    });
  });

  describe('GET /api/sweets', () => {
    it('should fetch all sweets without authentication', async () => {
      const response = await request(app).get('/api/sweets');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Chocolate Cake');
    });

    it('should fetch sweets with pagination', async () => {
      // Create multiple sweets
      for (let i = 0; i < 10; i++) {
        await Sweet.create({
          name: `Sweet ${i}`,
          description: `Description ${i}`,
          price: 100 + i,
          quantity: 5,
          category: 'Cookies',
          image: '🍪',
          created_by: adminUser._id,
        });
      }

      const response = await request(app)
        .get('/api/sweets')
        .query({ skip: 0, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    it('should filter sweets by category', async () => {
      await Sweet.create({
        name: 'Cookies',
        description: 'Chocolate chips cookies',
        price: 50,
        quantity: 20,
        category: 'Cookies',
        image: '🍪',
        created_by: adminUser._id,
      });

      const response = await request(app)
        .get('/api/sweets')
        .query({ category: 'Cookies' });

      expect(response.status).toBe(200);
      expect(response.body.every(sweet => sweet.category === 'Cookies')).toBe(true);
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .query({ search: 'Chocolate' });

      expect(response.status).toBe(200);
      expect(response.body.some(sweet => sweet.name.includes('Chocolate'))).toBe(true);
    });
  });

  describe('POST /api/sweets', () => {
    it('should create sweet as admin user', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Vanilla Donut',
          description: 'Soft vanilla donut',
          price: 80,
          quantity: 15,
          category: 'Donuts',
          image: '🍩',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Vanilla Donut');
      expect(response.body.price).toBe(80);

      // Verify in database
      const sweet = await Sweet.findOne({ name: 'Vanilla Donut' });
      expect(sweet).toBeDefined();
    });

    it('should not allow regular user to create sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          name: 'Vanilla Donut',
          description: 'Soft vanilla donut',
          price: 80,
          quantity: 15,
          category: 'Donuts',
          image: '🍩',
        });

      expect(response.status).toBe(403);
    });

    it('should require authentication to create sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Vanilla Donut',
          description: 'Soft vanilla donut',
          price: 80,
          quantity: 15,
          category: 'Donuts',
          image: '🍩',
        });

      expect(response.status).toBe(401);
    });

    it('should require all fields to create sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Vanilla Donut',
          // Missing other required fields
        });

      expect(response.status).toBe(400);
    });

    it('should accept image_url with base64 encoded image', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Image Sweet',
          description: 'Sweet with base64 image',
          price: 100,
          quantity: 10,
          category: 'Cakes',
          image: '🎂',
          image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
        });

      expect(response.status).toBe(201);
      expect(response.body.image_url).toBeDefined();
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should update sweet as admin user', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Chocolate Cake',
          price: 200,
          quantity: 15,
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Chocolate Cake');
      expect(response.body.price).toBe(200);
    });

    it('should not allow regular user to update sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          price: 300,
        });

      expect(response.status).toBe(403);
    });

    it('should require authentication to update sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${testSweet._id}`)
        .send({
          price: 300,
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 300,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete sweet as admin user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verify deleted from database
      const sweet = await Sweet.findById(testSweet._id);
      expect(sweet).toBeNull();
    });

    it('should not allow regular user to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
    });

    it('should require authentication to delete sweet', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet._id}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 when deleting non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
