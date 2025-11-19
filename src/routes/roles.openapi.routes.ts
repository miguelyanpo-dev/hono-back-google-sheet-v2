import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { AuthService } from '../services/auth.service';

const rolesOpenAPIRouter = new OpenAPIHono();

// Schemas
const CreateRoleSchema = z.object({
  name: z.string().min(1).openapi({ example: 'Admin' }),
  description: z.string().min(1).openapi({ example: 'Administrator role with full access' }),
});

const UpdateRoleSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'Super Admin' }),
  description: z.string().min(1).optional().openapi({ example: 'Super administrator with extended privileges' }),
});

const AssignUsersToRoleSchema = z.object({
  users: z.array(z.string()).min(1).openapi({ 
    example: ['auth0|user1', 'auth0|user2'] 
  }),
});

const RoleIdParamSchema = z.object({
  id: z.string().openapi({ 
    param: { name: 'id', in: 'path' },
    example: 'rol_123456789'
  }),
});

const RolesQuerySchema = z.object({
  page: z.string().optional().openapi({ example: '0' }),
  per_page: z.string().optional().openapi({ example: '50' }),
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

// Ruta: GET /roles - Listar roles
const getRolesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Roles'],
  summary: 'Listar roles',
  description: 'Obtiene la lista de roles de Auth0. Soporta paginación.',
  request: {
    query: RolesQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de roles obtenida exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al obtener roles',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

rolesOpenAPIRouter.openapi(getRolesRoute, async (c) => {
  try {
    const { page = '0', per_page = '50' } = c.req.valid('query');
    const endpoint = `roles?page=${page}&per_page=${per_page}`;

    const roles = await AuthService.authenticatedRequest(endpoint, {
      method: 'GET',
    });

    return c.json({
      success: true,
      data: roles
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al obtener roles',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

// Ruta: POST /roles - Crear rol
const createRoleRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Roles'],
  summary: 'Crear rol',
  description: 'Crea un nuevo rol en Auth0. Los campos obligatorios son: name y description.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateRoleSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Rol creado exitosamente',
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
      description: 'Error al crear rol',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

rolesOpenAPIRouter.openapi(createRoleRoute, async (c) => {
  try {
    const body = c.req.valid('json');

    const role = await AuthService.authenticatedRequest('roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: role
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al crear rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

// Ruta: PATCH /roles/:id - Actualizar rol
const updateRoleRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Roles'],
  summary: 'Actualizar rol',
  description: 'Actualiza un rol existente en Auth0. Todos los campos son opcionales.',
  request: {
    params: RoleIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateRoleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Rol actualizado exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'ID de rol requerido',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al actualizar rol',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

rolesOpenAPIRouter.openapi(updateRoleRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');

    const role = await AuthService.authenticatedRequest(`roles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: role
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al actualizar rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

// Ruta: POST /roles/:id/users - Asignar usuarios a rol
const assignUsersToRoleRoute = createRoute({
  method: 'post',
  path: '/{id}/users',
  tags: ['Roles'],
  summary: 'Asignar usuarios a rol',
  description: 'Asigna uno o más usuarios a un rol específico en Auth0.',
  request: {
    params: RoleIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: AssignUsersToRoleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Usuarios asignados al rol exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.any(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: 'ID de rol o array de usuarios requerido',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al asignar usuarios al rol',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

rolesOpenAPIRouter.openapi(assignUsersToRoleRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');

    const result = await AuthService.authenticatedRequest(`roles/${id}/users`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: result,
      message: 'Usuarios asignados al rol correctamente'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al asignar usuarios al rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

// Ruta: GET /roles/:id/users - Obtener usuarios de un rol
const getRoleUsersRoute = createRoute({
  method: 'get',
  path: '/{id}/users',
  tags: ['Roles'],
  summary: 'Obtener usuarios de un rol',
  description: 'Obtiene la lista de usuarios asignados a un rol específico. Soporta paginación.',
  request: {
    params: RoleIdParamSchema,
    query: RolesQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de usuarios del rol obtenida exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponseSchema,
        },
      },
    },
    400: {
      description: 'ID de rol requerido',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al obtener usuarios del rol',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

rolesOpenAPIRouter.openapi(getRoleUsersRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');
    const { page = '0', per_page = '50' } = c.req.valid('query');
    
    const endpoint = `roles/${id}/users?page=${page}&per_page=${per_page}`;

    const users = await AuthService.authenticatedRequest(endpoint, {
      method: 'GET',
    });

    return c.json({
      success: true,
      data: users
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al obtener usuarios del rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

export default rolesOpenAPIRouter;
