async function verificarSesion() {
  try {
    const res = await fetch("/api/auth/perfil", {
      method: "GET",
      credentials: "include",
    });

    const navbar = document.querySelector(".nav-horizontal");

    if (res.ok) {
      const perfil = document.createElement("div");
      perfil.className = "menu-item";
      perfil.innerHTML = '<a href="profile.html">Perfil de usuario</a>';

      const loginItem = navbar.querySelector('a[href="login.html"]');
      if (loginItem) loginItem.parentElement.remove();

      navbar.appendChild(perfil);
    } else {
      const login = document.createElement("div");
      login.className = "menu-item";
      login.innerHTML = '<a href="login.html">Iniciar Sesión</a>';

      const perfilItem = navbar.querySelector('a[href="profile.html"]');
      if (perfilItem) perfilItem.parentElement.remove();

      navbar.appendChild(login);
    }
  } catch (err) {
    console.error("Error al verificar sesión:", err);
  }
}

verificarSesion();
