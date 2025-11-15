// Step 8: Sweets routes
const express = require('express');
const router = express.Router();
const sweetsController = require('../controllers/sweetsController');
const auth = require('../middleware/auth');

router.get('/', sweetsController.getSweets);
router.post('/', auth, sweetsController.createSweet);
router.put('/:id', auth, sweetsController.updateSweet);
router.delete('/:id', auth, sweetsController.deleteSweet);

module.exports = router;
