FROM node:18-alpine AS builder

WORKDIR /app

COPY . ./

RUN npm install --workspaces --include-workspace-root

RUN npm run prisma:generate
RUN npm run build:api

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
