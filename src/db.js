// Camada de persistencia: SQLite (arquivo) via better-sqlite3.
const Database = require("better-sqlite3");

function abrirBanco(caminho = process.env.DB_PATH || "./data/pokedex.db") {
  if (caminho !== ":memory:") {
    const fs = require("fs");
    const path = require("path");
    fs.mkdirSync(path.dirname(caminho), { recursive: true });
  }

  const db = new Database(caminho);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS favoritos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      pokemon_id  INTEGER NOT NULL,
      nome        TEXT    NOT NULL,
      tipos       TEXT    NOT NULL,
      imagem      TEXT,
      nota        INTEGER NOT NULL CHECK (nota BETWEEN 0 AND 10),
      comentario  TEXT    NOT NULL DEFAULT '',
      autor       TEXT    NOT NULL DEFAULT 'anonimo',
      criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
  return db;
}

function listarFavoritos(db) {
  return db
    .prepare("SELECT * FROM favoritos ORDER BY nota DESC, id DESC")
    .all()
    .map((linha) => ({ ...linha, tipos: linha.tipos.split(",") }));
}

function criarFavorito(db, f) {
  const info = db
    .prepare(
      `INSERT INTO favoritos (pokemon_id, nome, tipos, imagem, nota, comentario, autor)
       VALUES (@pokemon_id, @nome, @tipos, @imagem, @nota, @comentario, @autor)`
    )
    .run({
      pokemon_id: f.pokemon_id,
      nome: f.nome,
      tipos: f.tipos.join(","),
      imagem: f.imagem || null,
      nota: f.nota,
      comentario: f.comentario || "",
      autor: f.autor || "anonimo",
    });
  return buscarFavorito(db, info.lastInsertRowid);
}

function buscarFavorito(db, id) {
  const linha = db.prepare("SELECT * FROM favoritos WHERE id = ?").get(id);
  return linha ? { ...linha, tipos: linha.tipos.split(",") } : null;
}

function excluirFavorito(db, id) {
  return db.prepare("DELETE FROM favoritos WHERE id = ?").run(id).changes > 0;
}

module.exports = {
  abrirBanco,
  listarFavoritos,
  criarFavorito,
  buscarFavorito,
  excluirFavorito,
};
