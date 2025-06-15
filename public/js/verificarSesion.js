document.addEventListener("DOMContentLoaded", async () => {
  const navbar = document.querySelector(".nav-horizontal");

  try {
    const res = await fetch(`${API_BASE}/api/auth/perfil`, {
      credentials: "include"
    });

    const oldLogin = navbar?.querySelector('a[href="login.html"]');
    const oldPerfil = navbar?.querySelector('a[href="profile.html"]');
    if (oldLogin) oldLogin.parentElement.remove();
    if (oldPerfil) oldPerfil.parentElement.remove();

    const div = document.createElement("div");
    div.className = "menu-item";

    const titulo = document.getElementById("titulo-inicio");
    const boton = document.getElementById("boton-inicio");

    if (res.ok) {
      const user = await res.json();

      div.innerHTML = '<a href="profile.html">Perfil de usuario</a>';

      if (titulo && boton) {
        titulo.textContent = `Bienvenido, ${user.nombreUsuario}`;
        boton.textContent = "Jugar";
        boton.href = "start.html";
      }
    } else {
      div.innerHTML = '<a href="login.html">Iniciar Sesión</a>';

      if (titulo && boton) {
        titulo.textContent = "Registrate para jugar";
        boton.textContent = "Iniciar sesión";
        boton.href = "login.html";
      }
    }

    if (navbar) navbar.appendChild(div);

  } catch (err) {
    console.error("Error al verificar sesión:", err);
  }
});



