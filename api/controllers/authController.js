const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "clave_super_secreta";
const JWT_EXPIRACION = "1d";

// Registrar nuevo usuario
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

// Iniciar sesión
exports.login = async (req, res) => {
  const { nombreUsuario, contraseña } = req.body;

  if (!nombreUsuario || !contraseña) {
    return res.status(400).json({ mensaje: "Faltan credenciales." });
  }

  try {
    const usuario = await User.findOne({ nombreUsuario });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Usuario no encontrado." });
    }

    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta." });
    }

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRACION
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax",       // ← Ideal para Live Server
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ mensaje: "Inicio de sesión exitoso." });
  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// Cerrar sesión
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ mensaje: "Sesión cerrada." });
};

