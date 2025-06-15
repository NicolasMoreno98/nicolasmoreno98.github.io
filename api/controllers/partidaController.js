const Partida = require('../models/Partida');
const { v4: uuidv4 } = require("uuid");

// Crear nueva partida
exports.crearPartida = async (req, res) => {
  try {
    const { color } = req.body;
    if (!color || !["blanco", "negro"].includes(color)) {
      return res.status(400).json({ mensaje: "Color inválido" });
    }

    // El usuario debe estar autenticado (req.usuario.id)
    const codigo = Math.random().toString(16).slice(2, 10); // 8 caracteres únicos

    const nuevaPartida = new Partida({
      codigo,
      creador: req.usuario.id,
      colorCreador: color,
      jugador1: req.usuario.id,
      jugador2: null,
      espectadores: [],
      invitados: [],
      estado: "esperando",
      creadaEn: new Date()
    });

    await nuevaPartida.save();

    // Devuelve el código al frontend
    return res.status(201).json({ codigo: nuevaPartida.codigo });
  } catch (err) {
    console.error("Error al crear partida:", err);
    res.status(500).json({ mensaje: "Error interno al crear partida" });
  }
};

// Obtener partida por código (NO por _id)
exports.obtenerPartida = async (req, res) => {
  try {
    const codigo = req.params.codigo;
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada." });
    res.json(partida);
  } catch (err) {
    res.status(500).json({ mensaje: "Error al buscar partida." });
  }
};

// Unirse a una partida
exports.unirsePartida = async (req, res) => {
    const { codigo } = req.body;
    const usuarioId = req.usuario.id; // el ID del usuario autenticado

    // Busca la partida por código
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    // Si es el creador, no hacer nada extra
    if (partida.creador.equals(usuarioId)) {
        return res.json({ mensaje: "Eres el creador", rol: "jugador1", color: partida.colorCreador });
    }

    // Si jugador2 está libre, asignar este usuario
    if (!partida.jugador2) {
        partida.jugador2 = usuarioId;
        await partida.save();
        // Color opuesto al creador
        const color = partida.colorCreador === "blanco" ? "negro" : "blanco";
        return res.json({ mensaje: "Unido como jugador2", rol: "jugador2", color });
    }

    // Si ya hay dos jugadores, agregar como espectador
    if (!partida.espectadores.includes(usuarioId)) {
        partida.espectadores.push(usuarioId);
        await partida.save();
    }
    return res.json({ mensaje: "Unido como espectador", rol: "espectador" });
};

// Eliminar partida (solo el creador)
exports.eliminarPartida = async (req, res) => {
  try {
    const { codigo } = req.params;
    const userId = req.usuario.id;
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    if (String(partida.creador) !== String(userId)) {
      return res.status(403).json({ mensaje: "No tienes permisos para eliminar la partida" });
    }

    await partida.deleteOne();
    res.json({ mensaje: "Partida eliminada" });
  } catch (err) {
    console.error("Error al eliminar partida:", err);
    res.status(500).json({ mensaje: "Error interno al eliminar partida" });
  }
};

// Listar partidas en las que participa o es espectador
exports.listarPartidasUsuario = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const partidas = await Partida.find({
      $or: [
        { creador: userId },
        { jugador1: userId },
        { jugador2: userId },
        { espectadores: userId }
      ]
    });
    res.json(partidas);
  } catch (err) {
    console.error("Error al listar partidas:", err);
    res.status(500).json({ mensaje: "Error interno al listar partidas" });
  }
};


exports.moverPieza = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { nuevaPosicion, historial, turno, timers } = req.body;
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    // Actualiza el tablero, historial y turno
    partida.tablero = nuevaPosicion;
    partida.historial = historial;
    partida.turno = turno;
    partida.timers = timers;

    await partida.save();
    res.json({ mensaje: "Movimiento guardado", partida });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al mover pieza" });
  }
};


