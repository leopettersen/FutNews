/* ============================================================
   app.js - Logica da Home-Page (index.html)
   Secao 1: Carrossel de destaques (Bootstrap)
   Secao 2: Cards com pesquisa + marcar favoritos
   Secao 3: Visualizacao avancada (grafico Chart.js)
   ============================================================ */

let noticias = [];
let idsFavoritos = new Set(); // noticiaId (Number) favoritados pelo usuario logado

let filtroAtual = "todos";
let termoBusca = "";

const CATEGORIAS = {
  todos: "Todos",
  brasil: "Brasil",
  champions: "Champions",
  transferencias: "Transferencias",
  copa: "Copa do Mundo",
};

// ---------- Carga inicial ----------
async function iniciarHome() {
  try {
    const resp = await fetch(`${API_URL}/noticias`);
    if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);
    noticias = await resp.json();

    await carregarFavoritosLocais();

    renderCarrossel();
    renderCards();
    renderGrafico();
  } catch (erro) {
    console.error("Erro ao carregar noticias:", erro);
    const c = document.getElementById("cards");
    if (c) c.innerHTML = `<p class="fn-sem-resultado">Nao foi possivel carregar as noticias. O JSON Server esta rodando?</p>`;
  }
}

async function carregarFavoritosLocais() {
  idsFavoritos = new Set();
  const usuario = getUsuarioLogado();
  if (!usuario) return;
  const favs = await getFavoritosDoUsuario();
  favs.forEach((f) => idsFavoritos.add(Number(f.noticiaId)));
}

// ---------- Secao 1: Carrossel ----------
function renderCarrossel() {
  const inner = document.getElementById("carousel-inner");
  if (!inner) return;

  // Usa os itens mais recentes (ids maiores) como destaques
  const destaques = [...noticias].slice(-5).reverse();

  inner.innerHTML = destaques
    .map((n, i) => `
      <div class="carousel-item ${i === 0 ? "active" : ""}" onclick="abrirDetalhes(${n.id})" role="button">
        <img src="${n.imagem}" class="d-block w-100 fn-carousel-img" alt="${n.tag}">
        <div class="carousel-caption d-none d-md-block fn-carousel-caption">
          <span class="fn-tag">${n.tag}</span>
          <h5>${n.titulo}</h5>
          <p>${n.resumo.slice(0, 120)}...</p>
        </div>
      </div>
    `)
    .join("");
}

// ---------- Secao 2: Cards + pesquisa + favoritos ----------
function filtrar(cat, btn) {
  filtroAtual = cat;
  document.querySelectorAll(".fn-nav button").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderCards();
}

function buscar(valor) {
  termoBusca = valor.trim().toLowerCase();
  renderCards();
}

function renderCards() {
  const container = document.getElementById("cards");
  if (!container) return;

  let lista =
    filtroAtual === "todos"
      ? noticias
      : noticias.filter((n) => n.cat === filtroAtual);

  // Pesquisa: filtra por titulo OU descricao (resumo)
  if (termoBusca !== "") {
    lista = lista.filter(
      (n) =>
        n.titulo.toLowerCase().includes(termoBusca) ||
        (n.resumo || "").toLowerCase().includes(termoBusca)
    );
  }

  if (lista.length === 0) {
    container.innerHTML = `<p class="fn-sem-resultado">Nenhuma noticia encontrada.</p>`;
    return;
  }

  const logado = !!getUsuarioLogado();

  container.innerHTML = lista
    .map((n) => {
      const fav = idsFavoritos.has(Number(n.id));
      const btnFav = logado
        ? `<button class="fn-fav-btn" title="${fav ? "Remover dos favoritos" : "Marcar como favorito"}"
             onclick="event.stopPropagation(); toggleFavoritoCard(${n.id}, this)">
             <i class="bi ${fav ? "bi-heart-fill" : "bi-heart"}"></i>
           </button>`
        : "";

      return `
        <article class="fn-card" onclick="abrirDetalhes(${n.id})">
          <div class="fn-thumb">
            <img src="${n.imagem}" alt="${n.tag}">
          </div>
          <div class="fn-content">
            <div class="fn-card-top">
              <span class="fn-tag">${n.tag}</span>
              ${btnFav}
            </div>
            <h2>${n.titulo}</h2>
            <p>${n.resumo}</p>
            <div class="fn-meta">${n.data} &nbsp;&middot;&nbsp; Fonte: ${n.fonte}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

async function toggleFavoritoCard(id, btn) {
  const agoraFavorito = await alternarFavorito(id);
  if (agoraFavorito) idsFavoritos.add(Number(id));
  else idsFavoritos.delete(Number(id));

  const icon = btn.querySelector("i");
  icon.className = `bi ${agoraFavorito ? "bi-heart-fill" : "bi-heart"}`;
  btn.title = agoraFavorito ? "Remover dos favoritos" : "Marcar como favorito";
}

function abrirDetalhes(id) {
  window.location.href = `detalhes.html?id=${id}`;
}

// ---------- Secao 3: Visualizacao avancada (grafico) ----------
function renderGrafico() {
  const canvas = document.getElementById("grafico");
  if (!canvas || typeof Chart === "undefined") return;

  const contagem = {};
  noticias.forEach((n) => {
    const nome = CATEGORIAS[n.cat] || n.cat;
    contagem[nome] = (contagem[nome] || 0) + 1;
  });

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(contagem),
      datasets: [
        {
          label: "Noticias por categoria",
          data: Object.values(contagem),
          backgroundColor: "#2e8b2e",
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

iniciarHome();
