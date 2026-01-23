import express from 'express';
import * as encounterController from '../controllers/encounterController.js';
import { authenticateToken } from '../middleware/authenticator.js';
const router = express.Router();

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

export default router;
