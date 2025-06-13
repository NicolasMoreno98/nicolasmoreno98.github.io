var tableroContainer = document.getElementById('tablero-ajedrez');
var zonaTurnoTiempo = document.getElementById('zona-turno-tiempo');
var zonaHistorial = document.getElementById('zona-historial');
var board = document.createElement('div');
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
var initialPosition = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', ''],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];
var files = ['a','b','c','d','e','f','g','h'];
var ranks = ['8','7','6','5','4','3','2','1'];
var dragSource = null;
var turn = 'white';
var timers = { white: 300, black: 300 };
var timerInterval = null;
var moveHistory = [];
var capturedWhite = [];
var capturedBlack = [];
function isWhite(piece) {
  if (piece == '♙' || piece == '♖' || piece == '♘' || piece == '♗' || piece == '♕' || piece == '♔') {
    return true;
  }
  return false;
}
function isBlack(piece) {
  if (piece == '♟' || piece == '♜' || piece == '♞' || piece == '♝' || piece == '♛' || piece == '♚') {
    return true;
  }
  return false;
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
  if (timerInterval) {
    clearInterval(timerInterval);
  }
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
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      var cell = document.createElement('div');
      var cellBg;
      if (row > 0 && col > 0) {
        if ((row + col) % 2 == 0) {
          cellBg = '#b3b3b3';
        } else {
          cellBg = '#808080';
        }
      } else {
        cellBg = '#242424';
      }
      if (row == 0 && col == 0) {
        cellBg = '#111';
      }
      cell.style.width = '60px';
      cell.style.height = '60px';
      cell.style.boxSizing = 'border-box';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '20px';
      if (row > 0 && col > 0) {
        cell.style.border = '1px solid #333';
      } else {
        cell.style.border = 'none';
      }
      cell.style.background = cellBg;
      cell.style.color = (row > 0 && col > 0) ? '#222' : '#f1f1f1';
      cell.style.fontWeight = (row == 0 || col == 0) ? 'bold' : 'normal';
      if (row == 0 && col > 0) {
        cell.textContent = files[col - 1];
      } else if (col == 0 && row > 0) {
        cell.textContent = ranks[row - 1];
      } else if (row > 0 && col > 0) {
        var piece = initialPosition[row - 1][col - 1];
        cell.textContent = piece;
        cell.style.fontSize = '40px';
        if (piece) {
          cell.style.cursor = 'pointer';
        } else {
          cell.style.cursor = 'default';
        }
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
          var from = dragSource;
          var to = { row: parseInt(this.getAttribute('data-row')), col: parseInt(this.getAttribute('data-col')) };
          var movingPiece = initialPosition[from.row][from.col];
          if ((turn == 'white' && isWhite(movingPiece)) || (turn == 'black' && isBlack(movingPiece))) {
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
  var html = '<b style="color:#fff;">Historial de movimientos</b><hr style="margin:4px 0; border-color:#555">';
  html += '<div style="max-height:400px;overflow-y:auto;">';
  html += '<div style="display:flex;font-weight:bold;color:#aaa;"><span style="width:32px;">#</span><span style="width:60px;">Pieza</span><span style="width:60px;">De</span><span style="width:60px;">A</span></div>';
  for (var i = 0; i < moveHistory.length; i++) {
    var m = moveHistory[i];
    html += '<div style="display:flex;align-items:center;color:#e0e0e0;"><span style="width:32px;">' + (i+1) + '</span><span style="width:60px;">' + m.pieza + '</span><span style="width:60px;">' + m.de + '</span><span style="width:60px;">' + m.a + '</span></div>';
  }
  html += '</div>';
  zonaHistorial.innerHTML = html;
}
function renderCaptured() {
  var blancas = document.getElementById('capturadas-blancas');
  var negras = document.getElementById('capturadas-negras');
  if (capturedWhite.length > 0) {
    blancas.innerHTML = 'Blancas capturadas: ' + capturedWhite.join(' ');
  } else {
    blancas.innerHTML = '';
  }
  if (capturedBlack.length > 0) {
    negras.innerHTML = 'Negras capturadas: ' + capturedBlack.join(' ');
  } else {
    negras.innerHTML = '';
  }
}
function moveAndSwitchTurn(from, to, movingPiece) {
  var target = initialPosition[to.row][to.col];
  var capture = target && ((turn == 'white' && isBlack(target)) || (turn == 'black' && isWhite(target)));
  if (capture) {
    if (isWhite(target)) capturedWhite.push(target);
    else if (isBlack(target)) capturedBlack.push(target);
  }
  initialPosition[to.row][to.col] = movingPiece;
  initialPosition[from.row][from.col] = '';
  dragSource = null;
  var pieza = movingPiece;
  var color = isWhite(movingPiece) ? 'Blancas' : 'Negras';
  var files = ['a','b','c','d','e','f','g','h'];
  var ranks = ['8','7','6','5','4','3','2','1'];
  var de = files[from.col] + ranks[from.row];
  var a = files[to.col] + ranks[to.row];
  moveHistory.push({pieza: pieza, color: color, de: de, a: a});
  if (turn == 'white') {
    turn = 'black';
  } else {
    turn = 'white';
  }
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
document.getElementById('btn-rendirse').onclick = function() {
  clearInterval(timerInterval);
  var ganador;
  if (turn == 'white') {
    ganador = 'Negras';
  } else {
    ganador = 'Blancas';
  }
  alert('¡Victoria para ' + ganador + ' por rendición!');
};
renderBoard();
renderMoveHistory();
renderCaptured();
startTimer();
