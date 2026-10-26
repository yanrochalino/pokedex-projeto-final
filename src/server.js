const { abrirBanco } = require("./db");
const { criarApp } = require("./app");

const PORT = process.env.PORT || 3000;
const db = abrirBanco();

criarApp(db).listen(PORT, "0.0.0.0", () => {
  console.log(`Pokedex do time rodando em http://localhost:${PORT}`);
});
