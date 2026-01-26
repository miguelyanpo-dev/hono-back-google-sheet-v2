import { z } from 'zod';
import { SuccessResponse, ErrorResponse } from './sellers.schemas';

/**
 * Query params para Google Sheets
 */
export const ContactsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  itemsPerPage: z.coerce.number().optional(),
  identification: z.string().optional(),
});

/**
 * Modelo de Contacto simplificado para Google Sheets
 */
export const ContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  identification: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/**
 * Esquema para crear contacto
 */
export const CreateContactSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  identification: z.string().optional(),
});

/**
 * Esquema para actualizar contacto
 */
export const UpdateContactSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  identification: z.string().optional(),
});

/**
 * Response de contacto individual
 */
export const ContactResponse = SuccessResponse.extend({
  data: ContactSchema,
});

/**
 * Response de listado
 */
export const ContactsListResponse = SuccessResponse.extend({
  data: z.array(ContactSchema),
});

export {
  SuccessResponse,
  ErrorResponse,
};
