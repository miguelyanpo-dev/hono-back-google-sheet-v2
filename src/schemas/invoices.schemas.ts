import { z } from 'zod';

// Schema para la respuesta exitosa
export const SuccessResponse = z.object({
  success: z.boolean(),
  data: z.any(),
});

// Schema para la respuesta de error
export const ErrorResponse = z.object({
  success: z.boolean(),
  error: z.string(),
  message: z.string(),
});

// Schema para los parámetros de query de facturas
export const InvoicesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .openapi({
      param: {
        name: 'page',
        in: 'query',
      },
      description: 'Número de página para la paginación',
      example: '1',
    }),
  personId: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'personId',
        in: 'query',
      },
      description: 'ID de la persona (opcional). Si se envía, filtra las facturas por esta persona',
      example: 'gfjg5j4gh',
    }),
});

// Schema para los parámetros de query de facturas actuales (con personIdSeller)
export const InvoicesCurrentQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .openapi({
      param: {
        name: 'page',
        in: 'query',
      },
      description: 'Número de página para la paginación',
      example: '1',
    }),
  personIdSeller: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'personIdSeller',
        in: 'query',
      },
      description: 'ID del vendedor (opcional). Si se envía, filtra las facturas por este vendedor',
      example: 'asfdas54da5s4',
    }),
});
