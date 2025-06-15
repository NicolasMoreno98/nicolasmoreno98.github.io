const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "clave_super_secreta";
const JWT_EXPIRACION = "1d";


exports.register = async (req, res) => {
  const { nombreUsuario, correo, contraseña, fechaNacimiento } = req.body;

  if (!nombreUsuario || !correo || !contraseña || !fechaNacimiento) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
  }

  try {
    const existente = await User.findOne({ $or: [{ nombreUsuario }, { correo }] });
    if (existente) {
      return res.status(400).json({ mensaje: "Usuario o correo ya está en uso." });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new User({
      nombreUsuario,
      correo,
      contraseña: hash,
      fechaNacimiento
    });

    await nuevoUsuario.save();

    return res.status(201).json({ mensaje: "Usuario registrado correctamente." });
  } catch (err) {
    console.error("Error al registrar:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};


exports.login = (req, res) => {
  return res.status(200).json({ mensaje: "Login simulado" });
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ mensaje: "Sesión cerrada (simulada)" });
};
