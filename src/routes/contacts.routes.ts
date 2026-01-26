import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  ContactsQuerySchema,
  ContactsListResponse,
  ContactResponse,
  CreateContactSchema,
  UpdateContactSchema,
  ErrorResponse,
} from '../schemas/contacts.schemas';
import { getContacts } from '../controllers/contacts/get_contacts';
import { createContact } from '../controllers/contacts/create_contact';
import { updateContact } from '../controllers/contacts/update_contact';
import { deleteContact } from '../controllers/contacts/delete_contact';

const contactsRouter = new OpenAPIHono();

// Ruta para obtener contactos
const getContactsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Contactos'],
  summary: 'Listar contactos',
  description: 'Obtiene todos los contactos desde Google Sheets.',
  request: {
    query: ContactsQuerySchema,
  },
  responses: {
    200: {
      description: 'Lista de contactos obtenida exitosamente',
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
});

// Ruta para obtener un contacto por ID
const getContactByIdRoute = createRoute({
  method: 'get',
  path: '/:id',
  tags: ['Contactos'],
  summary: 'Obtener contacto por ID',
  description: 'Obtiene un contacto específico por su ID desde Google Sheets.',
  request: {
    params: z.object({
      id: z.string().describe('ID del contacto'),
    }),
  },
  responses: {
    200: {
      description: 'Contacto obtenido exitosamente',
      content: {
        'application/json': {
          schema: ContactResponse,
        },
      },
    },
    404: {
      description: 'Contacto no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener contacto',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para crear un contacto
const createContactRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Contactos'],
  summary: 'Crear contacto',
  description: 'Crea un nuevo contacto en Google Sheets.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateContactSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Contacto creado exitosamente',
      content: {
        'application/json': {
          schema: ContactResponse,
        },
      },
    },
    400: {
      description: 'Faltan campos requeridos',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Error al crear contacto',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para actualizar un contacto
const updateContactRoute = createRoute({
  method: 'put',
  path: '/:id',
  tags: ['Contactos'],
  summary: 'Actualizar contacto',
  description: 'Actualiza un contacto existente en Google Sheets.',
  request: {
    params: z.object({
      id: z.string().describe('ID del contacto'),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateContactSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Contacto actualizado exitosamente',
      content: {
        'application/json': {
          schema: ContactResponse,
        },
      },
    },
    404: {
      description: 'Contacto no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Error al actualizar contacto',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para eliminar un contacto
const deleteContactRoute = createRoute({
  method: 'delete',
  path: '/:id',
  tags: ['Contactos'],
  summary: 'Eliminar contacto',
  description: 'Elimina un contacto de Google Sheets.',
  request: {
    params: z.object({
      id: z.string().describe('ID del contacto'),
    }),
  },
  responses: {
    200: {
      description: 'Contacto eliminado exitosamente',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    404: {
      description: 'Contacto no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Error al eliminar contacto',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Registramos todas las rutas
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
contactsRouter.openapi(getContactsRoute, getContacts);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
contactsRouter.openapi(getContactByIdRoute, getContacts);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
contactsRouter.openapi(createContactRoute, createContact);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
contactsRouter.openapi(updateContactRoute, updateContact);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
contactsRouter.openapi(deleteContactRoute, deleteContact);

export default contactsRouter;
