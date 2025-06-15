const express = require("express");
const router = express.Router();
const partidaController = require("../controllers/partidaController");
const verificarJWT = require("../middleware/verificarJWT");

// Rutas que requieren autenticación
router.use(verificarJWT);

// Rutas para gestión de partidas
router.get("/", partidaController.listarPartidasUsuario); // Listar partidas del usuario
router.post("/", partidaController.crearPartida); // Crear nueva partida
router.get("/:codigo", partidaController.obtenerPartida); // Obtener una partida específica
router.delete("/:codigo", partidaController.eliminarPartida); // Eliminar una partida

// Rutas para acciones en una partida
router.post("/:codigo/unirse", partidaController.unirsePartida); // Unirse a una partida
router.post("/:codigo/rendirse", partidaController.rendirse); // Rendirse en una partida
router.post("/:codigo/mover", partidaController.moverPieza); // Hacer un movimiento

module.exports = router;