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

# Créer un stub complet du package local manquant AVANT l'install
RUN mkdir -p node_modules/@solana-trading-crm/types/src && \
    echo '{"name":"@solana-trading-crm/types","version":"1.0.0","main":"src/index.ts","types":"src/index.d.ts","exports":{".":{"types":"./src/index.d.ts"}}}' > node_modules/@solana-trading-crm/types/package.json && \
    echo 'export interface SniperooWalletDTO { id: string; publicKey: string; balance: number; createdAt?: string; } export interface SniperooPositionDTO { id: string; walletId: string; tokenAddress: string; tokenSymbol: string; tokenName: string; quantity: number; entryPrice: number; currentPrice: number; unrealizedPnL: number; unrealizedPnLPercent: number; status: "OPEN" | "CLOSED" | "PARTIAL"; createdAt: string; updatedAt: string; } export interface SniperooOrderDTO { id: string; walletId: string; type: "BUY" | "SELL"; tokenAddress: string; tokenSymbol: string; amount: number; price: number; status: "PENDING" | "EXECUTED" | "FAILED" | "CANCELLED"; signature?: string; createdAt: string; executedAt?: string; } export type WebSocketEventType = "position:created" | "position:updated" | "position:closed" | "order:executed" | "order:failed"; export interface WebSocketEventDTO { type: WebSocketEventType; data: SniperooPositionDTO | SniperooOrderDTO; timestamp: string; } export interface WalletDTO { id: string; name: string; publicKey: string; balance: number; isActive: boolean; createdAt: string; updatedAt: string; } export interface CreateWalletDTO { name: string; } export interface ImportWalletDTO { name: string; privateKey: string; } export interface WalletBalanceDTO { balance: number; } export interface WalletListDTO { wallets: WalletDTO[]; total: number; }' > node_modules/@solana-trading-crm/types/src/index.d.ts && \
    echo 'export interface SniperooWalletDTO { id: string; publicKey: string; balance: number; createdAt?: string; } export interface SniperooPositionDTO { id: string; walletId: string; tokenAddress: string; tokenSymbol: string; tokenName: string; quantity: number; entryPrice: number; currentPrice: number; unrealizedPnL: number; unrealizedPnLPercent: number; status: "OPEN" | "CLOSED" | "PARTIAL"; createdAt: string; updatedAt: string; } export interface SniperooOrderDTO { id: string; walletId: string; type: "BUY" | "SELL"; tokenAddress: string; tokenSymbol: string; amount: number; price: number; status: "PENDING" | "EXECUTED" | "FAILED" | "CANCELLED"; signature?: string; createdAt: string; executedAt?: string; } export type WebSocketEventType = "position:created" | "position:updated" | "position:closed" | "order:executed" | "order:failed"; export interface WebSocketEventDTO { type: WebSocketEventType; data: SniperooPositionDTO | SniperooOrderDTO; timestamp: string; } export interface WalletDTO { id: string; name: string; publicKey: string; balance: number; isActive: boolean; createdAt: string; updatedAt: string; } export interface CreateWalletDTO { name: string; } export interface ImportWalletDTO { name: string; privateKey: string; } export interface WalletBalanceDTO { balance: number; } export interface WalletListDTO { wallets: WalletDTO[]; total: number; }' > node_modules/@solana-trading-crm/types/src/index.ts

# Installer les dépendances
RUN npm install --no-save --legacy-peer-deps || true

# Vérifier et recréer le stub si nécessaire (au cas où npm l'aurait écrasé)
RUN if [ ! -f node_modules/@solana-trading-crm/types/src/index.ts ]; then \
    mkdir -p node_modules/@solana-trading-crm/types/src && \
    echo '{"name":"@solana-trading-crm/types","version":"1.0.0","main":"src/index.ts","types":"src/index.ts"}' > node_modules/@solana-trading-crm/types/package.json && \
    echo 'export interface SniperooWalletDTO { id: string; publicKey: string; balance: number; createdAt?: string; } export interface SniperooPositionDTO { id: string; walletId: string; tokenAddress: string; tokenSymbol: string; tokenName: string; quantity: number; entryPrice: number; currentPrice: number; unrealizedPnL: number; unrealizedPnLPercent: number; status: "OPEN" | "CLOSED" | "PARTIAL"; createdAt: string; updatedAt: string; } export interface SniperooOrderDTO { id: string; walletId: string; type: "BUY" | "SELL"; tokenAddress: string; tokenSymbol: string; amount: number; price: number; status: "PENDING" | "EXECUTED" | "FAILED" | "CANCELLED"; signature?: string; createdAt: string; executedAt?: string; } export type WebSocketEventType = "position:created" | "position:updated" | "position:closed" | "order:executed" | "order:failed"; export interface WebSocketEventDTO { type: WebSocketEventType; data: SniperooPositionDTO | SniperooOrderDTO; timestamp: string; } export interface WalletDTO { id: string; name: string; publicKey: string; balance: number; isActive: boolean; createdAt: string; updatedAt: string; } export interface CreateWalletDTO { name: string; } export interface ImportWalletDTO { name: string; privateKey: string; } export interface WalletBalanceDTO { balance: number; } export interface WalletListDTO { wallets: WalletDTO[]; total: number; }' > node_modules/@solana-trading-crm/types/src/index.ts; \
    fi

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

