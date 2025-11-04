FROM node:18-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copier tout le contexte de build (racine du monorepo)
COPY . ./

# Installer les dépendances pour tout le monorepo et les workspaces
RUN npm install --workspaces --include-workspace-root

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