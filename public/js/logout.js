document.addEventListener("DOMContentLoaded", () => {
  const botonLogout = document.getElementById("cerrarSesion");

  if (botonLogout) {
    botonLogout.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          credentials: "include"
        });

        if (res.ok) {
          alert("Sesión cerrada.");
          window.location.href = "login.html";
        } else {
          alert("No se pudo cerrar sesión.");
        }
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
        alert("Error al cerrar sesión.");
      }
    });
  }
});
