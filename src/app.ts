import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { logger } from './middlewares/logger';
import { config } from './config/config';
import invoicesRouter from './routes/invoices.routes';

const app = new Hono();
const apiV1 = new OpenAPIHono();

// CORS middleware
app.use('*', cors({
  origin: config.cors.origins,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  maxAge: 600,
  credentials: true,
}));

// Logger middleware
app.use('*', logger());

// Health check
app.get('/', (c) => {
  return c.json({ 
    ok: true, 
    service: 'aliado-api-proxy',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// Mount Invoices routes
apiV1.route('/invoices', invoicesRouter);

// The OpenAPI JSON documentation
apiV1.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Aliado API Proxy',
      version: '1.0.0',
      description: 'API REST para interactuar con el proveedor de contabilidad Aliado. Todas las peticiones se autentican automáticamente usando el token Bearer configurado.',
    },
    servers: [
      {
        url: `${config.productionUrl}/api/v1`,
        description: 'Production server',
      },
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Development server',
      },
    ],
    paths: {
      '/invoices': {
        get: {
          tags: ['Facturas'],
          summary: 'Listar facturas',
          description: 'Obtiene la lista de facturas de Aliado con paginación',
          parameters: [
            { 
              name: 'page', 
              in: 'query', 
              schema: { type: 'string', default: '1' }, 
              description: 'Número de página' 
            },
            { 
              name: 'itemsPerPage', 
              in: 'query', 
              schema: { type: 'string', default: '10' }, 
              description: 'Cantidad de items por página' 
            },
          ],
          responses: {
            200: {
              description: 'Lista de facturas obtenida exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { 
                        type: 'object',
                        description: 'Datos de facturas retornados por Aliado'
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Error al obtener facturas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

// Swagger UI
apiV1.get('/doc', swaggerUI({ url: '/api/v1/openapi.json' }));

// Redirect root /api/v1 to documentation
apiV1.get('/', (c) => {
  return c.redirect('/api/v1/doc');
});

// Mount OpenAPI routes
app.route('/api/v1', apiV1);

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
