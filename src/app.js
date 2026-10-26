const path = require("path");
const express = require("express");
const db_ = require("./db");
const { buscarPokemon, PokemonNaoEncontrado } = require("./pokeapi");
const { validarEntrada, validarNota } = require("./utils");

/**
 * Monta o app Express. Recebe o banco e a funcao fetch por parametro
 * (injecao de dependencia) para os testes rodarem sem rede.
 */
function criarApp(db, fetchFn = fetch) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/saude", (_req, res) => res.json({ status: "ok" }));

  // Consulta a API externa (PokeAPI)
  app.get("/api/pokemon/:nome", async (req, res) => {
    if (!validarEntrada(req.params.nome)) {
      return res.status(400).json({ erro: "Nome invalido" });
    }
    try {
      res.json(await buscarPokemon(req.params.nome, fetchFn));
    } catch (e) {
      if (e instanceof PokemonNaoEncontrado) {
        return res.status(404).json({ erro: e.message });
      }
      res.status(502).json({ erro: "Falha ao consultar a PokeAPI" });
    }
  });

  // CRUD de favoritos do time (persistido no SQLite)
  app.get("/api/favoritos", (_req, res) => {
    res.json(db_.listarFavoritos(db));
  });

  app.post("/api/favoritos", async (req, res) => {
    const { nome, nota, comentario, autor } = req.body || {};
    if (!validarEntrada(nome)) {
      return res.status(400).json({ erro: "Nome invalido" });
    }
    if (!validarNota(nota)) {
      return res.status(400).json({ erro: "A nota deve ser um inteiro de 0 a 10" });
    }
    try {
      const pokemon = await buscarPokemon(nome, fetchFn);
      const criado = db_.criarFavorito(db, {
        ...pokemon,
        nota,
        comentario: String(comentario || "").slice(0, 280),
        autor: String(autor || "").trim().slice(0, 40) || "anonimo",
      });
      res.status(201).json(criado);
    } catch (e) {
      if (e instanceof PokemonNaoEncontrado) {
        return res.status(404).json({ erro: e.message });
      }
      res.status(502).json({ erro: "Falha ao consultar a PokeAPI" });
    }
  });

  app.delete("/api/favoritos/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ erro: "Id invalido" });
    if (!db_.excluirFavorito(db, id)) {
      return res.status(404).json({ erro: "Favorito nao encontrado" });
    }
    res.status(204).end();
  });

  return app;
}

module.exports = { criarApp };
