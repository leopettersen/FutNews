/* ============================================================
   detalhes.js - Tela 5 (Detalhes do Item)
   Mostra todos os dados da noticia + icone de favorito que
   reflete o estado para o usuario logado.
   ============================================================ */

async function iniciarDetalhes() {
  const container = document.getElementById("detalhe-noticia");
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  try {
    const resp = await fetch(`${API_URL}/noticias/${id}`);
    if (!resp.ok) throw new Error("Noticia nao encontrada");
    const noticia = await resp.json();

    let favorito = false;
    const usuario = getUsuarioLogado();
    if (usuario) {
      const favs = await getFavoritosDoUsuario();
      favorito = favs.some((f) => Number(f.noticiaId) === id);
    }

    const btnFav = usuario
      ? `<button id="btn-fav-detalhe" class="fn-fav-btn fn-fav-detalhe"
           onclick="toggleFavoritoDetalhe(${noticia.id}, this)"
           title="${favorito ? "Remover dos favoritos" : "Marcar como favorito"}">
           <i class="bi ${favorito ? "bi-heart-fill" : "bi-heart"}"></i>
         </button>`
      : `<span class="fn-fav-aviso">Faca login para favoritar</span>`;

    container.innerHTML = `
      <article class="fn-detalhe">
        <div class="fn-detalhe-thumb">
          <img src="${noticia.imagem}" alt="${noticia.tag}">
        </div>
        <div class="fn-card-top">
          <span class="fn-tag">${noticia.tag}</span>
          ${btnFav}
        </div>
        <h1>${noticia.titulo}</h1>
        <div class="fn-meta">${noticia.data} &nbsp;&middot;&nbsp; Fonte: ${noticia.fonte}</div>
        <p class="fn-detalhe-conteudo">${noticia.resumo}</p>
        <div class="fn-meta">
          <a href="${noticia.url}" target="_blank" rel="noopener noreferrer">
            Abrir materia original em nova aba <i class="bi bi-arrow-up-right"></i>
          </a>
        </div>
        <div class="fn-detalhe-fonte">
          <h3>Materia original (${noticia.fonte})</h3>
          <div class="fn-iframe-wrap">
            <iframe src="${noticia.url}" title="Materia original" loading="lazy" referrerpolicy="no-referrer"></iframe>
          </div>
          <p class="fn-iframe-aviso">
            Se a materia nao aparecer acima, o site de origem pode bloquear a exibicao
            dentro de outras paginas. Use o link "Abrir materia original em nova aba".
          </p>
        </div>
      </article>
    `;
  } catch (erro) {
    container.innerHTML = `
      <div class="fn-detalhe-erro">
        <p>Noticia nao encontrada.</p>
        <a href="index.html">Voltar para a home</a>
      </div>
    `;
  }
}

async function toggleFavoritoDetalhe(id, btn) {
  const agora = await alternarFavorito(id);
  const icon = btn.querySelector("i");
  icon.className = `bi ${agora ? "bi-heart-fill" : "bi-heart"}`;
  btn.title = agora ? "Remover dos favoritos" : "Marcar como favorito";
}

iniciarDetalhes();
