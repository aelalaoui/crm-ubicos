FROM node:18-alpine AS builder

WORKDIR /app

COPY . ./

RUN ls -la && echo "=== Checking directory structure ===" && find . -maxdepth 3 -type d

RUN npm install

RUN cd apps/web && npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

# The standalone server.js is at the image root after copying the standalone folder
CMD ["node", "server.js"]
