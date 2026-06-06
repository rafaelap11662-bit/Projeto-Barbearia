/* ============================================================
   auth.js — Login page
   POST /auth/login → { token, usuario: { id, nome, email, tipoUsuario } }
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Redireciona se já logado
  const usuario = sessionStorage.getItem('usuario');
  if (usuario) {
    const u = JSON.parse(usuario);
    redirecionarPorTipo(u.tipoUsuario);
  }

  // Toggle senha
  document.getElementById('pw-toggle').addEventListener('click', () => {
    const input = document.getElementById('login-senha');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // Login
  document.getElementById('btn-login').addEventListener('click', fazerLogin);

  document.getElementById('login-senha').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fazerLogin();
  });
});

async function fazerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;

  if (!email || !senha) {
    showToast('Preencha e-mail e senha.', 'error');
    return;
  }

  const btn = document.getElementById('btn-login');
  btn.disabled = true;
  btn.textContent = 'Entrando...';

  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'E-mail ou senha inválidos');
    }

    const data = await res.json();

    // Salva sessão
    sessionStorage.setItem('token', data.token || '');
    sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

    redirecionarPorTipo(data.usuario.tipoUsuario);

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

function redirecionarPorTipo(tipo) {
  if (tipo === 'ADMINISTRADOR') window.location.href = 'admin.html';
  else if (tipo === 'BARBEIRO')  window.location.href = 'barbeiro.html';
  else if (tipo === 'CLIENTE')   window.location.href = 'cliente.html';
}
