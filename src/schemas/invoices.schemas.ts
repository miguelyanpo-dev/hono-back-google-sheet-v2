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
  page: z.string().optional().default('1'),
  itemsPerPage: z.string().optional().default('10'),
});
