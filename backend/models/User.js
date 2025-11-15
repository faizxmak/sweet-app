// User model for MongoDB
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  adminCode: { type: String, default: null },
  adminCodeExpiry: { type: Date, default: null },
});

module.exports = mongoose.model('User', userSchema);
