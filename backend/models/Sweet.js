// Sweet model for MongoDB
const mongoose = require('mongoose');

const sweetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 10 },
  category: String,
  image: { type: String, default: '🍬' }, // emoji or URL
  image_url: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Sweet', sweetSchema);
