FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers racine du monorepo
COPY package*.json ./
COPY .npmrc* ./

# Copier les packages et apps
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN npm install --workspaces --include-workspace-root

# Récupère les variables d'environnement au build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

RUN npm run build --workspace=apps/web

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
