document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
      const contraseña = document.getElementById("contrasena").value;

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nombreUsuario, contraseña })
        });

        const data = await res.json();

        if (res.ok) {
          alert("Inicio de sesión exitoso.");
          window.location.href = "main.html";
        } else {
          alert(data.mensaje || "Credenciales incorrectas.");
        }
      } catch (err) {
        alert("Error de conexión con el servidor.");
      }
    });
  }
});
