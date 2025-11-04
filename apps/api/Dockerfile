FROM node:18-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers du package local
COPY package*.json ./
COPY .npmrc* ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./

# Copier le code source
COPY src/ ./src/
COPY prisma/ ./prisma/

# Créer un répertoire pour le package local manquant
RUN mkdir -p node_modules/@solana-trading-crm/types && \
    echo '{"name":"@solana-trading-crm/types","version":"1.0.0"}' > node_modules/@solana-trading-crm/types/package.json && \
    mkdir -p node_modules/@solana-trading-crm/types/src && \
    echo 'export interface SniperooPositionDTO {} export interface SniperooOrderDTO {}' > node_modules/@solana-trading-crm/types/src/index.ts

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Générer Prisma
RUN npm run prisma:generate

# Builder l'app
RUN npm run build

FROM node:18-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV production

# Copier les fichiers compilés depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

