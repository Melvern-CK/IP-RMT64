const express = require('express');
const TeamController = require('../controllers/teamController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.use(auth);

router.post('/', TeamController.create);
router.get('/', TeamController.list);
router.get('/:id', TeamController.getById);
router.put('/:id', TeamController.update);
router.delete('/:id', TeamController.delete);
router.post('/:id/pokemon', TeamController.addPokemon);
router.delete('/:id/pokemon/:pokemonId', TeamController.removePokemon);
router.patch('/:teamId/pokemon/:pokemonId', TeamController.editPokemonDetails);

module.exports = router;
