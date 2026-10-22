/* ============================================================
   auth.js  - Modulo compartilhado por todas as paginas
   - Define a URL base da API (JSON Server)
   - Controla a sessao do usuario logado (sessionStorage)
   - Monta/atualiza o menu conforme o status do usuario
   - Fornece helpers para a funcionalidade de favoritos
   ============================================================ */

// O JSON Server serve o front-end (pasta public) e a API REST na
// mesma origem, entao podemos derivar a URL automaticamente.
const API_URL = window.location.origin;

const SESSAO_KEY = "futnews:usuarioLogado";

/* ---------------------- Sessao do usuario ---------------------- */

function getUsuarioLogado() {
  const dados = sessionStorage.getItem(SESSAO_KEY);
  return dados ? JSON.parse(dados) : null;
}

function setUsuarioLogado(usuario) {
  // Guardamos apenas o necessario (nunca a senha)
  const seguro = {
    id: usuario.id,
    login: usuario.login,
    nome: usuario.nome,
    email: usuario.email,
    admin: usuario.admin === true,
  };
  sessionStorage.setItem(SESSAO_KEY, JSON.stringify(seguro));
}

function logout() {
  sessionStorage.removeItem(SESSAO_KEY);
  window.location.href = "index.html";
}

/* ---------------------- Menu / Cabecalho ---------------------- */

// Ajusta a visibilidade dos itens de menu conforme o usuario logado.
// Os links usam atributos: data-auth (so logado), data-guest (so visitante),
// data-admin (so administrador), data-logout (acao de sair).
function atualizarMenu() {
  const usuario = getUsuarioLogado();

  document.querySelectorAll("[data-guest]").forEach((el) => {
    el.style.display = usuario ? "none" : "";
  });
  document.querySelectorAll("[data-auth]").forEach((el) => {
    el.style.display = usuario ? "" : "none";
  });
  document.querySelectorAll("[data-admin]").forEach((el) => {
    el.style.display = usuario && usuario.admin ? "" : "none";
  });
  document.querySelectorAll("[data-logout]").forEach((el) => {
    el.style.display = usuario ? "" : "none";
    el.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  });
  document.querySelectorAll("[data-username]").forEach((el) => {
    el.textContent = usuario ? usuario.nome : "";
  });
}

// Protege paginas restritas. tipo = "auth" (precisa logar) ou "admin".
function exigirAcesso(tipo) {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    alert("Voce precisa estar logado para acessar esta pagina.");
    window.location.href = "login.html";
    return false;
  }
  if (tipo === "admin" && !usuario.admin) {
    alert("Acesso restrito a administradores.");
    window.location.href = "index.html";
    return false;
  }
  return true;
}

/* ---------------------- Favoritos ---------------------- */

// Retorna a lista de favoritos do usuario logado (array de registros
// { id, usuarioId, noticiaId }). Vazio se nao houver usuario.
async function getFavoritosDoUsuario() {
  const usuario = getUsuarioLogado();
  if (!usuario) return [];
  const resp = await fetch(`${API_URL}/favoritos?usuarioId=${usuario.id}`);
  if (!resp.ok) throw new Error(`Erro ao carregar favoritos: ${resp.status}`);
  return resp.json();
}

// Alterna o estado de favorito de uma noticia para o usuario logado.
// Retorna true se ficou favoritado, false se foi removido.
async function alternarFavorito(noticiaId) {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    alert("Faca login para marcar favoritos.");
    window.location.href = "login.html";
    return false;
  }

  noticiaId = Number(noticiaId);
  const favoritos = await getFavoritosDoUsuario();
  const existente = favoritos.find((f) => Number(f.noticiaId) === noticiaId);

  if (existente) {
    await fetch(`${API_URL}/favoritos/${existente.id}`, { method: "DELETE" });
    return false;
  }

  await fetch(`${API_URL}/favoritos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuarioId: usuario.id, noticiaId }),
  });
  return true;
}

// Atualiza o menu assim que o DOM estiver pronto.
document.addEventListener("DOMContentLoaded", atualizarMenu);
