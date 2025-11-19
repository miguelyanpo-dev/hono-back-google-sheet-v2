import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { logger } from './middlewares/logger';
import { config } from './config/config';
import itemsRouter from './routes/items.routes';
import itemsOpenAPIRouter from './routes/items.openapi.routes';

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

// Mount OpenAPI routes
app.route('/api/v1/items', itemsOpenAPIRouter);

// OpenAPI documentation endpoint
app.get('/api/v1/doc', swaggerUI({ url: '/api/v1/openapi.json' }));

// OpenAPI JSON spec
app.get('/api/v1/openapi.json', (c) => {
  return c.json(itemsOpenAPIRouter.getOpenAPIDocument({
    openapi: '3.0.0',
    info: {
      title: 'Hono CRUD API',
      version: '0.1.0',
      description: 'API REST básica construida con Hono - un framework web ultrarrápido y ligero para TypeScript',
    },
    servers: [
      {
        url: config.env === 'production' ? 'https://your-domain.vercel.app' : `http://localhost:${config.port}`,
        description: config.env === 'production' ? 'Production server' : 'Development server',
      },
    ],
  }));
});

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
