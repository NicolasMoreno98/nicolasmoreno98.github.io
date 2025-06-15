const jwt = require("jsonwebtoken");

const JWT_SECRET = "clave_super_secreta"; // usa la misma clave que en tu authController

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.usuario = { id: verificado.id }; // guardar el ID del usuario en la request
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};
