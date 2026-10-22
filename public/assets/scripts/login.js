/* ============================================================
   login.js - Telas 2 e 3 (Login e Cadastro de Usuarios)
   Autentica contra a colecao "usuarios" do JSON Server e
   mantem o usuario logado na sessionStorage.
   ============================================================ */

async function fazerLogin(evento) {
  evento.preventDefault();
  const login = document.getElementById("login").value.trim();
  const senha = document.getElementById("senha").value;
  const msg = document.getElementById("login-msg");

  try {
    const resp = await fetch(`${API_URL}/usuarios?login=${encodeURIComponent(login)}`);
    const encontrados = await resp.json();
    const usuario = encontrados.find((u) => u.senha === senha);

    if (!usuario) {
      msg.textContent = "Login ou senha invalidos.";
      msg.className = "fn-form-msg fn-erro";
      return;
    }

    setUsuarioLogado(usuario);
    window.location.href = "index.html";
  } catch (erro) {
    console.error(erro);
    msg.textContent = "Erro ao conectar ao servidor.";
    msg.className = "fn-form-msg fn-erro";
  }
}

async function cadastrarUsuario(evento) {
  evento.preventDefault();
  const login = document.getElementById("c-login").value.trim();
  const nome = document.getElementById("c-nome").value.trim();
  const email = document.getElementById("c-email").value.trim();
  const senha = document.getElementById("c-senha").value;
  const msg = document.getElementById("cadastro-msg");

  if (!login || !nome || !email || !senha) {
    msg.textContent = "Preencha todos os campos.";
    msg.className = "fn-form-msg fn-erro";
    return;
  }

  try {
    // Impede logins duplicados
    const existentes = await (await fetch(`${API_URL}/usuarios?login=${encodeURIComponent(login)}`)).json();
    if (existentes.length > 0) {
      msg.textContent = "Esse login ja esta em uso.";
      msg.className = "fn-form-msg fn-erro";
      return;
    }

    const novo = {
      id: crypto.randomUUID(),
      login,
      nome,
      email,
      senha,
      admin: false,
    };

    const resp = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    if (!resp.ok) throw new Error("Falha no cadastro");

    msg.textContent = "Usuario cadastrado com sucesso! Voce ja pode fazer login.";
    msg.className = "fn-form-msg fn-sucesso";
    evento.target.reset();
  } catch (erro) {
    console.error(erro);
    msg.textContent = "Erro ao cadastrar usuario.";
    msg.className = "fn-form-msg fn-erro";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login");
  if (formLogin) formLogin.addEventListener("submit", fazerLogin);

  const formCadastro = document.getElementById("form-cadastro");
  if (formCadastro) formCadastro.addEventListener("submit", cadastrarUsuario);
});
