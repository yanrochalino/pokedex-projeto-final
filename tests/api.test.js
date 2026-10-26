const request = require("supertest");
const { criarApp } = require("../src/app");
const { abrirBanco } = require("../src/db");
const { buscarPokemon, PokemonNaoEncontrado } = require("../src/pokeapi");

// Falsa PokeAPI: os testes nunca dependem da internet.
const PIKACHU = {
  id: 25,
  name: "pikachu",
  height: 4,
  weight: 60,
  types: [{ type: { name: "electric" } }],
  sprites: { other: { "official-artwork": { front_default: "http://img/25.png" } } },
};

function fetchFalso(url) {
  if (String(url).endsWith("/pikachu") || String(url).endsWith("/25")) {
    return Promise.resolve({ ok: true, status: 200, json: async () => PIKACHU });
  }
  return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
}

let app;
beforeEach(() => {
  app = criarApp(abrirBanco(":memory:"), fetchFalso);
});

test("PokeAPI: converte a resposta para o formato da aplicacao", async () => {
  const p = await buscarPokemon("Pikachu", fetchFalso);
  expect(p).toMatchObject({ pokemon_id: 25, nome: "Pikachu", tipos: ["electric"] });
  expect(p.altura_m).toBe(0.4);
});

test("PokeAPI: pokemon inexistente lanca erro especifico", async () => {
  await expect(buscarPokemon("naoexiste", fetchFalso)).rejects.toBeInstanceOf(
    PokemonNaoEncontrado
  );
});

test("GET /api/pokemon/:nome devolve 404 para pokemon inexistente", async () => {
  const r = await request(app).get("/api/pokemon/naoexiste");
  expect(r.status).toBe(404);
});

test("POST /api/favoritos cria e GET lista (persistencia)", async () => {
  const criado = await request(app)
    .post("/api/favoritos")
    .send({ nome: "pikachu", nota: 9, comentario: "classico", autor: "Ana" });
  expect(criado.status).toBe(201);
  expect(criado.body).toMatchObject({ nome: "Pikachu", nota: 9, autor: "Ana" });

  const lista = await request(app).get("/api/favoritos");
  expect(lista.body).toHaveLength(1);
  expect(lista.body[0].tipos).toEqual(["electric"]);
});

test("POST /api/favoritos rejeita nota invalida", async () => {
  const r = await request(app).post("/api/favoritos").send({ nome: "pikachu", nota: 99 });
  expect(r.status).toBe(400);
});

test("DELETE /api/favoritos/:id exclui e depois devolve 404", async () => {
  const { body } = await request(app).post("/api/favoritos").send({ nome: "pikachu", nota: 7 });

  const del = await request(app).delete(`/api/favoritos/${body.id}`);
  expect(del.status).toBe(204);

  const lista = await request(app).get("/api/favoritos");
  expect(lista.body).toHaveLength(0);

  const outra = await request(app).delete(`/api/favoritos/${body.id}`);
  expect(outra.status).toBe(404);
});
