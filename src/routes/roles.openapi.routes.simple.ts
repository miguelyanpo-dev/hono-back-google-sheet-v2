import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { AuthService } from '../services/auth.service';

// Schemas básicos
const RoleSchema = z.object({
  name: z.string().openapi({ example: 'Administrator' }),
  description: z.string().openapi({ example: 'Full access administrator role' }),
});

const UpdateRoleSchema = z.object({
  name: z.string().optional().openapi({ example: 'Admin' }),
  description: z.string().optional().openapi({ example: 'Updated description' }),
});

const AssignUsersSchema = z.object({
  users: z.array(z.string()).openapi({ example: ['auth0|123456', 'auth0|789012'] }),
});

const RoleIdParam = z.object({
  id: z.string().openapi({ param: { name: 'id', in: 'path' }, example: 'rol_abc123' }),
});

const SuccessResponse = z.object({
  success: z.boolean(),
  data: z.any(),
});

const ErrorResponse = z.object({
  success: z.boolean(),
  error: z.string(),
  message: z.string(),
});

// GET /roles
const getRolesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Roles'],
  summary: 'Listar roles',
  responses: {
    200: {
      description: 'Lista de roles',
      content: { 'application/json': { schema: SuccessResponse } },
    },
  },
});

// POST /roles
const createRoleRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Roles'],
  summary: 'Crear rol',
  request: {
    body: {
      content: { 'application/json': { schema: RoleSchema } },
    },
  },
  responses: {
    201: {
      description: 'Rol creado',
      content: { 'application/json': { schema: SuccessResponse } },
    },
  },
});

// PATCH /roles/:id
const updateRoleRoute = createRoute({
  method: 'patch',
  path: '/{id}',
  tags: ['Roles'],
  summary: 'Actualizar rol',
  request: {
    params: RoleIdParam,
    body: {
      content: { 'application/json': { schema: UpdateRoleSchema } },
    },
  },
  responses: {
    200: {
      description: 'Rol actualizado',
      content: { 'application/json': { schema: SuccessResponse } },
    },
  },
});

// POST /roles/:id/users
const assignUsersRoute = createRoute({
  method: 'post',
  path: '/{id}/users',
  tags: ['Roles'],
  summary: 'Asignar usuarios a rol',
  request: {
    params: RoleIdParam,
    body: {
      content: { 'application/json': { schema: AssignUsersSchema } },
    },
  },
  responses: {
    200: {
      description: 'Usuarios asignados',
      content: { 'application/json': { schema: SuccessResponse } },
    },
  },
});

// GET /roles/:id/users
const getRoleUsersRoute = createRoute({
  method: 'get',
  path: '/{id}/users',
  tags: ['Roles'],
  summary: 'Obtener usuarios de un rol',
  request: {
    params: RoleIdParam,
  },
  responses: {
    200: {
      description: 'Lista de usuarios del rol',
      content: { 'application/json': { schema: SuccessResponse } },
    },
  },
});

export function registerRolesRoutes(router: OpenAPIHono) {
  // GET /roles
  router.openapi(getRolesRoute, async (c) => {
    try {
      const data = await AuthService.authenticatedRequest('roles');
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al obtener roles',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });

  // POST /roles
  router.openapi(createRoleRoute, async (c) => {
    try {
      const body = c.req.valid('json');
      const data = await AuthService.authenticatedRequest('roles', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return c.json({ success: true, data }, 201);
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al crear rol',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });

  // PATCH /roles/:id
  router.openapi(updateRoleRoute, async (c) => {
    try {
      const { id } = c.req.valid('param');
      const body = c.req.valid('json');
      const data = await AuthService.authenticatedRequest(`roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al actualizar rol',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });

  // POST /roles/:id/users
  router.openapi(assignUsersRoute, async (c) => {
    try {
      const { id } = c.req.valid('param');
      const { users } = c.req.valid('json');
      const data = await AuthService.authenticatedRequest(`roles/${id}/users`, {
        method: 'POST',
        body: JSON.stringify({ users }),
      });
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al asignar usuarios',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });

  // GET /roles/:id/users
  router.openapi(getRoleUsersRoute, async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = await AuthService.authenticatedRequest(`roles/${id}/users`);
      return c.json({ success: true, data });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al obtener usuarios del rol',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });
}
