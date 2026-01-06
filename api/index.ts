// Vercel serverless function wrapper for Express backend
// This file is used by Vercel to create serverless functions for the API routes

import app from '../backend/src/infrastructure/server/index';

// Export the Express app as the default export for Vercel
export default app;
