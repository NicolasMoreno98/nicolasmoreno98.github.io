const express = require('express');
const router = express.Router();
const partidaController = require('../controllers/partidaController');
const auth = require('../middleware/auth');

router.post("/:codigo/mover", auth, partidaController.moverPieza);
router.post("/:codigo/rendirse", auth, partidaController.rendirse);

module.exports = router;