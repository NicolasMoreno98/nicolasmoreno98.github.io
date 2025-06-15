document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE}/api/auth/perfil`, {
      credentials: "include"
    });

    if (!res.ok) {
      window.location.href = "login.html";
    }

    const usuario = await res.json();

    document.getElementById("nombreUsuario").textContent = usuario.nombreUsuario;
    document.getElementById("correo").textContent = usuario.correo;
    document.getElementById("fechaNacimiento").textContent = usuario.fechaNacimiento;

    await cargarPartidas();
  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
});

async function cargarPartidas() {
  try {
    const res = await fetch(`${API_BASE}/api/partidas`, {
      credentials: "include"
    });

    if (!res.ok) {
      throw new Error("Error al cargar las partidas");
    }

    const partidas = await res.json();
    const listaPartidas = document.getElementById("listaPartidas");
    
    if (partidas.length === 0) {
      listaPartidas.innerHTML = '<p>No has creado ninguna partida todavía.</p>';
      return;
    }

    listaPartidas.innerHTML = '';
    partidas.forEach(partida => {
      const estado = partida.estado === 'esperando' ? 'Esperando oponente' :
                    partida.estado === 'jugando' ? 'En curso' :
                    'Finalizada';
      
      const resultado = partida.estado === 'finalizada' ? 
        `- Ganador: ${partida.resultado.ganador === 'blanco' ? 'Blancas' : 'Negras'} (${partida.resultado.razon})` : '';

      const partidaElement = document.createElement('div');
      partidaElement.className = 'partida-item';
      partidaElement.innerHTML = `
        <div class="partida-info">
          <p>Código: <strong>${partida.codigo}</strong></p>
          <p>Estado: ${estado} ${resultado}</p>
          <p>Color elegido: ${partida.colorCreador === 'blanco' ? 'Blancas' : 'Negras'}</p>
          <p>Creada: ${new Date(partida.creadaEn).toLocaleString()}</p>
        </div>
        <div class="partida-acciones">
          ${partida.estado !== 'finalizada' ? 
            `<button onclick="window.location.href='play.html?partida=${partida.codigo}'" class="boton-jugar">Ir a la partida</button>` : 
            ''}
          <button onclick="eliminarPartida('${partida.codigo}')" class="boton-eliminar">Eliminar</button>
        </div>
      `;
      listaPartidas.appendChild(partidaElement);
    });
  } catch (err) {
    console.error("Error al cargar las partidas:", err);
  }
}

async function eliminarPartida(codigo) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta partida?')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/partidas/${codigo}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error('No se pudo eliminar la partida');
    }

    await cargarPartidas();
    alert('Partida eliminada correctamente');
  } catch (err) {
    console.error('Error al eliminar la partida:', err);
    alert('Error al eliminar la partida');
  }
}
