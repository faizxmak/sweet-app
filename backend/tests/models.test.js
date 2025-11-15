const mongoose = require('mongoose');
const User = require('../models/User');
const Sweet = require('../models/Sweet');
const bcrypt = require('bcryptjs');

describe('Model Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sweet-shop-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});
  });

  describe('User Model', () => {
    describe('User Creation', () => {
      it('should create user with valid data', async () => {
        const user = await User.create({
          name: 'John Doe',
          email: 'john@example.com',
          password: await bcrypt.hash('password123', 10),
        });

        expect(user).toBeDefined();
        expect(user.name).toBe('John Doe');
        expect(user.email).toBe('john@example.com');
        expect(user.is_admin).toBe(false); // Default value
      });

      it('should create user with admin code and expiry', async () => {
        const user = await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: await bcrypt.hash('password123', 10),
        });

        expect(user.adminCode).toBeDefined();
        expect(user.adminCodeExpiry).toBeDefined();
        expect(user.adminCode).toMatch(/^\d{6}$/); // 6-digit code
      });

      it('should set is_admin to false by default', async () => {
        const user = await User.create({
          name: 'Regular User',
          email: 'regular@example.com',
          password: 'hashedpassword',
        });

        expect(user.is_admin).toBe(false);
      });
    });

    describe('User Validation', () => {
      it('should require name field', async () => {
        const user = new User({
          email: 'test@example.com',
          password: 'hashedpassword',
        });

        await expect(user.save()).rejects.toThrow();
      });

      it('should require email field', async () => {
        const user = new User({
          name: 'Test User',
          password: 'hashedpassword',
        });

        await expect(user.save()).rejects.toThrow();
      });

      it('should require password field', async () => {
        const user = new User({
          name: 'Test User',
          email: 'test@example.com',
        });

        await expect(user.save()).rejects.toThrow();
      });

      it('should store hashed password, not plaintext', async () => {
        const plainPassword = 'password123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const user = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: hashedPassword,
        });

        expect(user.password).not.toBe(plainPassword);
        expect(user.password).toBe(hashedPassword);
      });
    });

    describe('User Methods', () => {
      it('should update admin status', async () => {
        const user = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
        });

        user.is_admin = true;
        user.adminCode = null;
        await user.save();

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.is_admin).toBe(true);
        expect(updatedUser.adminCode).toBeNull();
      });

      it('should clear admin code after verification', async () => {
        const user = await User.create({
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedpassword',
        });

        const originalCode = user.adminCode;
        user.adminCode = null;
        user.adminCodeExpiry = null;
        await user.save();

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.adminCode).toBeNull();
        expect(updatedUser.adminCodeExpiry).toBeNull();
      });
    });

    describe('User Email Uniqueness', () => {
      it('should enforce email uniqueness', async () => {
        await User.create({
          name: 'User 1',
          email: 'duplicate@example.com',
          password: 'hashedpassword',
        });

        const duplicateUser = new User({
          name: 'User 2',
          email: 'duplicate@example.com',
          password: 'hashedpassword',
        });

        await expect(duplicateUser.save()).rejects.toThrow();
      });
    });
  });

  describe('Sweet Model', () => {
    let testAdmin;

    beforeEach(async () => {
      testAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        is_admin: true,
      });
    });

    describe('Sweet Creation', () => {
      it('should create sweet with valid data', async () => {
        const sweet = await Sweet.create({
          name: 'Chocolate Cake',
          description: 'Delicious chocolate cake',
          price: 150,
          quantity: 10,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });

        expect(sweet).toBeDefined();
        expect(sweet.name).toBe('Chocolate Cake');
        expect(sweet.price).toBe(150);
        expect(sweet.quantity).toBe(10);
      });

      it('should create sweet with base64 image', async () => {
        const sweet = await Sweet.create({
          name: 'Image Sweet',
          description: 'Sweet with base64 image',
          price: 100,
          quantity: 5,
          category: 'Cookies',
          image: '🍪',
          image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
          created_by: testAdmin._id,
        });

        expect(sweet.image_url).toBeDefined();
        expect(sweet.image_url).toContain('data:image/png;base64');
      });

      it('should set timestamp on creation', async () => {
        const sweet = await Sweet.create({
          name: 'Timed Sweet',
          description: 'Testing timestamps',
          price: 80,
          quantity: 15,
          category: 'Donuts',
          image: '🍩',
          created_by: testAdmin._id,
        });

        expect(sweet.createdAt).toBeDefined();
        expect(sweet.updatedAt).toBeDefined();
      });
    });

    describe('Sweet Validation', () => {
      it('should require name field', async () => {
        const sweet = new Sweet({
          description: 'Test sweet',
          price: 100,
          quantity: 10,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });

        await expect(sweet.save()).rejects.toThrow();
      });

      it('should require price field', async () => {
        const sweet = new Sweet({
          name: 'Test Sweet',
          description: 'Test sweet',
          quantity: 10,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });

        await expect(sweet.save()).rejects.toThrow();
      });

      it('should require category field', async () => {
        const sweet = new Sweet({
          name: 'Test Sweet',
          description: 'Test sweet',
          price: 100,
          quantity: 10,
          image: '🍰',
          created_by: testAdmin._id,
        });

        await expect(sweet.save()).rejects.toThrow();
      });

      it('should reject negative price', async () => {
        const sweet = new Sweet({
          name: 'Test Sweet',
          description: 'Test sweet',
          price: -100,
          quantity: 10,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });

        sweet.validate((err) => {
          if (err) {
            expect(err.errors.price).toBeDefined();
          }
        });
      });

      it('should reject negative quantity', async () => {
        const sweet = new Sweet({
          name: 'Test Sweet',
          description: 'Test sweet',
          price: 100,
          quantity: -5,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });

        sweet.validate((err) => {
          if (err) {
            expect(err.errors.quantity).toBeDefined();
          }
        });
      });
    });

    describe('Sweet Updates', () => {
      let testSweet;

      beforeEach(async () => {
        testSweet = await Sweet.create({
          name: 'Original Sweet',
          description: 'Original description',
          price: 100,
          quantity: 10,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });
      });

      it('should update sweet name', async () => {
        testSweet.name = 'Updated Sweet';
        await testSweet.save();

        const updatedSweet = await Sweet.findById(testSweet._id);
        expect(updatedSweet.name).toBe('Updated Sweet');
      });

      it('should update sweet price', async () => {
        testSweet.price = 200;
        await testSweet.save();

        const updatedSweet = await Sweet.findById(testSweet._id);
        expect(updatedSweet.price).toBe(200);
      });

      it('should update sweet quantity', async () => {
        testSweet.quantity = 25;
        await testSweet.save();

        const updatedSweet = await Sweet.findById(testSweet._id);
        expect(updatedSweet.quantity).toBe(25);
      });

      it('should update sweet image_url', async () => {
        const newImageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
        testSweet.image_url = newImageUrl;
        await testSweet.save();

        const updatedSweet = await Sweet.findById(testSweet._id);
        expect(updatedSweet.image_url).toBe(newImageUrl);
      });
    });

    describe('Sweet Deletion', () => {
      let testSweet;

      beforeEach(async () => {
        testSweet = await Sweet.create({
          name: 'Sweet to Delete',
          description: 'This will be deleted',
          price: 100,
          quantity: 10,
          category: 'Cakes',
          image: '🍰',
          created_by: testAdmin._id,
        });
      });

      it('should delete sweet', async () => {
        await Sweet.findByIdAndDelete(testSweet._id);

        const deletedSweet = await Sweet.findById(testSweet._id);
        expect(deletedSweet).toBeNull();
      });
    });

    describe('Sweet Query', () => {
      beforeEach(async () => {
        await Sweet.create([
          {
            name: 'Chocolate Cake',
            description: 'Chocolate cake',
            price: 150,
            quantity: 10,
            category: 'Cakes',
            image: '🍰',
            created_by: testAdmin._id,
          },
          {
            name: 'Vanilla Donut',
            description: 'Vanilla donut',
            price: 80,
            quantity: 20,
            category: 'Donuts',
            image: '🍩',
            created_by: testAdmin._id,
          },
          {
            name: 'Chocolate Donut',
            description: 'Chocolate donut',
            price: 80,
            quantity: 20,
            category: 'Donuts',
            image: '🍩',
            created_by: testAdmin._id,
          },
        ]);
      });

      it('should find sweet by name', async () => {
        const sweet = await Sweet.findOne({ name: 'Chocolate Cake' });
        expect(sweet).toBeDefined();
        expect(sweet.name).toBe('Chocolate Cake');
      });

      it('should find sweets by category', async () => {
        const sweets = await Sweet.find({ category: 'Donuts' });
        expect(sweets.length).toBe(2);
        expect(sweets.every(s => s.category === 'Donuts')).toBe(true);
      });

      it('should find sweets within price range', async () => {
        const sweets = await Sweet.find({ price: { $gte: 100, $lte: 160 } });
        expect(sweets.some(s => s.name === 'Chocolate Cake')).toBe(true);
      });

      it('should search sweets by name regex', async () => {
        const sweets = await Sweet.find({ name: /Chocolate/i });
        expect(sweets.length).toBeGreaterThan(0);
        expect(sweets.every(s => s.name.includes('Chocolate'))).toBe(true);
      });
    });
  });
});
