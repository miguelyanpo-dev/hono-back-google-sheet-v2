import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app';
import { config } from './config/config';

// For local development with @hono/node-server
if (process.env.NODE_ENV !== 'production') {
  console.log(`Starting server on port ${config.port}...`);
  serve({
    fetch: app.fetch,
    port: config.port,
  });
  console.log(`El servidor está corriendo en http://localhost:${config.port}`);
}

// For Vercel (@vercel/node expects CommonJS export)
// This will be used when deployed to Vercel
export default app;

// Also export as module.exports for CommonJS compatibility
module.exports = app;
