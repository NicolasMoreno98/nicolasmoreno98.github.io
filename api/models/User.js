const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: true,
    unique: true
  },
  correo: {
    type: String,
    required: true,
    unique: true
  },
  contraseña: {
    type: String,
    required: true
  },
  fechaNacimiento: {
    type: String, // o type: Date si prefieres
    required: true
  }
});

module.exports = mongoose.model("User", userSchema);

