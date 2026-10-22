/* ============================================================
   cadastro_itens.js - Tela 4 (CRUD de Itens / noticias)
   Apenas administradores. Permite inserir, alterar, excluir e
   listar as noticias mantidas no JSON Server.
   ============================================================ */

if (exigirAcesso("admin")) {
  document.addEventListener("DOMContentLoaded", iniciarCadastro);
}

function iniciarCadastro() {
  document.getElementById("form-item").addEventListener("submit", salvarItem);
  document.getElementById("btn-limpar").addEventListener("click", limparForm);
  listarItens();
}

async function listarItens() {
  const tbody = document.getElementById("lista-itens");
  const resp = await fetch(`${API_URL}/noticias`);
  const itens = await resp.json();

  if (itens.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">Nenhum item cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = itens
    .map(
      (n) => `
      <tr>
        <td>${n.id}</td>
        <td>${n.titulo}</td>
        <td>${n.tag}</td>
        <td class="fn-acoes">
          <button class="fn-btn-mini" onclick="editarItem(${n.id})">Alterar</button>
          <button class="fn-btn-mini fn-btn-danger" onclick="excluirItem(${n.id})">Excluir</button>
        </td>
      </tr>`
    )
    .join("");
}

async function salvarItem(evento) {
  evento.preventDefault();
  const id = document.getElementById("item-id").value;
  const msg = document.getElementById("item-msg");

  const dados = {
    titulo: document.getElementById("f-titulo").value.trim(),
    tag: document.getElementById("f-tag").value.trim(),
    cat: document.getElementById("f-cat").value,
    imagem: document.getElementById("f-imagem").value.trim(),
    resumo: document.getElementById("f-resumo").value.trim(),
    fonte: document.getElementById("f-fonte").value.trim(),
    url: document.getElementById("f-url").value.trim(),
    data: document.getElementById("f-data").value.trim(),
  };

  try {
    if (id) {
      // ALTERAR (PUT preserva o id)
      await fetch(`${API_URL}/noticias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), ...dados }),
      });
      msg.textContent = "Item alterado com sucesso!";
    } else {
      // INSERIR
      await fetch(`${API_URL}/noticias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      msg.textContent = "Item cadastrado com sucesso!";
    }
    msg.className = "fn-form-msg fn-sucesso";
    limparForm();
    listarItens();
  } catch (erro) {
    console.error(erro);
    msg.textContent = "Erro ao salvar o item.";
    msg.className = "fn-form-msg fn-erro";
  }
}

async function editarItem(id) {
  const resp = await fetch(`${API_URL}/noticias/${id}`);
  const n = await resp.json();

  document.getElementById("item-id").value = n.id;
  document.getElementById("f-titulo").value = n.titulo || "";
  document.getElementById("f-tag").value = n.tag || "";
  document.getElementById("f-cat").value = n.cat || "brasil";
  document.getElementById("f-imagem").value = n.imagem || "";
  document.getElementById("f-resumo").value = n.resumo || "";
  document.getElementById("f-fonte").value = n.fonte || "";
  document.getElementById("f-url").value = n.url || "";
  document.getElementById("f-data").value = n.data || "";

  document.getElementById("form-titulo").textContent = `Alterando item #${n.id}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirItem(id) {
  if (!confirm("Tem certeza que deseja excluir este item?")) return;
  const msg = document.getElementById("item-msg");
  try {
    const resp = await fetch(`${API_URL}/noticias/${id}`, { method: "DELETE" });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    msg.textContent = `Item #${id} excluido.`;
    msg.className = "fn-form-msg fn-sucesso";
    listarItens();
  } catch (erro) {
    console.error(erro);
    msg.textContent = "Erro ao excluir o item.";
    msg.className = "fn-form-msg fn-erro";
  }
}

function limparForm() {
  document.getElementById("form-item").reset();
  document.getElementById("item-id").value = "";
  document.getElementById("form-titulo").textContent = "Cadastro de Item";
}
