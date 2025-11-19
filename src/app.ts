import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from './middlewares/logger';
import { config } from './config/config';
import itemsRouter from './routes/items.routes';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: config.cors.origins,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 600,
  credentials: true,
}));

// Logger middleware
app.use('*', logger());

// Health check
app.get('/', (c) => {
  return c.json({ 
    ok: true, 
    service: 'hono-crud-api',
    version: '0.1.0',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.route('/api/items', itemsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ 
    success: false,
    error: 'Not Found', 
    path: c.req.path 
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ 
    success: false,
    error: 'Internal Server Error', 
    message: err.message 
  }, 500);
});

export default app;
