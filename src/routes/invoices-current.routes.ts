import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { InvoicesCurrentQuerySchema, SuccessResponse, ErrorResponse } from '../schemas/invoices.schemas';
import { getInvoicesCurrent } from '../controllers/invoices/get_invoices_current';

const invoicesCurrentRouter = new OpenAPIHono();

// Ruta para obtener facturas actuales
const getInvoicesCurrentRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Facturas'],
  summary: 'Obtener facturas actuales (vigentes)',
  description: `Obtiene las facturas vigentes desde la API de Aliado con paginación opcional y filtro por vendedor.

**Parámetros fijos (no modificables):**
- status: Vigente
- itemsPerPage: 10

**Parámetros variables:**
- page: Número de página (default: 1)
- personIdSeller: ID del vendedor para filtrar (opcional)`,
  request: {
    query: InvoicesCurrentQuerySchema,
  },
  responses: {
    200: {
      description: 'Facturas actuales obtenidas exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener facturas actuales',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
invoicesCurrentRouter.openapi(getInvoicesCurrentRoute, getInvoicesCurrent);

export default invoicesCurrentRouter;
