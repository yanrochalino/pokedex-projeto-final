# Pokédex do Time — Bootcamp II · Etapa 03

> Desafio final em grupo: aplicação web colaborativa com fluxo profissional (branches, Pull Requests, CI e Docker).

**Repositório:** https://github.com/SEU_USUARIO/bootcamp2-projeto-final
**Imagem Docker Hub:** https://hub.docker.com/r/SEU_USUARIO_DOCKER/pokedex-time

---

## 1. Integrantes e responsabilidades

> Preencham uma linha por pessoa. O link da "principal PR" deve apontar para a PR de código aprovada e mesclada.

| Nome | Matrícula | Usuário GitHub | Funcionalidade (dono) | Principal PR |
|------|-----------|----------------|-----------------------|--------------|
| Fulano de Tal | 00000000 | @usuario1 | Utilitários de validação + CI (GitHub Actions) | #1 |
| Ciclana de Tal | 00000000 | @usuario2 | Persistência (SQLite) + Dockerfile | #2 |
| Beltrano de Tal | 00000000 | @usuario3 | Integração com a PokeAPI | #3 |
| Fulana de Tal | 00000000 | @usuario4 | API REST (rotas de favoritos) + testes de API | #4 |
| Sicrano de Tal | 00000000 | @usuario5 | Interface web (frontend) | #5 |

Papéis acumulativos (além do código): documentação do README, testes, revisão de PRs.

---

## 2. A aplicação

**Pokédex do Time** é um ranking colaborativo de Pokémon: qualquer pessoa busca um Pokémon, dá uma nota de 0 a 10, deixa um comentário e salva. A lista do time é ordenada pela nota e permite excluir itens.

| Item | Detalhe |
|------|---------|
| Linguagem / framework | Node.js 20 + Express 4 |
| Interface | HTML + CSS + JavaScript puro (pasta `public/`) |
| Banco de dados | **SQLite** (arquivo `pokedex.db`, via `better-sqlite3`) — criar, listar e excluir favoritos |
| API externa | **[PokeAPI](https://pokeapi.co/)** (`GET https://pokeapi.co/api/v2/pokemon/{nome}`) — traz id, tipos, imagem, altura e peso na hora de buscar/salvar |
| Testes | Jest + Supertest (a PokeAPI é simulada nos testes, então não dependem de internet) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

### Rotas da API

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/saude` | Verificação de saúde |
| GET | `/api/pokemon/:nome` | Consulta a PokeAPI |
| GET | `/api/favoritos` | Lista o ranking |
| POST | `/api/favoritos` | Cria favorito `{ nome, nota, comentario, autor }` |
| DELETE | `/api/favoritos/:id` | Exclui favorito |

---

## 3. Como executar

### 3.1 Localmente (Node.js 20+)

```bash
git clone https://github.com/SEU_USUARIO/bootcamp2-projeto-final.git
cd bootcamp2-projeto-final
npm install
npm start
# abra http://localhost:3000
```

Variáveis de ambiente (opcionais): `PORT` (padrão `3000`) e `DB_PATH` (padrão `./data/pokedex.db`).

### 3.2 Com Docker (imagem pública no Docker Hub)

```bash
docker run -d --name pokedex -p 3000:3000 -v pokedex-data:/app/data SEU_USUARIO_DOCKER/pokedex-time:latest
# abra http://localhost:3000
```

- `-p 3000:3000` publica a porta da aplicação.
- `-v pokedex-data:/app/data` mantém o banco SQLite entre reinicializações (pode ser removido para um teste rápido).
- Para trocar a porta externa: `-p 8080:3000`. Para trocar a porta interna: `-e PORT=4000 -p 4000:4000`.
- O container precisa de acesso à internet para consultar a PokeAPI.

Parar e remover: `docker rm -f pokedex`.

### 3.3 Construindo a imagem você mesmo

```bash
docker build -t SEU_USUARIO_DOCKER/pokedex-time:latest .
```

---

## 4. Como rodar os testes

```bash
npm install
npm test
```

São 11 testes automatizados (validações, integração com a PokeAPI simulada e rotas da API com banco em memória). O mesmo comando roda no GitHub Actions a cada Pull Request e a cada push na `main`.

---

## 5. Fluxo de trabalho do time

- A branch `main` é **protegida**: nada entra sem Pull Request, com 1 aprovação de outro membro e o check `testes` verde.
- Branches seguem o padrão `feature/<nome-da-funcionalidade>` (ex.: `feature/interface-web`).
- Toda PR tem título claro, descrição (o quê, por quê, como testar) e revisor designado.

## 6. Evidências

### 6.1 PR bloqueada pelo CI (teste quebrado de propósito)

> Inserir aqui o print: `![PR bloqueada pelo CI](docs/evidencias/pr-bloqueada.png)`
> PR de exemplo: #N — o GitHub exibiu "Required statuses must pass before merging".

### 6.2 Conflito de merge resolvido

> Descrevam: quais branches conflitaram, em qual arquivo, como resolveram (comandos usados) e quem resolveu.

### 6.3 Histórico de PRs

> Link para a lista de PRs fechadas/mescladas: https://github.com/SEU_USUARIO/bootcamp2-projeto-final/pulls?q=is%3Apr+is%3Aclosed
