import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { RouteService } from '../../core/application/RouteService';
import { ComplianceService } from '../../core/application/ComplianceService';
import { BankingService } from '../../core/application/BankingService';
import { PoolService } from '../../core/application/PoolService';
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository';
import { PrismaComplianceRepository } from '../../adapters/outbound/postgres/PrismaComplianceRepository';
import { PrismaBankingRepository } from '../../adapters/outbound/postgres/PrismaBankingRepository';
import { PrismaPoolRepository } from '../../adapters/outbound/postgres/PrismaPoolRepository';
import { createRoutesRouter } from '../../adapters/inbound/http/routes/routesRouter';
import { createComplianceRouter } from '../../adapters/inbound/http/routes/complianceRouter';
import { createBankingRouter } from '../../adapters/inbound/http/routes/bankingRouter';
import { createPoolRouter } from '../../adapters/inbound/http/routes/poolRouter';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Prisma
const prisma = new PrismaClient();

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    console.error('Please check your DATABASE_URL in .env file');
  });

// Initialize repositories (outbound adapters)
const routeRepository = new PrismaRouteRepository(prisma);
const complianceRepository = new PrismaComplianceRepository(prisma);
const bankingRepository = new PrismaBankingRepository(prisma);
const poolRepository = new PrismaPoolRepository(prisma);

// Initialize services (application layer)
const routeService = new RouteService(routeRepository);
const complianceService = new ComplianceService(routeRepository, complianceRepository, bankingRepository);
const bankingService = new BankingService(complianceRepository, bankingRepository);
const poolService = new PoolService(complianceRepository, poolRepository);

// Initialize routers (inbound adapters)
app.use('/', createRoutesRouter(routeService));
app.use('/', createComplianceRouter(complianceService));
app.use('/', createBankingRouter(bankingService));
app.use('/', createPoolRouter(poolService));

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Fuel EU Maritime Compliance API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      routes: {
        getAll: 'GET /routes',
        comparison: 'GET /routes/comparison',
        setBaseline: 'POST /routes/:routeId/baseline',
      },
      compliance: {
        getCB: 'GET /compliance/cb?shipId=XXX&year=YYYY',
        getAdjustedCB: 'GET /compliance/adjusted-cb?shipId=XXX&year=YYYY',
        calculate: 'POST /compliance/calculate',
      },
      banking: {
        getRecords: 'GET /banking/records?shipId=XXX&year=YYYY',
        bank: 'POST /banking/bank',
        apply: 'POST /banking/apply',
      },
      pooling: {
        createPool: 'POST /pools',
      },
    },
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      error: (error as Error).message 
    });
  }
});

// Global error handler middleware (must be last)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`${new Date().toISOString()} - Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Export app for Vercel serverless functions
export default app;

// Start server only if not in serverless environment
if (process.env.VERCEL !== '1' && require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (!process.env.DATABASE_URL) {
      console.warn('WARNING: DATABASE_URL not set in environment variables');
    }
  });

  // Handle port already in use error
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${port} is already in use!`);
      console.error(`\nTo fix this:`);
      console.error(`1. Kill the process using port ${port}:`);
      console.error(`   Windows PowerShell: Get-NetTCPConnection -LocalPort ${port} | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force`);
      console.error(`   Or use: .\\kill-port.ps1 ${port}`);
      console.error(`2. Or change the port in .env file: PORT=3002`);
      console.error(`\nCurrent process will exit.`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      throw error;
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
