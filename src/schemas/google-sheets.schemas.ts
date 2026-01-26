import { z } from 'zod';
import { SuccessResponse, ErrorResponse } from './sellers.schemas';

/**
 * Query params para Google Sheets
 */
export const GoogleSheetsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  itemsPerPage: z.coerce.number().optional(),
});

/**
 * Esquema para crear registro
 */
export const CreateRecordSchema = z.record(z.string(), z.any());

/**
 * Esquema para actualizar registro
 */
export const UpdateRecordSchema = z.record(z.string(), z.any());

/**
 * Response de hojas
 */
export const SheetsResponse = SuccessResponse.extend({
  data: z.array(z.string()),
});

/**
 * Response de datos de hoja
 */
export const SheetDataResponse = SuccessResponse.extend({
  data: z.array(z.record(z.string(), z.any())),
  total: z.number(),
});

/**
 * Response de registro individual
 */
export const RecordResponse = SuccessResponse.extend({
  data: z.record(z.string(), z.any()),
});

export {
  SuccessResponse,
  ErrorResponse,
};