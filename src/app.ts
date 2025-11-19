import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { logger } from './middlewares/logger';
import { config } from './config/config';
import authRouter from './routes/auth.routes';
import usersRouter from './routes/users.routes';
import rolesRouter from './routes/roles.routes';
import { AuthService } from './services/auth.service';

const app = new Hono();
const apiV1 = new OpenAPIHono();

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
    service: 'auth0-management-api',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// Mount Auth0 Management API routes (sin validación)
app.route('/api/auth', authRouter);
app.route('/api/users', usersRouter);
app.route('/api/roles', rolesRouter);

// ==================== SCHEMAS ====================
const SuccessResponse = z.object({
  success: z.boolean(),
  data: z.any(),
});

const ErrorResponse = z.object({
  success: z.boolean(),
  error: z.string(),
  message: z.string(),
});

// ==================== AUTH ROUTES ====================
const getTokenRoute = createRoute({
  method: 'post',
  path: '/auth/token',
  tags: ['Autenticación'],
  summary: 'Obtener token de Auth0',
  responses: {
    200: {
      description: 'Token obtenido',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            access_token: z.string(),
            token_type: z.string(),
          }),
        },
      },
    },
    500: {
      description: 'Error al obtener token',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(getTokenRoute, async (c) => {
  try {
    AuthService.clearCache();
    const token = await AuthService.getAccessToken();
    return c.json({ success: true, access_token: token, token_type: 'Bearer' });
  } catch (error) {
    return c.json({ success: false, error: 'Error', message: String(error) }, 500);
  }
});

// ==================== USERS ROUTES ====================
const getUsersRoute = createRoute({
  method: 'get',
  path: '/users',
  tags: ['Usuarios'],
  summary: 'Listar usuarios',
  request: {
    query: z.object({
      page: z.string().optional(),
      per_page: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Lista de usuarios',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al obtener usuarios',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(getUsersRoute, async (c) => {
  try {
    const { page, per_page, search } = c.req.query();
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (per_page) queryParams.append('per_page', per_page);
    if (search) queryParams.append('q', search);
    
    const data = await AuthService.authenticatedRequest(`users?${queryParams.toString()}`);
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Error al obtener usuarios', message: String(error) }, 500);
  }
});

const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  tags: ['Usuarios'],
  summary: 'Crear usuario',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(8),
            connection: z.string(),
            phone_number: z.string().optional(),
            user_metadata: z.record(z.string(), z.any()).optional(),
            blocked: z.boolean().optional(),
            email_verified: z.boolean().optional(),
            phone_verified: z.boolean().optional(),
            app_metadata: z.record(z.string(), z.any()).optional(),
            given_name: z.string().optional(),
            family_name: z.string().optional(),
            name: z.string().optional(),
            nickname: z.string().optional(),
            picture: z.string().url().optional(),
            verify_email: z.boolean().optional(),
            username: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario creado',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al crear usuario',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(createUserRoute, async (c) => {
  try {
    const body = await c.req.json();
    const data = await AuthService.authenticatedRequest('users', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return c.json({ success: true, data }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Error al crear usuario', message: String(error) }, 500);
  }
});

const updateUserRoute = createRoute({
  method: 'patch',
  path: '/users/{id}',
  tags: ['Usuarios'],
  summary: 'Actualizar usuario',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            blocked: z.boolean().optional(),
            email_verified: z.boolean().optional(),
            email: z.string().email().optional(),
            phone_number: z.string().optional(),
            phone_verified: z.boolean().optional(),
            user_metadata: z.record(z.string(), z.any()).optional(),
            app_metadata: z.record(z.string(), z.any()).optional(),
            given_name: z.string().optional(),
            family_name: z.string().optional(),
            name: z.string().optional(),
            nickname: z.string().optional(),
            picture: z.string().url().optional(),
            verify_email: z.boolean().optional(),
            verify_phone_number: z.boolean().optional(),
            password: z.string().min(8).optional(),
            connection: z.string().optional(),
            username: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Usuario actualizado',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al actualizar usuario',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(updateUserRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const data = await AuthService.authenticatedRequest(`users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Error al actualizar usuario', message: String(error) }, 500);
  }
});

// ==================== ROLES ROUTES ====================
const getRolesRoute = createRoute({
  method: 'get',
  path: '/roles',
  tags: ['Roles'],
  summary: 'Listar roles',
  responses: {
    200: {
      description: 'Lista de roles',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al obtener roles',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(getRolesRoute, async (c) => {
  try {
    const data = await AuthService.authenticatedRequest('roles');
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Error al obtener roles', message: String(error) }, 500);
  }
});

const createRoleRoute = createRoute({
  method: 'post',
  path: '/roles',
  tags: ['Roles'],
  summary: 'Crear rol',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            description: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Rol creado',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al crear rol',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(createRoleRoute, async (c) => {
  try {
    const body = await c.req.json();
    const data = await AuthService.authenticatedRequest('roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return c.json({ success: true, data }, 201);
  } catch (error) {
    return c.json({ success: false, error: 'Error al crear rol', message: String(error) }, 500);
  }
});

const updateRoleRoute = createRoute({
  method: 'patch',
  path: '/roles/{id}',
  tags: ['Roles'],
  summary: 'Actualizar rol',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Rol actualizado',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al actualizar rol',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(updateRoleRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const data = await AuthService.authenticatedRequest(`roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Error al actualizar rol', message: String(error) }, 500);
  }
});

const assignUsersToRoleRoute = createRoute({
  method: 'post',
  path: '/roles/{id}/users',
  tags: ['Roles'],
  summary: 'Asignar usuarios a rol',
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            users: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Usuarios asignados',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al asignar usuarios',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(assignUsersToRoleRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const { users } = await c.req.json();
    const data = await AuthService.authenticatedRequest(`roles/${id}/users`, {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Error al asignar usuarios', message: String(error) }, 500);
  }
});

const getRoleUsersRoute = createRoute({
  method: 'get',
  path: '/roles/{id}/users',
  tags: ['Roles'],
  summary: 'Obtener usuarios de un rol',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Lista de usuarios del rol',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al obtener usuarios del rol',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
apiV1.openapi(getRoleUsersRoute, async (c) => {
  try {
    const { id } = c.req.param();
    const data = await AuthService.authenticatedRequest(`roles/${id}/users`);
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: 'Error al obtener usuarios del rol', message: String(error) }, 500);
  }
});

// The OpenAPI JSON documentation - MANUAL debido a bug en @hono/zod-openapi v1.1.5
apiV1.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: 'Auth0 Management API',
      version: '1.0.0',
      description: 'API REST para gestionar usuarios y roles de Auth0 usando la Management API v2. Todas las peticiones obtienen automáticamente un token de Auth0 antes de ejecutarse.',
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
      '/auth/token': {
        post: {
          tags: ['Autenticación'],
          summary: 'Obtener token de Auth0',
          description: 'Obtiene un token de acceso de Auth0 Management API. El token se almacena en caché.',
          responses: {
            200: {
              description: 'Token obtenido exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      access_token: { type: 'string', example: 'eyJhbGc...' },
                      token_type: { type: 'string', example: 'Bearer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/users': {
        get: {
          tags: ['Usuarios'],
          summary: 'Listar usuarios',
          description: 'Obtiene la lista de usuarios de Auth0',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'string' }, description: 'Número de página' },
            { name: 'per_page', in: 'query', schema: { type: 'string' }, description: 'Usuarios por página' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Búsqueda' },
          ],
          responses: {
            200: {
              description: 'Lista de usuarios',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Usuarios'],
          summary: 'Crear usuario',
          description: 'Crea un nuevo usuario en Auth0',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'connection'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', minLength: 8, example: 'SecurePass123!' },
                    connection: { type: 'string', example: 'Username-Password-Authentication' },
                    name: { type: 'string', example: 'John Doe' },
                    nickname: { type: 'string', example: 'johndoe' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Usuario creado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/users/{id}': {
        patch: {
          tags: ['Usuarios'],
          summary: 'Actualizar usuario',
          description: 'Actualiza un usuario existente en Auth0',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del usuario' },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    nickname: { type: 'string' },
                    blocked: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Usuario actualizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/roles': {
        get: {
          tags: ['Roles'],
          summary: 'Listar roles',
          description: 'Obtiene la lista de roles de Auth0',
          responses: {
            200: {
              description: 'Lista de roles',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Roles'],
          summary: 'Crear rol',
          description: 'Crea un nuevo rol en Auth0',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description'],
                  properties: {
                    name: { type: 'string', example: 'Administrator' },
                    description: { type: 'string', example: 'Full access administrator role' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Rol creado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/roles/{id}': {
        patch: {
          tags: ['Roles'],
          summary: 'Actualizar rol',
          description: 'Actualiza un rol existente en Auth0',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del rol' },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Rol actualizado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/roles/{id}/users': {
        get: {
          tags: ['Roles'],
          summary: 'Obtener usuarios de un rol',
          description: 'Obtiene la lista de usuarios asignados a un rol',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del rol' },
          ],
          responses: {
            200: {
              description: 'Lista de usuarios del rol',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Roles'],
          summary: 'Asignar usuarios a rol',
          description: 'Asigna usuarios a un rol específico',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del rol' },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['users'],
                  properties: {
                    users: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['auth0|123456', 'auth0|789012'],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Usuarios asignados',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'object' },
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
