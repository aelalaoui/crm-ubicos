# Phase 2: Sniperoo Integration - Implementation Guide

## Overview
This document describes the complete Phase 2 implementation for integrating the Sniperoo API for Solana wallet management and trading.

## Architecture

### Backend (NestJS)

#### 1. Sniperoo Service (`apps/api/src/sniperoo/sniperoo.service.ts`)
- **Purpose**: Handles all communication with Sniperoo API
- **Features**:
  - Retry logic with exponential backoff (3 attempts max)
  - Comprehensive error handling
  - Rate limiting support
  - All REST endpoints implemented
  - Logging for debugging

**Key Methods**:
- `createWallet(name)` - Create new wallet
- `importWallet(name, privateKey)` - Import existing wallet
- `getWallet(walletId)` - Get wallet details
- `listWallets()` - List all wallets
- `deleteWallet(walletId)` - Delete wallet
- `getWalletBalance(walletId)` - Get current balance
- `buy(params)` - Execute buy order
- `sell(params)` - Execute sell order
- `getPositions(walletId)` - Get open positions
- `getOrders(walletId)` - Get orders
- `closePosition(positionId)` - Close position

#### 2. Wallets Service (`apps/api/src/wallets/wallets.service.ts`)
- **Purpose**: Manages wallet operations with encryption
- **Features**:
  - AES-256-GCM encryption for private keys
  - PBKDF2 key derivation from user password
  - Sniperoo integration
  - Database synchronization
  - Balance tracking

**Key Methods**:
- `create(userId, dto, password)` - Create wallet with encryption
- `import(userId, dto, password)` - Import wallet with encryption
- `findAll(userId)` - List user wallets
- `findOne(id, userId)` - Get wallet details
- `delete(id, userId)` - Delete wallet
- `getBalance(id, userId)` - Get wallet balance
- `syncBalance(id)` - Sync balance from Sniperoo

#### 3. WebSocket Gateway (`apps/api/src/gateway/websocket.gateway.ts`)
- **Purpose**: Real-time updates for positions and orders
- **Features**:
  - JWT authentication
  - Room-based subscriptions
  - Event relay from Sniperoo
  - Auto-reconnection support
  - User isolation

**Events**:
- `subscribe:positions` - Subscribe to position updates
- `subscribe:orders` - Subscribe to order updates
- `position:created` - New position opened
- `position:updated` - Position updated
- `position:closed` - Position closed
- `order:executed` - Order executed
- `order:failed` - Order failed

### Frontend (Next.js)

#### 1. API Client (`apps/web/src/lib/api/wallets.ts`)
- Axios instance with JWT authentication
- Methods for all wallet operations
- Automatic token injection

#### 2. React Query Hooks (`apps/web/src/lib/api/queries.ts`)
- `useWallets()` - Fetch all wallets
- `useWallet(id)` - Fetch single wallet
- `useWalletBalance(id)` - Fetch wallet balance
- `useCreateWallet()` - Create wallet mutation
- `useImportWallet()` - Import wallet mutation
- `useDeleteWallet()` - Delete wallet mutation

#### 3. Socket.io Client (`apps/web/src/lib/socket/socket.ts`)
- Connection management
- Event subscriptions
- Auto-reconnection
- Event listeners

#### 4. Components
- `CreateWalletDialog` - Create wallet form
- `ImportWalletDialog` - Import wallet form
- `WalletCard` - Wallet display card
- `WalletList` - Wallet list container

#### 5. Pages
- `/wallets` - Wallet list page
- `/wallets/[id]` - Wallet detail page

## Security Implementation

### Private Key Encryption
```typescript
// Encryption process:
1. Generate random salt (16 bytes)
2. Derive key from password using PBKDF2 (100,000 iterations)
3. Generate random IV (16 bytes)
4. Encrypt private key using AES-256-GCM
5. Get authentication tag
6. Store: salt:iv:authTag:encryptedKey

// Decryption process:
1. Parse stored data to extract salt, iv, authTag, encrypted
2. Derive key from password using same salt
3. Decrypt using AES-256-GCM with authTag
4. Return decrypted private key
```

### Best Practices
- Private keys never stored in plain text
- Encryption key derived from user password
- Authentication tag prevents tampering
- Salt prevents rainbow table attacks
- PBKDF2 with 100,000 iterations for key derivation

## Environment Variables

### Backend (.env)
```
# Sniperoo API
SNIPEROO_API_URL=https://api.sniperoo.app
SNIPEROO_API_KEY=your_api_key_here
SNIPEROO_WS_URL=wss://ws.sniperoo.app

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Endpoints

### Wallets
- `POST /wallets` - Create wallet
- `POST /wallets/import` - Import wallet
- `GET /wallets` - List wallets
- `GET /wallets/:id` - Get wallet
- `GET /wallets/:id/balance` - Get balance
- `DELETE /wallets/:id` - Delete wallet

### WebSocket
- `ws://localhost:3001/socket.io`
- Events: `subscribe:positions`, `subscribe:orders`, `position:created`, etc.

## Error Handling

### Backend
- Retry logic with exponential backoff
- Comprehensive error logging
- User-friendly error messages
- Validation errors from Zod/class-validator

### Frontend
- Toast notifications for errors
- Error boundaries for React components
- Fallback UI states
- Network error handling

## Testing

### Backend
```bash
npm run test --workspace=apps/api
npm run test:cov --workspace=apps/api
```

### Frontend
```bash
npm run test --workspace=apps/web
```

## Deployment

### Docker
```bash
docker-compose up -d
```

### Environment Setup
1. Set all required environment variables
2. Run database migrations: `npm run prisma:migrate:deploy`
3. Start backend: `npm run start:prod --workspace=apps/api`
4. Start frontend: `npm run start --workspace=apps/web`

## Rate Limiting

- 100 requests per minute per user
- Configured in `ThrottlerModule`
- Applied to all protected routes

## Monitoring

### Logs
- Sniperoo service logs all API calls
- WebSocket gateway logs connections
- Error logging for debugging

### Metrics
- Track wallet creation/import
- Monitor balance updates
- Track order execution
- Monitor WebSocket connections

## Future Enhancements

1. **Advanced Trading**
   - Limit orders
   - Stop-loss orders
   - Trailing stops
   - DCA (Dollar Cost Averaging)

2. **Analytics**
   - Portfolio performance
   - Trade history
   - P&L tracking
   - Risk metrics

3. **Automation**
   - Trading strategies
   - Scheduled trades
   - Alerts and notifications

4. **Multi-Wallet**
   - Portfolio view
   - Cross-wallet operations
   - Consolidated reporting

## Troubleshooting

### Connection Issues
- Check SNIPEROO_API_URL and SNIPEROO_API_KEY
- Verify network connectivity
- Check firewall rules

### Encryption Issues
- Ensure password is correct
- Check salt/IV format
- Verify AES-256-GCM support

### WebSocket Issues
- Check FRONTEND_URL configuration
- Verify JWT token validity
- Check CORS settings

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f api`
2. Review error messages
3. Check Sniperoo API documentation: https://sniperoo.redocly.app/
