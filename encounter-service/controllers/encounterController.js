import logger from "../utils/logger.js" 

const encounterService = require('../services/encounterService');

// Spawn a new encounter
exports.spawn = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Spawning encounter for user ${userId}`);
    const encounter = await encounterService.spawnEncounter(userId);
    logger.info(`Encounter spawned successfully for user ${userId}`);
    res.status(201).json(encounter);
  } catch (err) {
    if (err.message === 'You already have an active encounter') {
      logger.warn(`User ${req.user.id} already has active encounter`);
      return res.status(400).json({ message: err.message });
    }
    logger.error('Spawn error:', err);
    res.status(500).json({ message: 'Failed to spawn encounter' });
  }
};

// Get active encounter
exports.getActive = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching active encounter for user ${userId}`);
    const encounter = await encounterService.getActiveEncounter(userId);
    
    if (!encounter) {
      logger.info(`No active encounter found for user ${userId}`);
      return res.status(404).json({ message: 'No active encounter' });
    }
    
    logger.info(`Active encounter retrieved for user ${userId}`);
    res.json(encounter);
  } catch (err) {
    logger.error('Get active error:', err);
    res.status(500).json({ message: 'Failed to get encounter' });
  }
};

// Attempt to catch
exports.attemptCatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { encounterId, score } = req.body;
    
    if (!encounterId || score === undefined) {
      logger.warn(`Invalid catch attempt for user ${userId}: missing encounterId or score`);
      return res.status(400).json({ message: 'encounterId and score are required' });
    }
    
    logger.info(`Catch attempt by user ${userId} for encounter ${encounterId} with score ${score}`);
    const result = await encounterService.attemptCatch(userId, encounterId, score);
    logger.info(`Catch attempt processed successfully for user ${userId}`);
    res.json(result);
  } catch (err) {
    if (err.message.includes('No active encounter') || err.message.includes('No attempts')) {
      logger.warn(`Catch attempt failed for user ${userId}: ${err.message}`);
      return res.status(400).json({ message: err.message });
    }
    logger.error('Catch attempt error:', err);
    res.status(500).json({ message: 'Failed to process catch attempt' });
  }
};

// Add caught Pokemon to collection
exports.addToCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { encounterId, nickname } = req.body;
    const authToken = req.headers['authorization']?.split(' ')[1];
    
    if (!encounterId) {
      logger.warn(`Add to collection failed for user ${userId}: missing encounterId`);
      return res.status(400).json({ message: 'encounterId is required' });
    }
    
    logger.info(`Adding Pokemon to collection for user ${userId}, encounter ${encounterId}, nickname ${nickname}`);
    const result = await encounterService.addToCollection(userId, encounterId, nickname, authToken);
    logger.info(`Pokemon added to collection for user ${userId}`);
    res.json(result);
  } catch (err) {
    if (err.message.includes('No caught Pokemon')) {
      logger.warn(`Add to collection failed for user ${userId}: ${err.message}`);
      return res.status(400).json({ message: err.message });
    }
    logger.error('Add to collection error:', err);
    res.status(500).json({ message: 'Failed to add to collection' });
  }
};

// Skip/flee encounter
exports.skip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { encounterId } = req.body;
    
    if (!encounterId) {
      logger.warn(`Skip encounter failed for user ${userId}: missing encounterId`);
      return res.status(400).json({ message: 'encounterId is required' });
    }
    
    logger.info(`User ${userId} skipping encounter ${encounterId}`);
    const result = await encounterService.skipEncounter(userId, encounterId);
    logger.info(`Encounter skipped for user ${userId}`);
    res.json(result);
  } catch (err) {
    if (err.message.includes('No active encounter')) {
      logger.warn(`Skip encounter failed for user ${userId}: ${err.message}`);
      return res.status(400).json({ message: err.message });
    }
    logger.error('Skip error:', err);
    res.status(500).json({ message: 'Failed to skip encounter' });
  }
};

// Get encounter history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    logger.info(`Fetching encounter history for user ${userId}, limit ${limit}`);
    const history = await encounterService.getEncounterHistory(userId, limit);
    logger.info(`Encounter history retrieved for user ${userId}`);
    res.json(history);
  } catch (err) {
    logger.error('History error:', err);
    res.status(500).json({ message: 'Failed to get history' });
  }
};

// Get encounter stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching encounter stats for user ${userId}`);
    const stats = await encounterService.getEncounterStats(userId);
    logger.info(`Encounter stats retrieved for user ${userId}`);
    res.json(stats);
  } catch (err) {
    logger.error('Stats error:', err);
    res.status(500).json({ message: 'Failed to get stats' });
  }
};
