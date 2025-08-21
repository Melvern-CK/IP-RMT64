const express = require('express');
const router = express.Router();
const { Move } = require('../models');
const { Op } = require('sequelize');

// GET /api/moves/:name - Get move details by name
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Try multiple name variations to match database entries
    const nameVariations = [
      name,                                    // exact as received
      name.replace(/-/g, ' '),                // replace hyphens with spaces
      name.replace(/ /g, '-'),                // replace spaces with hyphens
      name.toLowerCase(),                      // lowercase
      name.toLowerCase().replace(/-/g, ' '),   // lowercase with spaces
      name.toLowerCase().replace(/ /g, '-'),   // lowercase with hyphens
    ];
    
    console.log(`Searching for move: ${name}, variations:`, nameVariations);
    
    // Search for move by trying all name variations
    let move = null;
    for (const variation of nameVariations) {
      move = await Move.findOne({
        where: {
          name: {
            [Op.iLike]: variation
          }
        }
      });
      
      if (move) {
        console.log(`Found move with variation: "${variation}"`);
        break;
      }
    }
    
    if (!move) {
      console.log(`Move not found for any variation of: ${name}`);
      return res.status(404).json({ error: 'Move not found' });
    }
    
    // Return move with correct field mapping
    // Your DB: type = category (physical/special/status), moveType = elemental type (fire/water/etc)
    // Frontend expects: type = elemental type, category = move category
    res.json({
      name: move.name,
      type: move.moveType,        // elemental type (fire, water, etc.)
      category: move.type,        // move category (physical, special, status)
      power: move.power,          // move power
      accuracy: move.accuracy,    // move accuracy
      pp: move.pp,               // power points (if you have this field)
      description: move.description // move description (if you have this field)
    });
    
  } catch (error) {
    console.error('Error fetching move:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
