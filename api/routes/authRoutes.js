const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verificarJWT = require("../middleware/verificarJWT");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

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

module.exports = router;

