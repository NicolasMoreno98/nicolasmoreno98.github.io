let tableroContainer = document.getElementById('tablero-ajedrez');
let zonaTurnoTiempo = document.getElementById('zona-turno-tiempo');
let zonaHistorial = document.getElementById('zona-historial');
let board = document.createElement('div');
board.style.display = 'grid';
board.style.gridTemplateColumns = 'repeat(9, 60px)';
board.style.gridTemplateRows = 'repeat(9, 60px)';
board.style.width = '540px';
board.style.height = '540px';
board.style.border = '2px solid #b5b5b5';
board.style.margin = '20px auto';
board.style.background = '#242424';
board.style.borderRadius = '10px';
tableroContainer.innerHTML = '';
tableroContainer.appendChild(board);
const urlParams = new URLSearchParams(window.location.search);
const codigoPartida = urlParams.get('partida');

let usuarioActual = null;
let miColor = null;

async function cargarDatosUsuarioYPartida() {
  const res = await fetch(`${API_BASE}/api/auth/perfil`, { credentials: "include" });
  usuarioActual = await res.json();

  const urlParams = new URLSearchParams(window.location.search);
  const codigoPartida = urlParams.get('partida');
  const resPartida = await fetch(`${API_BASE}/api/partidas/${codigoPartida}`, { credentials: "include" });
  const partida = await resPartida.json();

  if (String(usuarioActual._id) === String(partida.jugador1)) {
    miColor = partida.colorCreador === "blanco" ? "Blanco" : "Negro";
  } else if (String(usuarioActual._id) === String(partida.jugador2)) {
    miColor = partida.colorCreador === "blanco" ? "Negro" : "Blanco";
  } else if (!partida.jugador2) {
    miColor = partida.colorCreador === "blanco" ? "Negro" : "Blanco";
    await fetch(`${API_BASE}/api/partidas/${codigoPartida}/unirse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
  } else {
    miColor = "espectador";
  }
  alert("Tu color en esta partida es: " + miColor);

  if (miColor === "Blanco") miColor = "white";
  else if (miColor === "Negro") miColor = "black";
}


let initialPosition = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];
let files = ['a','b','c','d','e','f','g','h'];
let ranks = ['8','7','6','5','4','3','2','1'];
let dragSource = null;
let turn = 'white';
let timers = { white: 300, black: 300 };
let timerInterval = null;
let moveHistory = [];
let capturedWhite = [];
let capturedBlack = [];

function isWhite(piece) {
  return ['♙','♖','♘','♗','♕','♔'].includes(piece);
}
function isBlack(piece) {
  return ['♟','♜','♞','♝','♛','♚'].includes(piece);
}

function isLegalMove(piece, from, to) {
  if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) return false;
  if (from.row === to.row && from.col === to.col) return false;
  var dr = to.row - from.row;
  var dc = to.col - from.col;
  var absDr = Math.abs(dr);
  var absDc = Math.abs(dc);
  var target = initialPosition[to.row][to.col];
  if ((isWhite(piece) && isWhite(target)) || (isBlack(piece) && isBlack(target))) return false;
  if (isWhite(piece)) {
    if (piece == '♙') {
      if (dc == 0 && dr == -1 && !target) return true;
      if (dc == 0 && dr == -2 && from.row == 6 && !target && !initialPosition[5][from.col]) return true;
      if (absDc == 1 && dr == -1 && target && isBlack(target)) return true;
      return false;
    }
    if (piece == '♖') {
      if (dr == 0 && dc != 0) {
        var step = dc > 0 ? 1 : -1;
        for (var c = from.col + step; c != to.col; c += step) {
          if (initialPosition[from.row][c]) return false;
        }
        return true;
      }
      if (dc == 0 && dr != 0) {
        var step2 = dr > 0 ? 1 : -1;
        for (var r = from.row + step2; r != to.row; r += step2) {
          if (initialPosition[r][from.col]) return false;
        }
        return true;
      }
      return false;
    }
    if (piece == '♘') {
      if ((absDr == 2 && absDc == 1) || (absDr == 1 && absDc == 2)) return true;
      return false;
    }
    if (piece == '♗') {
      if (absDr == absDc && absDr != 0) {
        var stepR = dr > 0 ? 1 : -1;
        var stepC = dc > 0 ? 1 : -1;
        var r2 = from.row + stepR, c2 = from.col + stepC;
        while (r2 != to.row && c2 != to.col) {
          if (initialPosition[r2][c2]) return false;
          r2 += stepR; c2 += stepC;
        }
        return true;
      }
      return false;
    }
    if (piece == '♕') {
      if (absDr == absDc && absDr != 0) {
        var stepR2 = dr > 0 ? 1 : -1;
        var stepC2 = dc > 0 ? 1 : -1;
        var r3 = from.row + stepR2, c3 = from.col + stepC2;
        while (r3 != to.row && c3 != to.col) {
          if (initialPosition[r3][c3]) return false;
          r3 += stepR2; c3 += stepC2;
        }
        return true;
      }
      if (dr == 0 && dc != 0) {
        var step3 = dc > 0 ? 1 : -1;
        for (var c4 = from.col + step3; c4 != to.col; c4 += step3) {
          if (initialPosition[from.row][c4]) return false;
        }
        return true;
      }
      if (dc == 0 && dr != 0) {
        var step4 = dr > 0 ? 1 : -1;
        for (var r4 = from.row + step4; r4 != to.row; r4 += step4) {
          if (initialPosition[r4][from.col]) return false;
        }
        return true;
      }
      return false;
    }
    if (piece == '♔') {
      if (absDr <= 1 && absDc <= 1) return true;
      return false;
    }
  } else if (isBlack(piece)) {
    if (piece == '♟') {
      if (dc == 0 && dr == 1 && !target) return true;
      if (dc == 0 && dr == 2 && from.row == 1 && !target && !initialPosition[2][from.col]) return true;
      if (absDc == 1 && dr == 1 && target && isWhite(target)) return true;
      return false;
    }
    if (piece == '♜') {
      if (dr == 0 && dc != 0) {
        var step5 = dc > 0 ? 1 : -1;
        for (var c5 = from.col + step5; c5 != to.col; c5 += step5) {
          if (initialPosition[from.row][c5]) return false;
        }
        return true;
      }
      if (dc == 0 && dr != 0) {
        var step6 = dr > 0 ? 1 : -1;
        for (var r5 = from.row + step6; r5 != to.row; r5 += step6) {
          if (initialPosition[r5][from.col]) return false;
        }
        return true;
      }
      return false;
    }
    if (piece == '♞') {
      if ((absDr == 2 && absDc == 1) || (absDr == 1 && absDc == 2)) return true;
      return false;
    }
    if (piece == '♝') {
      if (absDr == absDc && absDr != 0) {
        var stepR3 = dr > 0 ? 1 : -1;
        var stepC3 = dc > 0 ? 1 : -1;
        var r6 = from.row + stepR3, c6 = from.col + stepC3;
        while (r6 != to.row && c6 != to.col) {
          if (initialPosition[r6][c6]) return false;
          r6 += stepR3; c6 += stepC3;
        }
        return true;
      }
      return false;
    }
    if (piece == '♛') {
      if (absDr == absDc && absDr != 0) {
        var stepR4 = dr > 0 ? 1 : -1;
        var stepC4 = dc > 0 ? 1 : -1;
        var r7 = from.row + stepR4, c7 = from.col + stepC4;
        while (r7 != to.row && c7 != to.col) {
          if (initialPosition[r7][c7]) return false;
          r7 += stepR4; c7 += stepC4;
        }
        return true;
      }
      if (dr == 0 && dc != 0) {
        var step7 = dc > 0 ? 1 : -1;
        for (var c8 = from.col + step7; c8 != to.col; c8 += step7) {
          if (initialPosition[from.row][c8]) return false;
        }
        return true;
      }
      if (dc == 0 && dr != 0) {
        var step8 = dr > 0 ? 1 : -1;
        for (var r8 = from.row + step8; r8 != to.row; r8 += step8) {
          if (initialPosition[r8][from.col]) return false;
        }
        return true;
      }
      return false;
    }
    if (piece == '♚') {
      if (absDr <= 1 && absDc <= 1) return true;
      return false;
    }
  }
  return false;
}
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(function() {
    timers[turn] = timers[turn] - 1;
    renderBoard();
    if (timers[turn] <= 0) {
      clearInterval(timerInterval);
      alert('¡Tiempo agotado! Ganan las ' + (turn == 'white' ? 'negras' : 'blancas'));
    }
  }, 1000);
}
function formatTime(secs) {
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  if (m < 10) m = '0' + m;
  if (s < 10) s = '0' + s;
  return m + ':' + s;
}

function renderBoard() {
  board.innerHTML = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      let cell = document.createElement('div');
      let cellBg;
      if (row > 0 && col > 0) {
        cellBg = (row + col) % 2 == 0 ? '#b3b3b3' : '#808080';
      } else {
        cellBg = '#242424';
      }
      if (row == 0 && col == 0) cellBg = '#111';
      cell.style.width = '60px';
      cell.style.height = '60px';
      cell.style.boxSizing = 'border-box';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '20px';
      cell.style.border = (row > 0 && col > 0) ? '1px solid #333' : 'none';
      cell.style.background = cellBg;
      cell.style.color = (row > 0 && col > 0) ? '#222' : '#f1f1f1';
      cell.style.fontWeight = (row == 0 || col == 0) ? 'bold' : 'normal';
      if (row == 0 && col > 0) cell.textContent = files[col - 1];
      else if (col == 0 && row > 0) cell.textContent = ranks[row - 1];
      else if (row > 0 && col > 0) {
        let piece = initialPosition[row - 1][col - 1];
        cell.textContent = piece;
        cell.style.fontSize = '40px';
        cell.style.cursor = piece ? 'pointer' : 'default';
        cell.setAttribute('data-row', row - 1);
        cell.setAttribute('data-col', col - 1);
        if (piece && ((turn == 'white' && isWhite(piece)) || (turn == 'black' && isBlack(piece)))) {
          cell.setAttribute('draggable', 'true');
          cell.addEventListener('dragstart', function(e) {
            dragSource = { row: parseInt(this.getAttribute('data-row')), col: parseInt(this.getAttribute('data-col')) };
            e.dataTransfer.setData('text/plain', dragSource.row + ',' + dragSource.col);
          });
        }
        cell.addEventListener('dragover', function(e) { e.preventDefault(); });
        cell.addEventListener('drop', function(e) {
          e.preventDefault();
          if (!dragSource) return;
          let from = dragSource;
          let to = { row: parseInt(this.getAttribute('data-row')), col: parseInt(this.getAttribute('data-col')) };
          let movingPiece = initialPosition[from.row][from.col];
          if ((turn == 'white' && isWhite(movingPiece)) || (turn == 'black' && isBlack(movingPiece))) {
          if (turn !== miColor) {
            alert("¡No es tu turno!");
            return;
          }
          if ((miColor === "white" && !isWhite(movingPiece)) || (miColor === "black" && !isBlack(movingPiece))) {
            alert("¡No puedes mover las piezas del rival!");
            return;
          }

          if (isLegalMove(movingPiece, from, to)) {
            moveAndSwitchTurn(from, to, movingPiece);
          }
          }
        });
      }
      board.appendChild(cell);
    }
  }
  renderTurnAndTimers();
}

function renderTurnAndTimers() {
  zonaTurnoTiempo.innerHTML = '<div style="color:#fff; text-align:center;">' +
    '<b>Turno:</b> <span style="color:' + (turn == 'white' ? '#fff' : '#222') + ';background:' + (turn == 'white' ? '#888' : '#eee') + ';padding:2px 8px;border-radius:6px;">' + (turn == 'white' ? 'Blancas' : 'Negras') + '</span>' +
    '</div>' +
    '<div style="margin-top:6px;">' +
    '<span style="color:#222;background:#fff;padding:2px 8px;border-radius:6px;">Blancas: ' + formatTime(timers.white) + '</span>' +
    '&nbsp;|&nbsp;' +
    '<span style="color:#fff;background:#222;padding:2px 8px;border-radius:6px;">Negras: ' + formatTime(timers.black) + '</span>' +
    '</div>';
}
function renderMoveHistory() {
  let html = '<b style="color:#fff;">Historial de movimientos</b><hr style="margin:4px 0; border-color:#555">';
  html += '<div style="max-height:400px;overflow-y:auto;">';
  html += '<div style="display:flex;font-weight:bold;color:#aaa;"><span style="width:32px;">#</span><span style="width:60px;">Pieza</span><span style="width:60px;">De</span><span style="width:60px;">A</span></div>';
  for (let i = 0; i < moveHistory.length; i++) {
    let m = moveHistory[i];
    html += '<div style="display:flex;align-items:center;color:#e0e0e0;"><span style="width:32px;">' + (i+1) + '</span><span style="width:60px;">' + m.pieza + '</span><span style="width:60px;">' + m.de + '</span><span style="width:60px;">' + m.a + '</span></div>';
  }
  html += '</div>';
  zonaHistorial.innerHTML = html;
}
function renderCaptured() {
  let blancas = document.getElementById('capturadas-blancas');
  let negras = document.getElementById('capturadas-negras');
  blancas.innerHTML = capturedWhite.length > 0 ? 'Blancas capturadas: ' + capturedWhite.join(' ') : '';
  negras.innerHTML = capturedBlack.length > 0 ? 'Negras capturadas: ' + capturedBlack.join(' ') : '';
}
async function moveAndSwitchTurn(from, to, movingPiece) {
  var target = initialPosition[to.row][to.col];
  var capture = target && ((turn == 'white' && isBlack(target)) || (turn == 'black' && isWhite(target)));
  if (capture) {
    if (isWhite(target)) capturedWhite.push(target);
    else if (isBlack(target)) capturedBlack.push(target);
  }
  initialPosition[to.row][to.col] = movingPiece;
  initialPosition[from.row][from.col] = '';
  dragSource = null;
  let pieza = movingPiece;
  let color = isWhite(movingPiece) ? 'Blancas' : 'Negras';
  let files = ['a','b','c','d','e','f','g','h'];
  let ranks = ['8','7','6','5','4','3','2','1'];
  let de = files[from.col] + ranks[from.row];
  let a = files[to.col] + ranks[to.row];
  moveHistory.push({pieza: pieza, color: color, de: de, a: a});
  turn = turn == 'white' ? 'black' : 'white';

  await moverPiezaEnServidor(codigoPartida, initialPosition, moveHistory, turn, timers);
 
  renderBoard();
  renderMoveHistory();
  renderCaptured();
  startTimer();
}

document.getElementById('btn-reiniciar').onclick = function() {
  initialPosition = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
  ];
  turn = 'white';
  timers = { white: 300, black: 300 };
  moveHistory = [];
  capturedWhite = [];
  capturedBlack = [];
  renderBoard();
  renderMoveHistory();
  renderCaptured();
  startTimer();
};
let partidaFinalizada = false;
let mensajeVictoriaMostrado = false;

document.getElementById('btn-rendirse').onclick = async function() {
  if (partidaFinalizada) return;
  if (miColor === "espectador") {
    alert("Los espectadores no pueden rendirse");
    return;
  }
  if (miColor === null) {
    alert("Debes ser un jugador para rendirte");
    return;
  }
  if (!confirm("¿Estás seguro de que quieres rendirte?")) return;

  try {
    clearInterval(timerInterval);
    const res = await fetch(`${API_BASE}/api/partidas/${codigoPartida}/rendirse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.mensaje || "Error al rendirse");
    }

    partidaFinalizada = true;
    document.getElementById('btn-rendirse').disabled = true;
    
  } catch (err) {
    console.error("Error al rendirse:", err);
    alert(err.message || "Error al procesar la rendición");
    if (!partidaFinalizada) {
      startTimer();
    }
  }
};

async function cargarPartidaDesdeServidor() {
  try {
    const res = await fetch(`${API_BASE}/api/partidas/${codigoPartida}`, {
      credentials: "include"
    });

    if (!res.ok) {
      throw new Error("Error al cargar la partida");
    }

    const data = await res.json();
    if (!data) {
      throw new Error("Datos de partida no válidos");
    }

    if (!mensajeVictoriaMostrado && data.estado === "finalizada" && data.resultado?.ganador) {
      clearInterval(timerInterval);
      const colorGanador = data.resultado.ganador === "blanco" ? "Blancas" : "Negras";
      const razon = data.resultado.razon === "rendicion" ? "por rendición" : "por tiempo";
      alert(`¡Victoria para las ${colorGanador} ${razon}!`);
      document.getElementById('btn-rendirse').disabled = true;
      partidaFinalizada = true;
      mensajeVictoriaMostrado = true;
      return;
    }

    if (data.tablero) {
      initialPosition = data.tablero;
    }

    if (data.historialMovimientos) {
      moveHistory = data.historialMovimientos;
    }

    if (data.piezasCapturadas) {
      capturedWhite = data.piezasCapturadas.blancas || [];
      capturedBlack = data.piezasCapturadas.negras || [];
    }

    if (data.turno) {
      turn = data.turno;
    }

    renderBoard();
    renderMoveHistory();
    renderCaptured();
  } catch (err) {
    console.error("Error al cargar partida:", err);
  }
}

async function moverPiezaEnServidor(codigoPartida, nuevaPosicion, historial, turno, timers) {
  try {
    const res = await fetch(`${API_BASE}/api/partidas/${codigoPartida}/mover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nuevaPosicion,
        historial,
        turno,
        timers,
        piezasCapturadas: {
          blancas: capturedWhite,
          negras: capturedBlack
        }
      })
    });
    if (!res.ok) throw new Error("No se pudo guardar el movimiento en el servidor");
    return await res.json();
  } catch (err) {
    console.error("Error al guardar el movimiento:", err);
    alert("Error al guardar el movimiento en el servidor");
  }
}

setInterval(() => {
  cargarPartidaDesdeServidor();
}, 1000);

cargarDatosUsuarioYPartida();
cargarPartidaDesdeServidor();
