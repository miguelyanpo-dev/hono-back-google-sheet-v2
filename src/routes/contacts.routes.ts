import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import {
  ContactsQuerySchema,
  ContactsListResponse,
  ErrorResponse,
} from '../schemas/contacts.schemas';

import { getContacts } from '../controllers/contacts/get_contacts';

const contactsRouter = new OpenAPIHono();

/**
 * GET /contacts
 */
contactsRouter.openapi(createRoute({
  method: 'get',
  path: '/',
  tags: ['Contactos'],
  summary: 'Listar contactos',
  description: 'Obtiene contactos (people) desde la API de Aliado',
  request: {
    query: ContactsQuerySchema,
  },
  responses: {
    200: {
      description: 'Listado de contactos',
      content: {
        'application/json': {
          schema: ContactsListResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener contactos',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
}), getContacts);

export default contactsRouter;
