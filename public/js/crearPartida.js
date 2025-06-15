document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCrearPartida"); // OJO: id correcto!
  const resultadoDiv = document.getElementById("resultado");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const color = document.getElementById("color").value;
    if (!color) {
      resultadoDiv.textContent = "Debes seleccionar un color.";
      resultadoDiv.style.color = "red";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/partidas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ color })
      });

      const data = await res.json();

      if (res.ok && data.codigo) {
        resultadoDiv.innerHTML = `
          <b>Código de invitación:</b>
          <span style="font-family:monospace">${data.codigo}</span>
          <button id="btn-copiar">Copiar</button>
        `;
        resultadoDiv.style.color = "inherit";

        // Permitir copiar el código con un botón
        document.getElementById("btn-copiar").onclick = () => {
          navigator.clipboard.writeText(data.codigo);
          alert("Código copiado al portapapeles");
        };

        // Redirigir automáticamente a la partida
        setTimeout(() => {
          window.location.href = `play.html?partida=${data.codigo}`;
        }, 1000);
      } else {
        resultadoDiv.textContent = data.mensaje || "No se pudo crear la partida.";
        resultadoDiv.style.color = "red";
      }
    } catch (err) {
      resultadoDiv.textContent = "Error de conexión con el servidor.";
      resultadoDiv.style.color = "red";
      console.error(err);
    }
  });
});




