import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { AuthService } from '../services/auth.service';

// Schema de respuesta del token
const TokenResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  access_token: z.string().openapi({ example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImlkUGNkdExPeW9EbUdFTnZXdVpaUSJ9...' }),
  token_type: z.string().openapi({ example: 'Bearer' }),
});

// Ruta: POST /token - Obtener token de Auth0
const getTokenRoute = createRoute({
  method: 'post',
  path: '/token',
  tags: ['Autenticación'],
  summary: 'Obtener token de Auth0',
  description: 'Obtiene un token de acceso de Auth0 Management API. El token se almacena en caché para optimizar las peticiones.',
  responses: {
    200: {
      description: 'Token obtenido exitosamente',
      content: {
        'application/json': {
          schema: TokenResponseSchema,
        },
      },
    },
    500: {
      description: 'Error al obtener el token',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

export function registerAuthRoutes(router: OpenAPIHono) {
  // @ts-expect-error - Known issue with @hono/zod-openapi type inference
  router.openapi(getTokenRoute, async (c) => {
    try {
      AuthService.clearCache();
      const token = await AuthService.getAccessToken();
      
      return c.json({
        success: true,
        access_token: token,
        token_type: 'Bearer'
      });
    } catch (error) {
      return c.json({
        success: false,
        error: 'Error al obtener token de Auth0',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }, 500);
    }
  });
}
