const mongoose = require("mongoose");

const partidaSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  colorCreador: { type: String, enum: ["blanco", "negro"], required: true },
  jugador1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  espectadores: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  invitados: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  estado: { type: String, enum: ["esperando", "en_juego", "finalizada"], default: "esperando" },
  creadaEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Partida", partidaSchema);
