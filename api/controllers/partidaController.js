const Partida = require('../models/Partida');
const { v4: uuidv4 } = require("uuid");

exports.crearPartida = async (req, res) => {
  try {
    const { color } = req.body;
    if (!color || !["blanco", "negro"].includes(color)) {
      return res.status(400).json({ mensaje: "Color inválido" });
    }

    const codigo = Math.random().toString(16).slice(2, 10);

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

    return res.status(201).json({ codigo: nuevaPartida.codigo });
  } catch (err) {
    console.error("Error al crear partida:", err);
    res.status(500).json({ mensaje: "Error interno al crear partida" });
  }
};

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

exports.unirsePartida = async (req, res) => {
  try {
    const { codigo } = req.params;
    const usuarioId = req.usuario.id;

    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    if (String(partida.jugador1) === String(usuarioId)) {
      return res.json({ 
        mensaje: "Eres el jugador 1", 
        rol: "jugador1", 
        color: partida.colorCreador 
      });
    }

    if (partida.jugador2 && String(partida.jugador2) === String(usuarioId)) {
      const colorJugador2 = partida.colorCreador === "blanco" ? "negro" : "blanco";
      return res.json({ 
        mensaje: "Eres el jugador 2", 
        rol: "jugador2", 
        color: colorJugador2 
      });
    }

    if (!partida.jugador2) {
      partida.jugador2 = usuarioId;
      partida.estado = "jugando";
      await partida.save();
      
      const colorJugador2 = partida.colorCreador === "blanco" ? "negro" : "blanco";
      return res.json({ 
        mensaje: "Te has unido como jugador 2", 
        rol: "jugador2", 
        color: colorJugador2 
      });
    }

    if (!partida.espectadores.includes(usuarioId)) {
      partida.espectadores.push(usuarioId);
      await partida.save();
    }

    return res.json({ 
      mensaje: "Te has unido como espectador", 
      rol: "espectador" 
    });
  } catch (err) {
    console.error("Error al unirse a la partida:", err);
    res.status(500).json({ mensaje: "Error al unirse a la partida" });
  }
};

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
    const { nuevaPosicion, historial, turno, timers, piezasCapturadas } = req.body;
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    partida.tablero = nuevaPosicion;
    partida.historialMovimientos = historial;
    partida.turno = turno;
    partida.timers = timers;
    partida.piezasCapturadas = piezasCapturadas;

    await partida.save();
    res.json({ 
      mensaje: "Movimiento guardado", 
      partida: {
        tablero: partida.tablero,
        turno: partida.turno,
        historialMovimientos: partida.historialMovimientos,
        piezasCapturadas: partida.piezasCapturadas,
        timers: partida.timers
      }
    });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al mover pieza" });
  }
};

exports.rendirse = async (req, res) => {
  try {
    const { codigo } = req.params;
    const usuarioId = req.usuario.id;
    const partida = await Partida.findOne({ codigo });
    
    if (!partida) {
      return res.status(404).json({ mensaje: "Partida no encontrada" });
    }

    const esJugador1 = String(partida.jugador1) === String(usuarioId);
    const esJugador2 = String(partida.jugador2) === String(usuarioId);

    if (!esJugador1 && !esJugador2) {
      return res.status(403).json({ mensaje: "No eres jugador de esta partida" });
    }

    const miColor = esJugador1 ? 
      (partida.colorCreador === "blanco" ? "blanco" : "negro") :
      (partida.colorCreador === "blanco" ? "negro" : "blanco");

    const colorGanador = miColor === "blanco" ? "negro" : "blanco";

    partida.estado = "finalizada";
    partida.resultado = {
      ganador: colorGanador,
      razon: "rendicion"
    };

    await partida.save();
    res.json({ 
      mensaje: "Rendición procesada",
      resultado: partida.resultado
    });

  } catch (err) {
    console.error("Error al procesar rendición:", err);
    res.status(500).json({ mensaje: "Error al procesar rendición" });
  }
};


