const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verificarJWT = require("../middleware/verificarJWT");

// Registro, login y logout
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Obtener perfil autenticado
router.get("/perfil", verificarJWT, async (req, res) => {
  try {
    const usuario = await require("../models/User")
      .findById(req.usuario.id)
      .select("-contraseña");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener el perfil" });
  }
});

router.get("/buscar/:nombreUsuario", async (req, res) => {
  try {
    const user = await require("../models/User").findOne({ nombreUsuario: req.params.nombreUsuario });
    if (!user) return res.status(404).json({ mensaje: "No encontrado" });
    res.json(user);
  } catch {
    res.status(500).json({ mensaje: "Error al buscar usuario" });
  }
});


module.exports = router;

