const mongoose = require("mongoose");

const partidaSchema = new mongoose.Schema({
  codigo: { type: String, unique: true, required: true },
  creador: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  colorCreador: { type: String, enum: ["blanco", "negro"], required: true },
  jugador1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  espectadores: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  invitados: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  estado: { type: String, enum: ["esperando", "jugando", "finalizada"], default: "esperando" },
  resultado: {
    ganador: { type: String, enum: ["blanco", "negro", null], default: null },
    razon: { type: String, enum: ["rendicion", "tiempo", "jaque_mate", null], default: null }
  },
  creadaEn: { type: Date, default: Date.now },
  tablero: {
    type: [[String]],
    default: [
      ["♜","♞","♝","♛","♚","♝","♞","♜"],
      ["♟","♟","♟","♟","♟","♟","♟","♟"],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["","","","","","","",""],
      ["♙","♙","♙","♙","♙","♙","♙","♙"],
      ["♖","♘","♗","♕","♔","♗","♘","♖"]
    ]
  },
  turno: { type: String, default: "white" },
  historialMovimientos: [{
    pieza: String,
    color: String,
    de: String,
    a: String
  }],
  piezasCapturadas: {
    blancas: [String],
    negras: [String]
  }
});

module.exports = mongoose.model("Partida", partidaSchema);
