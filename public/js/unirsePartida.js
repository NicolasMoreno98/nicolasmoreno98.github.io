document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUnirse");
  const respuesta = document.getElementById("respuesta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const codigo = document.getElementById("codigo").value.trim();
    if (!codigo) return alert("Debes ingresar un código de partida");

    try {
      const res = await fetch(`${API_BASE}/api/partidas/unirse/${codigo}`, {
        method: "POST",
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        const rol = data.rol === "jugador" ? "como jugador" : "como espectador";
        respuesta.innerHTML = `✅ Te uniste a la partida ${codigo} ${rol}.`;
        setTimeout(() => {
          window.location.href = `play.html?id=${data.id}`;
        }, 2000);
      } else {
        respuesta.innerHTML = `❌ ${data.mensaje || "Error al unirse a la partida"}`;
      }
    } catch (err) {
      console.error(err);
      respuesta.innerHTML = "❌ Error de conexión con el servidor.";
    }
  });
});
