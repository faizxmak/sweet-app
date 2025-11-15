// Step 8: Sweets controller for CRUD
const Sweet = require('../models/Sweet');

exports.getSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find();
    res.json(sweets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSweet = async (req, res) => {
  const { name, description, price, quantity, category, image, image_url, created_by } = req.body;
  try {
    const sweet = new Sweet({ 
      name, 
      description, 
      price, 
      quantity: quantity || 10,
      category, 
      image: image || '🍬',
      image_url, 
      created_by 
    });
    await sweet.save();
    res.status(201).json(sweet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateSweet = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, category, image, image_url } = req.body;
  try {
    const sweet = await Sweet.findByIdAndUpdate(
      id, 
      { name, description, price, quantity, category, image, image_url }, 
      { new: true }
    );
    res.json(sweet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSweet = async (req, res) => {
  const { id } = req.params;
  try {
    await Sweet.findByIdAndDelete(id);
    res.json({ message: 'Sweet deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
