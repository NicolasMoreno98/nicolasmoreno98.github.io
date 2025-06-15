const express = require("express");
const router = express.Router();
const partidaController = require("../controllers/partidaController");
const verificarJWT = require("../middleware/verificarJWT");


router.post("/", verificarJWT, partidaController.crearPartida);

router.post('/partidas/:codigo/mover', verificarJWT, partidaController.moverPieza);


module.exports = router;

router.post("/:codigo/mover", verificarJWT, partidaController.moverPieza);
router.get('/:codigo', verificarJWT, partidaController.obtenerPartida);
