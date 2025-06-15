document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCrearPartida");
  const resultado = document.getElementById("resultado");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    resultado.innerHTML = "Creando partida...";

    const color = document.getElementById("color").value;
    try {
      const res = await fetch(`${API_BASE}/api/partidas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ color })
      });

      const data = await res.json();
      if (res.ok && data.codigo) {
        resultado.innerHTML = `
          <div>
            <p>Comparte este código para invitar a un jugador:</p>
            <code id="codigo-partida" style="boton-privada">${data.codigo}</code>
            <button id="btn-copiar" style="margin-left:8px;">Copiar</button>
          </div>
          <button id="btn-ir-partida" style="boton-privada">Ir a la partida</button>
        `;

        document.getElementById("btn-copiar").onclick = () => {
          navigator.clipboard.writeText(data.codigo);
          alert("Código copiado");
        };

        document.getElementById("btn-ir-partida").onclick = () => {
          window.location.href = `play.html?partida=${data.codigo}`;
        };
      } else {
        resultado.innerHTML = data.mensaje || "Error al crear partida";
      }
    } catch (err) {
      resultado.innerHTML = "Error de conexión al crear la partida.";
    }
  });
});
