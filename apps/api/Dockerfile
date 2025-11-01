FROM node:18-alpine AS builder

RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

COPY . ./

RUN npm install

RUN npm run prisma:generate
RUN npm run build

FROM node:18-alpine AS runner

RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]