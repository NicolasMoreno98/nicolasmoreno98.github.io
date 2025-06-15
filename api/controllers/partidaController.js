const Partida = require("../models/Partida");
const { v4: uuidv4 } = require("uuid");

exports.crearPartida = async (req, res) => {
  const usuarioId = req.usuario.id;
  const colorElegido = req.body.color;

  if (!["blanco", "negro"].includes(colorElegido)) {
    return res.status(400).json({ mensaje: "Color inválido." });
  }

  const codigo = uuidv4().slice(0, 8); // Código de invitación corto

  try {
    const nuevaPartida = new Partida({
      codigo,
      creador: usuarioId,
      colorCreador: colorElegido,
      jugador1: usuarioId,
      estado: "esperando",
    });

    await nuevaPartida.save();

    // ✅ ESTA ES LA LÍNEA CLAVE
    return res.status(201).json({ codigo: nuevaPartida.codigo });

  } catch (err) {
    console.error("❌ Error al crear partida:", err.message);
    return res.status(500).json({ mensaje: "Error interno al crear la partida." });
  }
};

exports.unirsePartida = async (req, res) => {
  const usuarioId = req.usuario.id;
  const { codigo } = req.params;

  try {
    const partida = await Partida.findOne({ codigo });

    if (!partida) {
      return res.status(404).json({ mensaje: "Partida no encontrada" });
    }

    // Si ya está en la partida
    if (
      [partida.jugador1?.toString(), partida.jugador2?.toString(), ...partida.espectadores.map(e => e.toString())]
      .includes(usuarioId)
    ) {
      return res.json({ mensaje: "Ya estás en esta partida", rol: "espectador", id: partida._id });
    }

    // Si puede ser jugador2
    if (!partida.jugador2) {
      partida.jugador2 = usuarioId;
      partida.estado = "en_juego";
      await partida.save();
      return res.json({ mensaje: "Unido como jugador", rol: "jugador", id: partida._id });
    }

    // Si no, entra como espectador
    if (!partida.espectadores.includes(usuarioId)) {
      partida.espectadores.push(usuarioId);
      await partida.save();
    }

    return res.json({ mensaje: "Unido como espectador", rol: "espectador", id: partida._id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al unirse a la partida" });
  }
};
exports.obtenerPartida = async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;

  try {
    const partida = await Partida.findById(id);

    if (!partida) {
      return res.status(404).json({ mensaje: "Partida no encontrada" });
    }

    // ¿Está autorizado a ver esta partida?
    const autorizado = [partida.jugador1, partida.jugador2, ...partida.espectadores]
      .map(id => id?.toString())
      .includes(usuarioId);

    if (!autorizado) {
      return res.status(403).json({ mensaje: "No tienes permiso para ver esta partida" });
    }

    // Determinar el rol
    let rol = "espectador";
    if (usuarioId === partida.jugador1.toString()) {
      rol = partida.colorCreador;
    } else if (usuarioId === partida.jugador2?.toString()) {
      rol = partida.colorCreador === "blanco" ? "negro" : "blanco";
    }

    res.json({
      id: partida._id,
      jugadores: {
        blancas: rol === "blanco" ? usuarioId : null,
        negras: rol === "negro" ? usuarioId : null
      },
      rol,
      fenInicial: "start" // O podrías cargar desde MongoDB si guardas FEN o movimientos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener la partida" });
  }
};


