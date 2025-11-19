import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { AuthService } from '../services/auth.service';

// Schemas
const CreateUserSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  password: z.string().min(8).openapi({ example: 'SecurePass123!' }),
  connection: z.string().openapi({ example: 'Username-Password-Authentication' }),
  phone_number: z.string().optional().openapi({ example: '+1234567890' }),
  user_metadata: z.record(z.any()).optional(),
  blocked: z.boolean().optional().openapi({ example: false }),
  email_verified: z.boolean().optional().openapi({ example: false }),
  phone_verified: z.boolean().optional().openapi({ example: false }),
  app_metadata: z.record(z.any()).optional(),
  given_name: z.string().optional().openapi({ example: 'John' }),
  family_name: z.string().optional().openapi({ example: 'Doe' }),
  name: z.string().optional().openapi({ example: 'John Doe' }),
  nickname: z.string().optional().openapi({ example: 'johndoe' }),
  picture: z.string().url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
  verify_email: z.boolean().optional().openapi({ example: false }),
  username: z.string().optional().openapi({ example: 'johndoe' }),
});

const UpdateUserSchema = z.object({
  blocked: z.boolean().optional().openapi({ example: false }),
  email_verified: z.boolean().optional().openapi({ example: true }),
  email: z.string().email().optional().openapi({ example: 'newemail@example.com' }),
  phone_number: z.string().optional().openapi({ example: '+1234567890' }),
  phone_verified: z.boolean().optional().openapi({ example: false }),
  user_metadata: z.record(z.any()).optional(),
  app_metadata: z.record(z.any()).optional(),
  given_name: z.string().optional().openapi({ example: 'Jane' }),
  family_name: z.string().optional().openapi({ example: 'Smith' }),
  name: z.string().optional().openapi({ example: 'Jane Smith' }),
  nickname: z.string().optional().openapi({ example: 'janesmith' }),
  picture: z.string().url().optional().openapi({ example: 'https://example.com/photo.jpg' }),
  verify_email: z.boolean().optional().openapi({ example: false }),
  verify_phone_number: z.boolean().optional().openapi({ example: false }),
  password: z.string().min(8).optional().openapi({ example: 'NewSecurePass123!' }),
  connection: z.string().optional().openapi({ example: 'Username-Password-Authentication' }),
  username: z.string().optional().openapi({ example: 'janesmith' }),
});

const UserIdParamSchema = z.object({
  id: z.string().openapi({ 
    param: { name: 'id', in: 'path' },
    example: 'auth0|123456789'
  }),
});

const UsersQuerySchema = z.object({
  page: z.string().optional().openapi({ example: '0' }),
  per_page: z.string().optional().openapi({ example: '50' }),
  search: z.string().optional().openapi({ example: 'email:*@example.com*' }),
});

const SuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.any(),
});

const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string(),
  message: z.string().optional(),
});

// Ruta: GET /users - Listar usuarios
const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Usuarios'],
  summary: 'Listar usuarios',
  description: 'Obtiene la lista de usuarios de Auth0. Soporta paginación y búsqueda.',
  request: {
    query: UsersQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de usuarios obtenida exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al obtener usuarios',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Ruta: POST /users - Crear usuario
const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Usuarios'],
  summary: 'Crear usuario',
  description: 'Crea un nuevo usuario en Auth0. Los campos obligatorios son: email, password y connection.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Usuario creado exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'Campos obligatorios faltantes',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al crear usuario',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Ruta: PATCH /users/:id - Actualizar usuario
const updateUserRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Usuarios'],
  summary: 'Actualizar usuario',
  description: 'Actualiza un usuario existente en Auth0. Todos los campos son opcionales.',
  request: {
    params: UserIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Usuario actualizado exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'ID de usuario requerido',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al actualizar usuario',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

export function registerUsersRoutes(router: OpenAPIHono) {
  // GET /users - Listar usuarios
  router.openapi(getUsersRoute, async (c) => {
    try {
      const { page, per_page, search } = c.req.valid('query');
      
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (per_page) queryParams.append('per_page', per_page);
      if (search) queryParams.append('q', search);
      
      const data = await AuthService.authenticatedRequest(
        `users?${queryParams.toString()}`
      );
      
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al obtener usuarios',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });

  // POST /users - Crear usuario
  router.openapi(createUserRoute, async (c) => {
    try {
      const userData = c.req.valid('json');
      
      const data = await AuthService.authenticatedRequest(
        'users',
        {
          method: 'POST',
          body: JSON.stringify(userData),
        }
      );
      
      return c.json({ success: true, data }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al crear usuario',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });

  // PATCH /users/:id - Actualizar usuario
  router.openapi(updateUserRoute, async (c) => {
    try {
      const { id } = c.req.valid('param');
      const userData = c.req.valid('json');
      
      const data = await AuthService.authenticatedRequest(
        `users/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(userData),
        }
      );
      
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al actualizar usuario',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });
}
