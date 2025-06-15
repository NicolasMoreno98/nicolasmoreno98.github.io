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
  turno: { type: String, default: "white" }
});

module.exports = mongoose.model("Partida", partidaSchema);
