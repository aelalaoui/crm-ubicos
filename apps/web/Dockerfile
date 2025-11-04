FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers du package local
COPY package*.json ./
COPY .npmrc* ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/

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

# Récupère les variables d'environnement au build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

# Builder l'app
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
