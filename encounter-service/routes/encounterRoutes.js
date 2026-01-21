const express = require('express');
const router = express.Router();
const encounterController = require('../controllers/encounterController');
const { authenticateToken } = require('../middleware/authenticator');

// All routes require authentication
router.use(authenticateToken);

// Spawn new encounter
router.post('/spawn', encounterController.spawn);

// Get active encounter
router.get('/active', encounterController.getActive);

// Attempt to catch Pokemon
router.post('/catch', encounterController.attemptCatch);

// Add caught Pokemon to collection
router.post('/collect', encounterController.addToCollection);

// Skip/flee from encounter
router.post('/skip', encounterController.skip);

// Get encounter history
router.get('/history', encounterController.getHistory);

// Get encounter stats
router.get('/stats', encounterController.getStats);

module.exports = router;
