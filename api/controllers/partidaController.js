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
  try {
    const { codigo } = req.params;  // Cambiado de req.body a req.params
    const usuarioId = req.usuario.id;

    // Buscar la partida por código
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    // Si es el creador/jugador1
    if (String(partida.jugador1) === String(usuarioId)) {
      return res.json({ 
        mensaje: "Eres el jugador 1", 
        rol: "jugador1", 
        color: partida.colorCreador 
      });
    }

    // Si es el jugador2 existente
    if (partida.jugador2 && String(partida.jugador2) === String(usuarioId)) {
      const colorJugador2 = partida.colorCreador === "blanco" ? "negro" : "blanco";
      return res.json({ 
        mensaje: "Eres el jugador 2", 
        rol: "jugador2", 
        color: colorJugador2 
      });
    }

    // Si el jugador2 está libre, asignar este usuario
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

    // Si ya hay dos jugadores, unir como espectador
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
    const { nuevaPosicion, historial, turno, timers, piezasCapturadas } = req.body;
    const partida = await Partida.findOne({ codigo });
    if (!partida) return res.status(404).json({ mensaje: "Partida no encontrada" });

    // Actualiza todos los datos de la partida
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

    // Verificar si el usuario es uno de los jugadores
    const esJugador1 = String(partida.jugador1) === String(usuarioId);
    const esJugador2 = String(partida.jugador2) === String(usuarioId);

    if (!esJugador1 && !esJugador2) {
      return res.status(403).json({ mensaje: "No eres jugador de esta partida" });
    }

    // Determinar el color del jugador que se rinde
    const miColor = esJugador1 ? 
      (partida.colorCreador === "blanco" ? "blanco" : "negro") :
      (partida.colorCreador === "blanco" ? "negro" : "blanco");

    // El ganador es el color opuesto
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


