const $ = (id) => document.getElementById(id);

// Nome em português e cor de cada tipo (os dados da PokeAPI vêm em inglês)
const TIPOS = {
  normal: ["Normal", "#A8A77A"],
  fire: ["Fogo", "#EE8130"],
  water: ["Água", "#6390F0"],
  electric: ["Elétrico", "#F7D02C"],
  grass: ["Planta", "#7AC74C"],
  ice: ["Gelo", "#96D9D6"],
  fighting: ["Lutador", "#C22E28"],
  poison: ["Veneno", "#A33EA1"],
  ground: ["Terra", "#E2BF65"],
  flying: ["Voador", "#A98FF3"],
  psychic: ["Psíquico", "#F95587"],
  bug: ["Inseto", "#A6B91A"],
  rock: ["Pedra", "#B6A136"],
  ghost: ["Fantasma", "#735797"],
  dragon: ["Dragão", "#6F35FC"],
  dark: ["Sombrio", "#705746"],
  steel: ["Aço", "#B7B7CE"],
  fairy: ["Fada", "#D685AD"],
};
const INK = "#14202e";

const scanner = $("scanner");
let pokemonAtual = null;
let timerToast;

/* ---------- utilidades ---------- */

function el(tag, classe, texto) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function tipoInfo(tipo) {
  return TIPOS[tipo] || [tipo, "#8a96a3"];
}

function luminancia(hex) {
  const n = parseInt(hex.slice(1), 16);
  const canais = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

// Escolhe texto escuro ou branco, o que tiver mais contraste sobre a cor do tipo
function corDoTexto(hex) {
  const l = luminancia(hex);
  const comBranco = 1.05 / (l + 0.05);
  const comEscuro = (l + 0.05) / (luminancia(INK) + 0.05);
  return comEscuro >= comBranco ? INK : "#ffffff";
}

function aplicarTipo(tipo) {
  if (!tipo) {
    scanner.style.removeProperty("--tipo");
    scanner.style.removeProperty("--tipo-ink");
    return;
  }
  const cor = tipoInfo(tipo)[1];
  scanner.style.setProperty("--tipo", cor);
  scanner.style.setProperty("--tipo-ink", corDoTexto(cor));
}

function criarChips(tipos) {
  return tipos.map((t) => {
    const [nome, cor] = tipoInfo(t);
    const li = el("li", "chip", nome);
    li.style.setProperty("--chip-cor", cor);
    return li;
  });
}

function mensagem(id, texto, tipo = "") {
  const m = $(id);
  m.textContent = texto;
  m.className = "msg" + (tipo ? " msg--" + tipo : "");
}

function toast(texto) {
  const t = $("toast");
  t.textContent = texto;
  t.classList.add("toast--visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(() => t.classList.remove("toast--visivel"), 2600);
}

function lerAutor() {
  try { return localStorage.getItem("autor") || ""; } catch { return ""; }
}
function guardarAutor(nome) {
  try { localStorage.setItem("autor", nome); } catch { /* sem armazenamento: tudo bem */ }
}

/* ---------- busca ---------- */

async function buscar(texto) {
  const nome = texto.trim();
  if (!nome) return;

  mensagem("msg-busca", "Buscando…");
  esconderResultado();

  try {
    const r = await fetch(`/api/pokemon/${encodeURIComponent(nome)}`);
    if (r.status === 404) {
      throw new Error(`Não encontramos “${nome}”. Confira a grafia ou use o número da Pokédex.`);
    }
    if (r.status === 400) {
      throw new Error("Use só letras, números e hífen, com até 40 caracteres.");
    }
    if (!r.ok) throw new Error("A PokeAPI não respondeu. Tente de novo em instantes.");
    mostrarResultado(await r.json());
    mensagem("msg-busca", "");
  } catch (e) {
    const falhaDeRede = e instanceof TypeError;
    mensagem("msg-busca", falhaDeRede ? "Não foi possível falar com o servidor. Verifique se ele está rodando." : e.message, "erro");
  }
}

function esconderResultado() {
  pokemonAtual = null;
  $("resultado").hidden = true;
  $("form-salvar").hidden = true;
  aplicarTipo(null);
}

function mostrarResultado(p) {
  pokemonAtual = p;
  aplicarTipo(p.tipos[0]);

  $("res-img").src = p.imagem || "";
  $("res-img").alt = p.nome;
  $("res-nome").textContent = p.nome;
  $("res-tipos").replaceChildren(...criarChips(p.tipos));
  const fmt = (n) => n.toLocaleString("pt-BR");
  $("res-medidas").textContent = `Nº ${p.pokemon_id}, ${fmt(p.altura_m)} m, ${fmt(p.peso_kg)} kg`;

  // reinicia a animação de entrada a cada nova busca
  const card = $("resultado");
  card.classList.remove("achado--novo");
  card.hidden = false;
  void card.offsetWidth;
  card.classList.add("achado--novo");

  $("form-salvar").hidden = false;
  mensagem("msg-salvar", "");
}

/* ---------- salvar ---------- */

function montarNotas() {
  const caixa = $("nota-opcoes");
  for (let i = 0; i <= 10; i++) {
    const rotulo = el("label", "nota__opcao");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "nota";
    radio.value = String(i);
    radio.checked = i === 8;
    rotulo.append(radio, el("span", "", String(i)));
    caixa.appendChild(rotulo);
  }
}

async function salvar(evento) {
  evento.preventDefault();
  if (!pokemonAtual) return;

  const nota = document.querySelector('input[name="nota"]:checked');
  const autor = $("autor").value.trim();
  const corpo = {
    nome: pokemonAtual.nome,
    nota: Number(nota ? nota.value : 8),
    comentario: $("comentario").value.trim(),
    autor,
  };

  try {
    const r = await fetch("/api/favoritos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(dados.erro || "Não foi possível salvar. Tente de novo.");

    if (autor) guardarAutor(autor);
    toast(`${dados.nome} salvo no ranking`);

    // volta o painel ao estado inicial, pronto para a próxima busca
    $("comentario").value = "";
    $("busca").value = "";
    esconderResultado();
    await carregarLista(dados.id);
    $("busca").focus({ preventScroll: true });
  } catch (e) {
    const falhaDeRede = e instanceof TypeError;
    mensagem("msg-salvar", falhaDeRede ? "Não foi possível falar com o servidor." : e.message, "erro");
  }
}

/* ---------- ranking ---------- */

function posicoes(favoritos) {
  // empates na nota dividem a mesma posição
  return favoritos.map((f) => 1 + favoritos.filter((o) => o.nota > f.nota).length);
}

function criarLinha(f, posicao) {
  const cor = tipoInfo(f.tipos[0])[1];
  const li = el("li", "linha" + (posicao <= 3 ? " linha--topo" : ""));
  li.style.setProperty("--cor", cor);
  li.style.setProperty("--nota", String(f.nota));
  li.dataset.id = f.id;

  const arte = el("div", "linha__arte");
  const img = document.createElement("img");
  img.src = f.imagem || "";
  img.alt = f.nome;
  img.loading = "lazy";
  arte.appendChild(img);

  const info = el("div");
  info.appendChild(el("h3", "linha__nome", f.nome));
  const chips = el("ul", "chips");
  chips.append(...criarChips(f.tipos));
  info.appendChild(chips);
  if (f.comentario) info.appendChild(el("p", "linha__comentario", `“${f.comentario}”`));
  info.appendChild(el("p", "linha__autor", `Avaliado por ${f.autor}`));

  const acoes = el("div", "linha__acoes");
  mostrarAcaoExcluir(acoes, f);
  info.appendChild(acoes);

  const lado = el("div", "linha__nota");
  const valor = el("div", "nota-valor", String(f.nota));
  valor.appendChild(el("small", "", "/10"));
  const barra = el("div", "barra");
  barra.appendChild(el("span", "barra__preenche"));
  lado.append(valor, barra);

  li.append(el("div", "linha__posicao", String(posicao)), arte, info, lado);
  return li;
}

// Excluir pede confirmação na própria linha, sem janela do navegador
function mostrarAcaoExcluir(caixa, f) {
  const excluir = el("button", "acao", "Excluir");
  excluir.type = "button";
  excluir.setAttribute("aria-label", `Excluir ${f.nome} do ranking`);
  excluir.addEventListener("click", () => {
    const confirmar = el("button", "acao acao--perigo", "Excluir mesmo");
    confirmar.type = "button";
    const cancelar = el("button", "acao", "Cancelar");
    cancelar.type = "button";
    confirmar.addEventListener("click", () => excluirFavorito(f));
    cancelar.addEventListener("click", () => {
      caixa.replaceChildren();
      mostrarAcaoExcluir(caixa, f);
    });
    caixa.replaceChildren(confirmar, cancelar);
    confirmar.focus();
  });
  caixa.appendChild(excluir);
}

async function excluirFavorito(f) {
  try {
    const r = await fetch(`/api/favoritos/${f.id}`, { method: "DELETE" });
    if (!r.ok && r.status !== 404) throw new Error();
    toast(`${f.nome} excluído`);
    carregarLista();
  } catch {
    toast("Não foi possível excluir. Tente de novo.");
  }
}

function resumo(favoritos) {
  if (favoritos.length === 0) return "";
  const media = favoritos.reduce((s, f) => s + f.nota, 0) / favoritos.length;
  const mediaTxt = media.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${favoritos.length} ${favoritos.length === 1 ? "avaliação" : "avaliações"}, média ${mediaTxt}`;
}

let primeiraCarga = true;

async function carregarLista(destacarId) {
  const lista = $("lista");
  try {
    const r = await fetch("/api/favoritos");
    if (!r.ok) throw new Error();
    const favoritos = await r.json();
    const pos = posicoes(favoritos);

    if (primeiraCarga) {
      lista.dataset.entrada = "1";
      setTimeout(() => delete lista.dataset.entrada, 1200);
      primeiraCarga = false;
    }

    lista.replaceChildren(...favoritos.map((f, i) => criarLinha(f, pos[i])));
    $("vazio").hidden = favoritos.length > 0;
    $("resumo").textContent = resumo(favoritos);

    if (destacarId) {
      const nova = lista.querySelector(`[data-id="${destacarId}"]`);
      if (nova) {
        nova.classList.add("linha--nova");
        if (window.matchMedia("(max-width: 899px)").matches) {
          nova.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    }
  } catch {
    $("resumo").textContent = "Não foi possível carregar o ranking.";
  }
}

/* ---------- início ---------- */

montarNotas();
$("autor").value = lerAutor();

$("form-busca").addEventListener("submit", (e) => {
  e.preventDefault();
  buscar($("busca").value);
});
$("form-salvar").addEventListener("submit", salvar);
document.querySelectorAll(".sugestao").forEach((b) =>
  b.addEventListener("click", () => {
    $("busca").value = b.dataset.nome;
    buscar(b.dataset.nome);
  })
);

carregarLista();
