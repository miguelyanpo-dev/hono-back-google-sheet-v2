import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { InvoicesCurrentQuerySchema, SuccessResponse, ErrorResponse } from '../schemas/invoices.schemas';
import { getInvoicesPartialPayment } from '../controllers/invoices/get_invoices_partial_payment';

const invoicesPartialPaymentRouter = new OpenAPIHono();

// Ruta para obtener facturas con pago parcial
const getInvoicesPartialPaymentRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Facturas'],
  summary: 'Obtener facturas con pago parcial',
  description: `Obtiene las facturas con pago parcial desde la API de Aliado con paginación opcional y filtro por vendedor.

**Parámetros fijos (no modificables):**
- status: PagoParcial
- itemsPerPage: 10

**Parámetros variables:**
- page: Número de página (default: 1)
- personIdSeller: ID del vendedor para filtrar (opcional)`,
  request: {
    query: InvoicesCurrentQuerySchema,
  },
  responses: {
    200: {
      description: 'Facturas con pago parcial obtenidas exitosamente',
      content: {
        'application/json': {
          schema: SuccessResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener facturas con pago parcial',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
invoicesPartialPaymentRouter.openapi(getInvoicesPartialPaymentRoute, getInvoicesPartialPayment);

export default invoicesPartialPaymentRouter;
