const express = require("express");
const router = express.Router();
const partidaController = require("../controllers/partidaController");
const verificarJWT = require("../middleware/verificarJWT");


router.post("/", verificarJWT, partidaController.crearPartida);

router.post('/partidas/:codigo/mover', verificarJWT, partidaController.moverPieza);

router.post("/:codigo/unirse", verificarJWT, partidaController.unirsePartida);
router.post("/:codigo/rendirse", verificarJWT, partidaController.rendirse);
router.post("/:codigo/mover", verificarJWT, partidaController.moverPieza);
router.get('/:codigo', verificarJWT, partidaController.obtenerPartida);

module.exports = router;