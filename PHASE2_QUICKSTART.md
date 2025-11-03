# Phase 2 Quick Start Guide

## 5-Minute Setup

### 1. Clone and Install
```bash
git clone <repo>
cd crm-ubicos
npm install
```

### 2. Environment Setup
Create `.env` files:

**apps/api/.env**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db
JWT_SECRET=dev-secret-key
SNIPEROO_API_URL=https://api.sniperoo.app
SNIPEROO_API_KEY=your_api_key_here
SNIPEROO_WS_URL=wss://ws.sniperoo.app
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
npm run prisma:migrate:dev --workspace=apps/api
```

### 4. Start Development
```bash
# Terminal 1: Backend
npm run dev:api

# Terminal 2: Frontend
npm run dev:web
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- API Docs: http://localhost:3001/api/docs

## Key Features Implemented

### ✅ Backend
- [x] Sniperoo API integration with retry logic
- [x] Wallet creation and import with encryption
- [x] Private key encryption (AES-256-GCM)
- [x] WebSocket gateway for real-time updates
- [x] Balance synchronization
- [x] Error handling and logging

### ✅ Frontend
- [x] Wallet management pages
- [x] Create/Import wallet dialogs
- [x] Wallet list and detail views
- [x] React Query integration
- [x] Socket.io real-time updates
- [x] Form validation with Zod

### ✅ Security
- [x] JWT authentication
- [x] Private key encryption
- [x] PBKDF2 key derivation
- [x] CORS configuration
- [x] Rate limiting

## API Endpoints

### Wallets
```bash
# Create wallet
POST /api/wallets
{
  "name": "My Wallet"
}

# Import wallet
POST /api/wallets/import
{
  "name": "Imported Wallet",
  "privateKey": "base58_key"
}

# List wallets
GET /api/wallets

# Get wallet
GET /api/wallets/:id

# Get balance
GET /api/wallets/:id/balance

# Delete wallet
DELETE /api/wallets/:id
```

## WebSocket Events

```javascript
// Connect
const socket = io('http://localhost:3001', {
  auth: { token: 'jwt_token' }
});

// Subscribe to positions
socket.emit('subscribe:positions', { walletId: 'wallet_id' });

// Listen to events
socket.on('position:created', (position) => {
  console.log('New position:', position);
});

socket.on('position:updated', (position) => {
  console.log('Position updated:', position);
});

socket.on('order:executed', (order) => {
  console.log('Order executed:', order);
});
```

## Testing

### Backend Tests
```bash
npm run test --workspace=apps/api
npm run test:cov --workspace=apps/api
```

### Frontend Tests
```bash
npm run test --workspace=apps/web
```

## Troubleshooting

### Port 3001 already in use
```bash
lsof -i :3001
kill -9 <PID>
```

### Database connection error
```bash
# Check PostgreSQL
docker-compose ps
docker-compose logs postgres

# Verify connection string
echo $DATABASE_URL
```

### Sniperoo API error
```bash
# Verify API key
echo $SNIPEROO_API_KEY

# Test connection
curl -H "Authorization: Bearer $SNIPEROO_API_KEY" \
  https://api.sniperoo.app/wallets
```

## Next Steps

1. **Test Wallet Creation**
   - Go to http://localhost:3000/dashboard/wallets
   - Click "Create Wallet"
   - Enter wallet name and submit

2. **Monitor Real-time Updates**
   - Open browser DevTools
   - Check WebSocket connection in Network tab
   - Create a wallet and watch for events

3. **Explore API**
   - Visit http://localhost:3001/api/docs
   - Try endpoints with Swagger UI

4. **Review Code**
   - Backend: `apps/api/src/sniperoo/`
   - Frontend: `apps/web/src/components/wallets/`
   - Types: `packages/types/src/`

## Documentation

- [Phase 2 Implementation Guide](./PHASE2_IMPLEMENTATION.md)
- [Environment Setup](./PHASE2_ENV_SETUP.md)
- [Sniperoo API Docs](https://sniperoo.redocly.app/)

## Support

For issues:
1. Check logs: `docker-compose logs -f api`
2. Review error messages in browser console
3. Check environment variables
4. Verify Sniperoo API key is valid

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Pages: /wallets, /wallets/[id]                 │   │
│  │  Components: WalletCard, WalletList, Dialogs    │   │
│  │  Hooks: useWallets, useCreateWallet, etc.       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers: WalletsController                  │   │
│  │  Services: WalletsService, SniperooService       │   │
│  │  Gateway: WebSocketGateway                       │   │
│  │  Database: Prisma + PostgreSQL                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────┐
│                  Sniperoo API                            │
│  ├─ Wallet Management                                   │
│  ├─ Trading (Buy/Sell)                                  │
│  ├─ Positions & Orders                                  │
│  └─ Real-time Updates (WebSocket)                       │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
apps/
├── api/
│   └── src/
│       ├── sniperoo/
│       │   ├── sniperoo.service.ts
│       │   ├── sniperoo.module.ts
│       │   └── interfaces/
│       │       └── sniperoo.types.ts
│       ├── wallets/
│       │   ├── wallets.service.ts
│       │   ├── wallets.controller.ts
│       │   ├── wallets.module.ts
│       │   └── dto/
│       ├── gateway/
│       │   ├── websocket.gateway.ts
│       │   └── gateway.module.ts
│       └── app.module.ts
└── web/
    └── src/
        ├── app/
        │   └── (dashboard)/
        │       └── wallets/
        │           ├── page.tsx
        │           └── [id]/
        │               └── page.tsx
        ├── components/
        │   └── wallets/
        │       ├── create-wallet-dialog.tsx
        │       ├── import-wallet-dialog.tsx
        │       ├── wallet-card.tsx
        │       └── wallet-list.tsx
        └── lib/
            ├── api/
            │   ├── wallets.ts
            │   └── queries.ts
            ├── socket/
            │   ├── socket.ts
            │   └── socket-context.tsx
            ├── schemas/
            │   └── wallet.schema.ts
            └── types/
                └── wallet.types.ts

packages/
└── types/
    └── src/
        ├── wallet.types.ts
        ├── sniperoo.types.ts
        └── index.ts
```

## Performance Tips

1. **Caching**
   - React Query caches wallet data for 30 seconds
   - Balance updates every 10 seconds

2. **Optimization**
   - Lazy load wallet details
   - Paginate wallet lists for large portfolios
   - Debounce balance updates

3. **Monitoring**
   - Check API response times
   - Monitor WebSocket connection stability
   - Track error rates

## Security Checklist

- [x] Private keys encrypted with AES-256-GCM
- [x] JWT authentication on all endpoints
- [x] CORS configured for frontend
- [x] Rate limiting enabled
- [x] Input validation with Zod/class-validator
- [x] Error messages don't leak sensitive info
- [x] Environment variables for secrets
- [x] HTTPS recommended for production

Ready to start? Run `npm run dev` and visit http://localhost:3000! 🚀
