# Solana Trading CRM

A full-stack automated trading platform for Solana blockchain with wallet management, position tracking, and real-time trading capabilities.

## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **JWT** - Authentication with refresh tokens
- **Passport** - Authentication middleware
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Railway** - Cloud deployment
- **GitHub Actions** - CI/CD pipeline

## 📁 Project Structure

```
solana-trading-crm/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── users/         # User management
│   │   │   ├── wallets/       # Wallet management
│   │   │   ├── sniperoo/      # Sniperoo integration (Phase 2)
│   │   │   ├── prisma/        # Prisma service
│   │   │   ├── common/        # Shared utilities
│   │   │   └── config/        # Configuration files
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Database schema
│   │   └── package.json
│   │
│   └── web/                    # Next.js Frontend
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # React components
│       │   ├── lib/           # Utilities and API clients
│       │   └── store/         # Zustand stores
│       └── package.json
│
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
├── .github/workflows/          # CI/CD pipelines
└── package.json                # Root package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd solana-trading-crm
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Backend (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/solana_trading_crm_dev"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
SNIPEROO_API_URL=https://api.sniperoo.io
SNIPEROO_API_KEY=your-sniperoo-api-key
```

Frontend (`apps/web/.env.local`):
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

4. **Start development databases**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Run database migrations**
```bash
npm run prisma:migrate:dev --workspace=apps/api
```

6. **Generate Prisma Client**
```bash
npm run prisma:generate --workspace=apps/api
```

7. **Start development servers**

In separate terminals:

```bash
# Backend
npm run dev --workspace=apps/api

# Frontend
npm run dev --workspace=apps/web
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose up -d
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:3001/api/docs for interactive Swagger documentation.

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Wallets
- `POST /api/wallets` - Create new wallet
- `POST /api/wallets/import` - Import existing wallet
- `GET /api/wallets` - Get all user wallets
- `GET /api/wallets/:id` - Get wallet details
- `DELETE /api/wallets/:id` - Delete wallet

## 🗄️ Database Schema

### User
- Authentication and profile information
- Plan management (FREE, BASIC, PRO, ENTERPRISE)
- Email verification

### Wallet
- Solana wallet management
- Encrypted private keys
- Balance tracking

### Position
- Trading position tracking
- P&L calculation
- Status management (OPEN, CLOSED)

### Transaction
- Trade history
- Buy/Sell operations
- Status tracking

### Alert
- Price alerts
- Custom conditions
- Notification management

## 🔐 Authentication

The application uses JWT-based authentication with refresh tokens:

1. User registers or logs in
2. Server returns access token (15min) and refresh token (7 days)
3. Access token is used for API requests
4. When access token expires, refresh token is used to get new access token
5. Tokens are stored in localStorage and managed by Zustand

## 🎨 Frontend Features

- **Authentication Pages**: Login and Register with form validation
- **Dashboard**: Overview of wallets, positions, and P&L
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Dark Mode Ready**: Theme system with CSS variables
- **Type-Safe**: Full TypeScript coverage
- **State Management**: Zustand for global state, React Query for server state

## 🚀 Deployment

### Quick Deploy to Railway

**Option 1: One-Click Deploy (Easiest)**

See [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md) for a step-by-step guide.

**Option 2: Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Add databases
railway add --database postgresql
railway add --database redis

# Set environment variables
railway variables set JWT_SECRET=your-secret-key
railway variables set JWT_REFRESH_SECRET=your-refresh-secret
railway variables set NODE_ENV=production

# Deploy
railway up

# Run migrations
railway run npm run prisma:migrate:deploy --workspace=apps/api
```

**Option 3: CI/CD with GitHub Actions**

The project includes automated deployment via GitHub Actions.

Configure these secrets in your GitHub repository (Settings → Secrets and variables → Actions):
- `RAILWAY_TOKEN` - Get from Railway: Settings → Tokens
- `RAILWAY_API_SERVICE` - Your API service ID from Railway
- `RAILWAY_WEB_SERVICE` - Your Web service ID from Railway

Push to `main` or `master` branch to trigger automatic deployment.

### Detailed Deployment Guides

- 📖 **Full Guide**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Complete deployment documentation
- 🚀 **Quick Start**: [RAILWAY_QUICKSTART.md](./RAILWAY_QUICKSTART.md) - Get deployed in 10 minutes
- 🛠️ **Setup Scripts**:
  - Linux/Mac: `bash scripts/railway-setup.sh`
  - Windows: `scripts\railway-setup.bat`

### Environment Variables for Production

**API Service** (`.env.railway.api`):
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-secure-secret-min-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-min-32-chars
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-url.railway.app
```

**Web Service** (`.env.railway.web`):
```env
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
NEXT_PUBLIC_WS_URL=wss://your-api-url.railway.app
NODE_ENV=production
```

### Other Deployment Options

The application can also be deployed to:
- **Vercel** (Frontend) + **Railway** (Backend)
- **Netlify** (Frontend) + **Railway** (Backend)
- **AWS** (ECS/Fargate)
- **Google Cloud Run**
- **Azure Container Apps**
- **Self-hosted** with Docker Compose

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for more deployment options.

## 📝 Development Scripts

### Root
```bash
npm run dev              # Start all services in dev mode
npm run build            # Build all applications
npm run lint             # Lint all code
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
```

### Backend (apps/api)
```bash
npm run dev --workspace=apps/api              # Start dev server
npm run build --workspace=apps/api            # Build for production
npm run start --workspace=apps/api            # Start production server
npm run prisma:generate --workspace=apps/api  # Generate Prisma Client
npm run prisma:migrate:dev --workspace=apps/api  # Run migrations
npm run prisma:studio --workspace=apps/api    # Open Prisma Studio
```

### Frontend (apps/web)
```bash
npm run dev --workspace=apps/web      # Start dev server
npm run build --workspace=apps/web    # Build for production
npm run start --workspace=apps/web    # Start production server
npm run lint --workspace=apps/web     # Lint code
```

## 🔧 Configuration

### Database
- PostgreSQL 15+ required
- Connection pooling enabled
- Migrations managed by Prisma

### Redis
- Used for caching and session management
- Optional but recommended for production

### JWT
- Access tokens: 15 minutes
- Refresh tokens: 7 days
- Secure HTTP-only cookies recommended for production

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] Project setup and architecture
- [x] Authentication system
- [x] User management
- [x] Wallet CRUD operations
- [x] Basic frontend UI
- [x] Docker setup
- [x] CI/CD pipeline

### Phase 2 (Next)
- [ ] Sniperoo API integration
- [ ] Real wallet creation and import
- [ ] Trading functionality (Buy/Sell)
- [ ] Position tracking
- [ ] Transaction history
- [ ] WebSocket for real-time updates

### Phase 3 (Future)
- [ ] Price alerts
- [ ] Advanced analytics
- [ ] Portfolio management
- [ ] Multi-wallet support
- [ ] Trading strategies
- [ ] Automated trading bots

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation at `/api/docs`

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Next.js team for the best React framework
- shadcn for the beautiful UI components
- Prisma team for the excellent ORM

---

Built with ❤️ for the Solana community
