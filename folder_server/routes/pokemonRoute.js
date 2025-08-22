const express = require('express');
const PokemonController = require('../controllers/pokemonController');
const router = express.Router();

router.get('/', PokemonController.getAll);
router.get('/:id', PokemonController.getById);

module.exports = router;
