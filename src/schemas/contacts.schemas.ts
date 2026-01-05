import { z } from 'zod';
import { SuccessResponse, ErrorResponse } from './sellers.schemas';

/**
 * Query params reales de Aliado
 */
export const ContactsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  itemsPerPage: z.coerce.number().optional(),
  identification: z.string().optional(),
});

/**
 * Modelo de Contacto (People)
 */
export const ContactSchema = z.object({
  id: z.string(),
  kind: z.literal('Person'),
  identificationType: z.string(),
  identification: z.string(),

  firstName: z.string(),
  secondName: z.string().nullable().optional(),
  firstSurname: z.string(),
  secondSurname: z.string().nullable().optional(),

  companyName: z.string().nullable().optional(),

  phoneMobile: z.string().nullable().optional(),
  phoneWork: z.string().nullable().optional(),

  isCustomer: z.boolean(),
  isSupplier: z.boolean(),
  isEmployee: z.boolean(),
  isSeller: z.boolean(),

  email: z.string().nullable().optional(),
  emails: z.array(z.any()),

  addressBillingName: z.string().nullable().optional(),
  addressBillingLine: z.string().nullable().optional(),
  addressBillingCountryCode: z.string().nullable().optional(),
  addressBillingRegion: z.string().nullable().optional(),
  addressBillingCity: z.string().nullable().optional(),

  addressShippingName: z.string().nullable().optional(),
  addressShippingLine: z.string().nullable().optional(),
  addressShippingCountryCode: z.string().nullable().optional(),
  addressShippingRegion: z.string().nullable().optional(),
  addressShippingCity: z.string().nullable().optional(),
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
