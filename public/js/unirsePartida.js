document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUnirse");
  const respuesta = document.getElementById("respuesta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    respuesta.textContent = "Buscando partida...";

    const codigo = document.getElementById("codigo").value.trim();

    try {
      const res = await fetch(`${API_BASE}/api/partidas/${codigo}`, {
        method: "GET",
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok && data.codigo === codigo) {
        respuesta.innerHTML = `
          <span style="color: green;">¡Partida encontrada!</span><br>
          <button id="btn-ir-partida" style="margin-top: 12px; padding: 8px 16px; font-size: 16px; border-radius: 6px;">Ir a la partida</button>
        `;
        document.getElementById("btn-ir-partida").onclick = () => {
          window.location.href = `play.html?partida=${codigo}`;
        };
      } else {
        respuesta.innerHTML = `<span style="color: red;">No se encontró la partida o el código es incorrecto.</span>`;
      }
    } catch (err) {
      respuesta.innerHTML = `<span style="color: red;">Error de conexión con el servidor.</span>`;
    }
  });
});
