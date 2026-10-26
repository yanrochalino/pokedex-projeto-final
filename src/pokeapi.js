// Integracao com a API externa PokeAPI (https://pokeapi.co).
const { formatarNome } = require("./utils");

const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

class PokemonNaoEncontrado extends Error {
  constructor(nome) {
    super(`Pokemon "${nome}" nao encontrado`);
    this.name = "PokemonNaoEncontrado";
  }
}

/**
 * Busca um pokemon na PokeAPI e devolve so os campos que a aplicacao usa.
 * `fetchFn` pode ser trocado nos testes para nao depender da internet.
 */
async function buscarPokemon(nomeOuId, fetchFn = fetch) {
  const chave = String(nomeOuId).trim().toLowerCase();
  const resposta = await fetchFn(`${BASE_URL}/${encodeURIComponent(chave)}`);

  if (resposta.status === 404) throw new PokemonNaoEncontrado(chave);
  if (!resposta.ok) throw new Error(`PokeAPI respondeu ${resposta.status}`);

  const dados = await resposta.json();
  return {
    pokemon_id: dados.id,
    nome: formatarNome(dados.name),
    tipos: dados.types.map((t) => t.type.name),
    imagem:
      dados.sprites?.other?.["official-artwork"]?.front_default ||
      dados.sprites?.front_default ||
      null,
    altura_m: dados.height / 10,
    peso_kg: dados.weight / 10,
  };
}

module.exports = { buscarPokemon, PokemonNaoEncontrado };
