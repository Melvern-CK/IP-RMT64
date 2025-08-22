const express = require('express');
const GeminiController = require('../controllers/geminiController');
const auth = require('../middlewares/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// POST /ai/recommend - Get team recommendations
router.post('/recommend', GeminiController.getTeamRecommendation);

// POST /ai/analyze/:teamId - Analyze existing team
router.post('/analyze/:teamId', GeminiController.analyzeTeam);

module.exports = router;
