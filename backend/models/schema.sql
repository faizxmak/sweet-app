// Step 6: SQL schema for users and sweets tables
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Sweets Table
CREATE TABLE IF NOT EXISTS sweets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  created_by INTEGER REFERENCES users(id)
);
