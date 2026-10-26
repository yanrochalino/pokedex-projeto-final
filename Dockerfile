# ---------- Estagio 1: instala dependencias (com ferramentas de compilacao) ----------
FROM node:20-slim AS deps
WORKDIR /app

# better-sqlite3 usa binario pre-compilado; as ferramentas abaixo sao o plano B
# caso o download do binario falhe (ex.: arquitetura sem prebuild).
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

# ---------- Estagio 2: imagem final, enxuta ----------
FROM node:20-slim
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY public ./public

# O banco SQLite fica em /app/data (monte um volume para nao perder os dados)
ENV PORT=3000
ENV DB_PATH=/app/data/pokedex.db
RUN mkdir -p /app/data && chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "src/server.js"]
