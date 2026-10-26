// Funcoes puras de validacao e formatacao (faceis de testar).

/**
 * Valida o nome digitado para buscar um pokemon.
 * Aceita letras, numeros e hifen (ex.: "pikachu", "mr-mime", "25").
 */
function validarEntrada(texto) {
  if (typeof texto !== "string") return false;
  const limpo = texto.trim();
  if (limpo.length === 0 || limpo.length > 40) return false;
  return /^[a-zA-Z0-9-]+$/.test(limpo);
}

/** "pikachu" -> "Pikachu"; "mr-mime" -> "Mr-Mime" */
function formatarNome(texto) {
  if (typeof texto !== "string") return "";
  return texto
    .trim()
    .toLowerCase()
    .split("-")
    .map((parte) => (parte ? parte[0].toUpperCase() + parte.slice(1) : parte))
    .join("-");
}

/** A nota do time vai de 0 a 10 (inteiro). */
function validarNota(nota) {
  return Number.isInteger(nota) && nota >= 0 && nota <= 10;
}

module.exports = { validarEntrada, formatarNome, validarNota };
