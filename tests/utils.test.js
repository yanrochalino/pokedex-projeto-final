const { validarEntrada, formatarNome, validarNota } = require("../src/utils");

test("rejeita entrada vazia", () => {
  expect(validarEntrada("")).toBe(false);
  expect(validarEntrada("   ")).toBe(false);
});

test("aceita entrada valida", () => {
  expect(validarEntrada("pikachu")).toBe(true);
  expect(validarEntrada("mr-mime")).toBe(true);
  expect(validarEntrada("25")).toBe(true);
});

test("rejeita caracteres perigosos e tipos errados", () => {
  expect(validarEntrada("../etc/passwd")).toBe(false);
  expect(validarEntrada("<script>")).toBe(false);
  expect(validarEntrada(null)).toBe(false);
});

test("formata nome com inicial maiuscula", () => {
  expect(formatarNome("pikachu")).toBe("Pikachu");
  expect(formatarNome("MR-MIME")).toBe("Mr-Mime");
});

test("valida a nota de 0 a 10", () => {
  expect(validarNota(0)).toBe(true);
  expect(validarNota(10)).toBe(true);
  expect(validarNota(11)).toBe(false);
  expect(validarNota(-1)).toBe(false);
  expect(validarNota(7.5)).toBe(false);
  expect(validarNota("8")).toBe(false);
});
