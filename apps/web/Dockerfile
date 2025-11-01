FROM node:18-alpine AS builder

WORKDIR /app

COPY . ./

RUN npm install

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --ui.next/stat01 ne.next/stat
--chown=js:nodejs pp/publpublic

USER j
COPY --from=builder /app/.next/standalone ./
<<<<<<< HEAD
COPY E 3000

-NV-PORT=f000
ENV HOSTNAME="0.r.o.m"=builder /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
=======
COPY --from=builder /app/.next/static ./.next/static
>>>>>>> 36440ed8c73d6f90a245cd0ee153884253298f52

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
