const express = require('express');
const router = express.Router();
const torreService = require('../services/torreService');

/**
 * Search for people using Torre API
 * POST /api/torre/search
 */
router.post('/search', async (req, res) => {
  try {
    const { query, filters, offset, limit } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const options = {
      offset: offset || 0,
      limit: Math.min(limit || 20, 50), // Cap at 50 for performance
      filters: filters || {}
    };

    const results = await torreService.searchPeople(query, options);
    
    res.json({
      success: true,
      query,
      results,
      total: results.length,
      offset: options.offset,
      limit: options.limit
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to search people',
      message: error.message 
    });
  }
});

/**
 * Get user genome information
 * GET /api/torre/genome/:username
 */
router.get('/genome/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const genome = await torreService.getUserGenome(username);
    
    res.json({
      success: true,
      username,
      genome
    });
  } catch (error) {
    console.error('Genome fetch error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to fetch user genome',
      message: error.message 
    });
  }
});

/**
 * Get analyzed user profile
 * GET /api/torre/profile/:username
 */
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const analysis = await torreService.analyzeUserProfile(username);
    
    res.json({
      success: true,
      username,
      analysis
    });
  } catch (error) {
    console.error('Profile analysis error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to analyze user profile',
      message: error.message 
    });
  }
});

module.exports = router;