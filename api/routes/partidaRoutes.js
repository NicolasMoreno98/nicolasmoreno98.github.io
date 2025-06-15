const express = require("express");
const router = express.Router();
const partidaController = require("../controllers/partidaController");
const verificarJWT = require("../middleware/verificarJWT");

// ✅ Definir rutas ANTES de exportar
router.post("/", verificarJWT, partidaController.crearPartida);

// puedes agregar más rutas aquí luego...

module.exports = router;

router.post("/unirse/:codigo", verificarJWT, partidaController.unirsePartida);
router.get("/:id", verificarJWT, partidaController.obtenerPartida);
