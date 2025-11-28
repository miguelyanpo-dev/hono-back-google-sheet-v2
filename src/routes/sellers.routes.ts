import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { SellersQuerySchema, SuccessResponse, ErrorResponse } from '../schemas/sellers.schemas';
import { getSellers } from '../controllers/sellers/get_sellers';

const sellersRouter = new OpenAPIHono();

// Ruta para obtener vendedores
const getSellersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Vendedores'],
  summary: 'Listar vendedores',
  description: 'Obtiene la lista de vendedores desde la API de Aliado.',
  request: {
    query: SellersQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de vendedores obtenida exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener vendedores',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
sellersRouter.openapi(getSellersRoute, getSellers);

export default sellersRouter;
