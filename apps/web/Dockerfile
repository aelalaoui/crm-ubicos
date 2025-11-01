FROM node:18-alpine AS builder

# Build from the repository root context
WORKDIR /workspace

# Copy all sources from the repo root (monorepo) and install/build
COPY . .
RUN npm install --workspaces
RUN npm run build:web

FROM node:18-alpine AS runner

# Run the standalone Next.js server from a clean image
WORKDIR /app
ENV NODE_ENV production

# Copy the standalone build (contains server.js, package.json and node_modules)
COPY --from=builder /workspace/apps/web/.next/standalone/ ./

# Copy the .next static files and public assets expected by the standalone server
COPY --from=builder /workspace/apps/web/.next/static ./.next/static
COPY --from=builder /workspace/apps/web/public ./public

EXPOSE 3000

# The standalone server.js is at the image root after copying the standalone folder
CMD ["node", "server.js"]
