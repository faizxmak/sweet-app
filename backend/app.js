// Step 1: Backend project initialized with npm
// Step 2: Install dependencies: express, pg, dotenv, bcryptjs, jsonwebtoken, nodemon
// Step 3: Modular structure created
// Step 4: .env for secrets
// Step 5: DB connection setup
// Step 6: SQL schema for users and sweets
// Step 7: Auth controller/routes
// Step 8: Sweets controller/routes
// Step 9: JWT middleware
// Step 10: Test endpoints
// Step 11: API documentation

// This file will be the main entry point for the backend server
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const sweetsRoutes = require('./routes/sweetsRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
