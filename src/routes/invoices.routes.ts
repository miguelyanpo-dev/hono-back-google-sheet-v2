import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { InvoicesQuerySchema, SuccessResponse, ErrorResponse } from '../schemas/invoices.schemas';
import { getInvoices } from '../controllers/invoices/get_invoices';

const invoicesRouter = new OpenAPIHono();

// Ruta para obtener facturas
const getInvoicesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Facturas'],
  summary: 'Listar facturas vigentes',
  description: `Obtiene la lista de facturas de Aliado con paginación.
  
**Parámetros fijos (no modificables):**
- status: Vigente
- itemsPerPage: 10

**Parámetros variables:**
- page: Número de página (default: 1)
- personId: ID de la persona para filtrar (opcional)`,
  request: {
    query: InvoicesQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de facturas obtenida exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener facturas',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
invoicesRouter.openapi(getInvoicesRoute, getInvoices);

export default invoicesRouter;
