/* ============================================================
   favoritos.js - Tela "Meus Itens (Favoritos)"
   Lista as noticias favoritadas pelo usuario logado.
   ============================================================ */

if (exigirAcesso("auth")) {
  document.addEventListener("DOMContentLoaded", iniciarFavoritos);
}

async function iniciarFavoritos() {
  const container = document.getElementById("fav-cards");
  try {
    const favs = await getFavoritosDoUsuario();
    if (favs.length === 0) {
      container.innerHTML = `<p class="fn-sem-resultado">Voce ainda nao marcou nenhuma noticia como favorita.</p>`;
      return;
    }

    // Busca os dados completos de cada noticia favoritada
    const noticias = await Promise.all(
      favs.map((f) =>
        fetch(`${API_URL}/noticias/${f.noticiaId}`).then((r) => (r.ok ? r.json() : null))
      )
    );

    container.innerHTML = noticias
      .filter(Boolean)
      .map(
        (n) => `
        <article class="fn-card" onclick="window.location.href='detalhes.html?id=${n.id}'">
          <div class="fn-thumb"><img src="${n.imagem}" alt="${n.tag}"></div>
          <div class="fn-content">
            <div class="fn-card-top">
              <span class="fn-tag">${n.tag}</span>
              <button class="fn-fav-btn" title="Remover dos favoritos"
                onclick="event.stopPropagation(); removerFavorito(${n.id}, this)">
                <i class="bi bi-heart-fill"></i>
              </button>
            </div>
            <h2>${n.titulo}</h2>
            <p>${n.resumo}</p>
            <div class="fn-meta">${n.data} &nbsp;&middot;&nbsp; Fonte: ${n.fonte}</div>
          </div>
        </article>`
      )
      .join("");
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `<p class="fn-sem-resultado">Erro ao carregar favoritos.</p>`;
  }
}

async function removerFavorito(id, btn) {
  await alternarFavorito(id);
  // Remove o card da tela
  const card = btn.closest(".fn-card");
  card.remove();

  const container = document.getElementById("fav-cards");
  if (!container.querySelector(".fn-card")) {
    container.innerHTML = `<p class="fn-sem-resultado">Voce ainda nao marcou nenhuma noticia como favorita.</p>`;
  }
}
