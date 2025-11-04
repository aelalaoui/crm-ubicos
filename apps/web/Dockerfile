FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers du package local
COPY package*.json ./
COPY .npmrc* ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/

# Créer un répertoire pour le package local manquant
RUN mkdir -p node_modules/@solana-trading-crm/types && \
    echo '{"name":"@solana-trading-crm/types","version":"1.0.0"}' > node_modules/@solana-trading-crm/types/package.json && \
    mkdir -p node_modules/@solana-trading-crm/types/src && \
    echo 'export interface SniperooPositionDTO {} export interface SniperooOrderDTO {}' > node_modules/@solana-trading-crm/types/src/index.ts

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Récupère les variables d'environnement au build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

# Builder l'app
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
