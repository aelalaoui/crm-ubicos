FROM node:18-alpine AS builder

WORKDIR /app

RUN ls -la && echo "=== Checking directory structure ===" && find . -maxdepth 3 -type d

COPY . ./

RUN npm install

RUN npm run prisma:generate
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
