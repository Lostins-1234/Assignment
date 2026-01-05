# Fuel EU Maritime Compliance Platform

A full-stack application for managing Fuel EU Maritime compliance, featuring route management, compliance balance calculation, banking, and pooling functionality.

## Overview

This platform implements key features of the Fuel EU Maritime Regulation (EU) 2023/1805, including:

- **Route Management:** Track vessel routes with GHG intensity, fuel consumption, and emissions data
- **Comparison Analysis:** Compare routes against baseline and target intensity (89.3368 gCO₂e/MJ)
- **Banking:** Bank surplus compliance balance for future use (Article 20)
- **Pooling:** Create pools to share compliance balance across ships (Article 21)

## Architecture Summary

The application follows **Hexagonal Architecture** (Ports & Adapters / Clean Architecture) principles:

```
Backend:
  core/
    domain/          # Domain entities and business logic
    application/     # Use cases and service implementations
    ports/
      inbound/       # Service interfaces (what the app needs)
      outbound/      # Repository interfaces (what the app uses)
  adapters/
    inbound/http/    # Express route handlers
    outbound/postgres/ # Prisma repository implementations
  infrastructure/
    db/             # Database migrations and seeds
    server/         # Express server setup

Frontend:
  core/
    domain/          # TypeScript domain models
    application/     # Service implementations
    ports/
      inbound/       # Service interfaces
      outbound/      # API client interface
  adapters/
    ui/              # React components
    infrastructure/  # Axios API client
  shared/
    hooks/           # React hooks (useServices)
```

### Key Principles:

1. **Dependency Inversion:** Core depends on interfaces (ports), not implementations
2. **Separation of Concerns:** Business logic isolated from frameworks and infrastructure
3. **Testability:** Core domain and use cases can be tested without external dependencies
4. **Flexibility:** Easy to swap implementations (e.g., different database, UI framework)

## Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 12+ (or use Docker)
- **Git**

## Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

**For Local Development:**
```bash
# Create .env file
# See DATABASE_SETUP.md for local PostgreSQL setup
```

**For Remote/Cloud Database (Recommended for Deployment):**
```bash
# See DATABASE_SETUP_REMOTE.md for setup instructions
# Popular options: Supabase, Railway, Heroku Postgres, Neon, AWS RDS
```

Example `.env` file:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
PORT=3001
NODE_ENV=production
```

> **Quick Start with Remote DB:** 
> - **Neon (Recommended):** See [DATABASE_SETUP_NEON.md](./backend/DATABASE_SETUP_NEON.md) for detailed setup
> - **Other options:** See [DATABASE_SETUP_REMOTE.md](./backend/DATABASE_SETUP_REMOTE.md) for Supabase, Railway, Heroku, etc.

4. **Set up database:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

5. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running Tests

### Backend Tests:
```bash
cd backend
npm test
```

### Frontend Tests:
```bash
cd frontend
npm test
```

## API Endpoints

### Routes
- `GET /routes` - Get all routes (with optional filters: vesselType, fuelType, year)
- `POST /routes/:routeId/baseline` - Set a route as baseline
- `GET /routes/comparison` - Get baseline vs comparison routes

### Compliance
- `GET /compliance/cb?shipId=XXX&year=YYYY` - Get compliance balance
- `GET /compliance/adjusted-cb?shipId=XXX&year=YYYY` - Get adjusted CB (after banking)
- `POST /compliance/calculate` - Calculate and store CB from route

### Banking
- `GET /banking/records?shipId=XXX&year=YYYY` - Get bank records
- `POST /banking/bank` - Bank surplus CB
  ```json
  {
    "shipId": "R001",
    "year": 2024,
    "amountGco2eq": 1000.0
  }
  ```
- `POST /banking/apply` - Apply banked amount to deficit
  ```json
  {
    "shipId": "R001",
    "year": 2024,
    "amountGco2eq": 500.0
  }
  ```

### Pooling
- `POST /pools` - Create a pool
  ```json
  {
    "year": 2024,
    "memberShipIds": ["R001", "R002", "R003"]
  }
  ```

## Sample Data

The seed script creates 5 routes:
- R001: Container, HFO, 2024 (Baseline)
- R002: BulkCarrier, LNG, 2024
- R003: Tanker, MGO, 2024
- R004: RoRo, HFO, 2025
- R005: Container, LNG, 2025

## Key Formulas

### Compliance Balance (CB):
```
Energy in scope (MJ) = fuelConsumption (t) × 41,000 MJ/t
CB (gCO₂eq) = (Target Intensity - Actual Intensity) × Energy in scope
```

Where:
- **Target Intensity (2025):** 89.3368 gCO₂e/MJ (2% below 91.16)
- **Positive CB:** Surplus (compliant)
- **Negative CB:** Deficit (non-compliant)

### Percent Difference:
```
percentDiff = ((comparison / baseline) - 1) × 100
```

## Database Schema

- **routes:** Route data with GHG intensity and fuel consumption
- **ship_compliance:** Calculated compliance balance per ship/year
- **bank_entries:** Banked surplus amounts
- **pools:** Pool registry
- **pool_members:** Pool member allocations with before/after CB

## Development Commands

### Backend:
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npm test             # Run tests
```

### Frontend:
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

## Project Structure

```
fuel-eu-maritime/
├── backend/
│   ├── src/
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── ports/
│   │   ├── adapters/
│   │   │   ├── inbound/http/
│   │   │   └── outbound/postgres/
│   │   └── infrastructure/
│   ├── prisma/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   ├── adapters/
│   │   └── shared/
│   └── package.json
├── AGENT_WORKFLOW.md
├── README.md
└── REFLECTION.md
```

## Screenshots / Sample Requests

### Routes Tab
- Displays all routes in a table
- Filter by vessel type, fuel type, and year
- Set baseline route with one click

### Compare Tab
- Visual comparison chart (bar chart)
- Table showing percent difference and compliance status
- Target intensity indicator

### Banking Tab
- Display current compliance balance
- Bank surplus amounts
- Apply banked amounts to deficits
- Validation prevents invalid operations

### Pooling Tab
- Select multiple ships for pooling
- View before/after CB for each member
- Pool sum indicator (green if valid, red if invalid)
- Create pool with greedy allocation algorithm

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists: `createdb fuel_eu`

### Port Conflicts
- Backend default: 3001
- Frontend default: 3000
- Change in .env (backend) or vite.config.ts (frontend)

### Prisma Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

## License

ISC

## References

- Fuel EU Maritime Regulation (EU) 2023/1805
- Annex IV: Calculation methodologies
- Articles 20-21: Banking and Pooling rules
