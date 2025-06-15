const express = require("express");
const router = express.Router();
const partidaController = require("../controllers/partidaController");
const verificarJWT = require("../middleware/verificarJWT");

router.use(verificarJWT);

router.get("/", partidaController.listarPartidasUsuario);
router.post("/", partidaController.crearPartida);
router.get("/:codigo", partidaController.obtenerPartida);
router.delete("/:codigo", partidaController.eliminarPartida);

router.post("/:codigo/unirse", partidaController.unirsePartida);
router.post("/:codigo/rendirse", partidaController.rendirse);
router.post("/:codigo/mover", partidaController.moverPieza);

module.exports = router;