# Phase 2 Environment Setup

## Required Environment Variables

### Backend (apps/api/.env)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=24h

# Sniperoo API Configuration
SNIPEROO_API_URL=https://api.sniperoo.app
SNIPEROO_API_KEY=your_sniperoo_api_key_here
SNIPEROO_WS_URL=wss://ws.sniperoo.app

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development
```

### Frontend (apps/web/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Setup Instructions

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate --workspace=apps/api

# Run migrations
npm run prisma:migrate:dev --workspace=apps/api

# Start development server
npm run dev:api
```

### 2. Frontend Setup

```bash
# Install dependencies (already done in root)
npm install

# Start development server
npm run dev:web
```

### 3. Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Sniperoo API Key Setup

1. Go to https://sniperoo.redocly.app/
2. Create an account or login
3. Generate API key from dashboard
4. Add to `.env` file as `SNIPEROO_API_KEY`

## Database Setup

### PostgreSQL (Local)

```bash
# Create database
createdb crm_db

# Run migrations
npm run prisma:migrate:dev --workspace=apps/api
```

### Docker PostgreSQL

```bash
# Already configured in docker-compose.yml
docker-compose up -d postgres
```

## Testing the Integration

### 1. Create a Wallet

```bash
curl -X POST http://localhost:3001/api/wallets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Wallet"}'
```

### 2. List Wallets

```bash
curl -X GET http://localhost:3001/api/wallets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Wallet Balance

```bash
curl -X GET http://localhost:3001/api/wallets/:id/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. WebSocket Connection

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.emit('subscribe:positions', { walletId: 'wallet_id' });
socket.on('position:created', (position) => {
  console.log('New position:', position);
});
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
psql -U postgres -d crm_db -c "SELECT 1"

# Check connection string in .env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Sniperoo API Error

```bash
# Verify API key
echo $SNIPEROO_API_KEY

# Test API connection
curl -H "Authorization: Bearer $SNIPEROO_API_KEY" \
  https://api.sniperoo.app/wallets
```

### WebSocket Connection Failed

```bash
# Check CORS settings
# Verify FRONTEND_URL in backend .env
# Check JWT token validity
```

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- Backend: NestJS watch mode
- Frontend: Next.js fast refresh

### Database Studio

```bash
npm run prisma:studio --workspace=apps/api
```

Opens Prisma Studio at http://localhost:5555

### API Documentation

Swagger documentation available at:
- http://localhost:3001/api/docs

## Production Deployment

See `DEPLOYMENT_SETUP_COMPLETE.md` for production setup instructions.
