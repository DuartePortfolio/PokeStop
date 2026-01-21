const encounterService = require('../services/encounterService');

// Spawn a new encounter
exports.spawn = async (req, res) => {
  try {
    const userId = req.user.id;
    const encounter = await encounterService.spawnEncounter(userId);
    res.status(201).json(encounter);
  } catch (err) {
    if (err.message === 'You already have an active encounter') {
      return res.status(400).json({ message: err.message });
    }
    console.error('Spawn error:', err);
    res.status(500).json({ message: 'Failed to spawn encounter' });
  }
};

// Get active encounter
exports.getActive = async (req, res) => {
  try {
    const userId = req.user.id;
    const encounter = await encounterService.getActiveEncounter(userId);
    
    if (!encounter) {
      return res.status(404).json({ message: 'No active encounter' });
    }
    
    res.json(encounter);
  } catch (err) {
    console.error('Get active error:', err);
    res.status(500).json({ message: 'Failed to get encounter' });
  }
};

// Attempt to catch
exports.attemptCatch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { encounterId, score } = req.body;
    
    if (!encounterId || score === undefined) {
      return res.status(400).json({ message: 'encounterId and score are required' });
    }
    
    const result = await encounterService.attemptCatch(userId, encounterId, score);
    res.json(result);
  } catch (err) {
    if (err.message.includes('No active encounter') || err.message.includes('No attempts')) {
      return res.status(400).json({ message: err.message });
    }
    console.error('Catch attempt error:', err);
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
      return res.status(400).json({ message: 'encounterId is required' });
    }
    
    const result = await encounterService.addToCollection(userId, encounterId, nickname, authToken);
    res.json(result);
  } catch (err) {
    if (err.message.includes('No caught Pokemon')) {
      return res.status(400).json({ message: err.message });
    }
    console.error('Add to collection error:', err);
    res.status(500).json({ message: 'Failed to add to collection' });
  }
};

// Skip/flee encounter
exports.skip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { encounterId } = req.body;
    
    if (!encounterId) {
      return res.status(400).json({ message: 'encounterId is required' });
    }
    
    const result = await encounterService.skipEncounter(userId, encounterId);
    res.json(result);
  } catch (err) {
    if (err.message.includes('No active encounter')) {
      return res.status(400).json({ message: err.message });
    }
    console.error('Skip error:', err);
    res.status(500).json({ message: 'Failed to skip encounter' });
  }
};

// Get encounter history
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const history = await encounterService.getEncounterHistory(userId, limit);
    res.json(history);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ message: 'Failed to get history' });
  }
};

// Get encounter stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await encounterService.getEncounterStats(userId);
    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Failed to get stats' });
  }
};
