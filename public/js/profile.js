document.addEventListener("DOMContentLoaded", async () => {
  try {
        const res = await fetch("http://localhost:3000/api/auth/perfil", {
        credentials: "include"
        });

        if (!res.ok) {
        window.location.href = "login.html";
        }

    const usuario = await res.json();

    // Insertar datos en el HTML
    document.getElementById("nombreUsuario").textContent = usuario.nombreUsuario;
    document.getElementById("correo").textContent = usuario.correo;
    document.getElementById("fechaNacimiento").textContent = usuario.fechaNacimiento;
  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
});
