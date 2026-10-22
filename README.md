# FutNews — Trabalho Prático 2 (DIW)

Portal de notícias de futebol. Front-end estático servido pelo **JSON Server**,
que também provê a API REST (back-end).

## Como executar

```bash
npm install      # instala o json-server (apenas na 1ª vez)
npm start        # sobe o servidor em http://localhost:3000
```

Depois abra **http://localhost:3000/index.html** no navegador.

> Importante: a aplicação precisa ser aberta pela URL do servidor
> (`http://localhost:3000/...`), e **não** com duplo-clique no arquivo,
> pois os dados são carregados via API (`fetch`).

## Usuários de teste (em `db/db.json`)

| Login | Senha | Perfil |
|-------|-------|--------|
| admin | 123   | Administrador (vê o menu **Cadastro**) |
| user  | 123   | Usuário comum |

Para tornar outro usuário administrador, edite manualmente o `db/db.json`
e marque `"admin": true` (conforme orientação do enunciado).

## Estrutura

```
/db/db.json                      dados (noticias, usuarios, favoritos)
/public/
  index.html                     Tela 1 - Home (carrossel, cards+busca, gráfico, autor)
  login.html                     Telas 2 e 3 - Login e Cadastro de usuário
  cadastro_itens.html            Tela 4 - CRUD de itens (somente admin)
  detalhes.html                  Tela 5 - Detalhes do item
  favoritos.html                 Meus itens (favoritos)
  assets/css/style.css
  assets/images/
  assets/scripts/
    auth.js                      sessão (sessionStorage), menu e favoritos
    app.js                       home
    login.js                     login + cadastro de usuário
    cadastro_itens.js            CRUD de itens
    detalhes.js                  detalhes + favorito
    favoritos.js                 lista de favoritos
package.json
```
