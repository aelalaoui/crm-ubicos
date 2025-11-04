FROM node:18-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers de configuration du monorepo depuis la racine
COPY package*.json ./
COPY .npmrc* ./

# Copier les packages partagés (types)
COPY packages/ ./packages/

# Copier tout le répertoire apps pour accéder aux autres apps si nécessaire
COPY apps/ ./apps/

# Installer les dépendances pour tout le monorepo
RUN npm install

# Générer Prisma pour l'API
RUN npm run prisma:generate --workspace=apps/api

# Builder l'app API
RUN npm run build --workspace=apps/api

FROM node:18-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV production

# Copier les fichiers compilés depuis le builder
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]