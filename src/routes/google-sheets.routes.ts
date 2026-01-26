import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  GoogleSheetsQuerySchema,
  SheetsResponse,
  SheetDataResponse,
  RecordResponse,
  CreateRecordSchema,
  UpdateRecordSchema,
  ErrorResponse,
} from '../schemas/google-sheets.schemas';
import { getSheets } from '../controllers/google-sheets/get_sheets';
import { getSheetData } from '../controllers/google-sheets/get_sheet_data';
import { createRecord } from '../controllers/google-sheets/create_record';
import { updateRecord } from '../controllers/google-sheets/update_record';
import { deleteRecord } from '../controllers/google-sheets/delete_record';

const googleSheetsRouter = new OpenAPIHono();

// Ruta para obtener nombres de hojas
const getSheetsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Google Sheets'],
  summary: 'Listar hojas',
  description: 'Obtiene los nombres de todas las hojas en el documento de Google Sheets.',
  responses: {
    200: {
      description: 'Lista de hojas obtenida exitosamente',
      content: {
        'application/json': {
          schema: SheetsResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener hojas',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para obtener datos de una hoja específica
const getSheetDataRoute = createRoute({
  method: 'get',
  path: '/:sheetName',
  tags: ['Google Sheets'],
  summary: 'Obtener datos de hoja',
  description: 'Obtiene todos los datos de una hoja específica en Google Sheets.',
  request: {
    params: z.object({
      sheetName: z.string().describe('Nombre de la hoja'),
    }),
    query: GoogleSheetsQuerySchema,
  },
  responses: {
    200: {
      description: 'Datos de la hoja obtenidos exitosamente',
      content: {
        'application/json': {
          schema: SheetDataResponse,
        },
      },
    },
    500: {
      description: 'Error al obtener datos de la hoja',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para crear un registro en una hoja específica
const createRecordRoute = createRoute({
  method: 'post',
  path: '/:sheetName',
  tags: ['Google Sheets'],
  summary: 'Crear registro',
  description: 'Crea un nuevo registro en una hoja específica de Google Sheets.',
  request: {
    params: z.object({
      sheetName: z.string().describe('Nombre de la hoja'),
    }),
    body: {
      content: {
        'application/json': {
          schema: CreateRecordSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Registro creado exitosamente',
      content: {
        'application/json': {
          schema: RecordResponse,
        },
      },
    },
    500: {
      description: 'Error al crear registro',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para actualizar un registro en una hoja específica
const updateRecordRoute = createRoute({
  method: 'put',
  path: '/:sheetName/:index',
  tags: ['Google Sheets'],
  summary: 'Actualizar registro',
  description: 'Actualiza un registro existente en una hoja específica de Google Sheets.',
  request: {
    params: z.object({
      sheetName: z.string().describe('Nombre de la hoja'),
      index: z.string().describe('Índice del registro'),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateRecordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Registro actualizado exitosamente',
      content: {
        'application/json': {
          schema: RecordResponse,
        },
      },
    },
    404: {
      description: 'Registro no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Error al actualizar registro',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
});

// Ruta para eliminar un registro de una hoja específica
const deleteRecordRoute = createRoute({
  method: 'delete',
  path: '/:sheetName/:index',
  tags: ['Google Sheets'],
  summary: 'Eliminar registro',
  description: 'Elimina un registro de una hoja específica en Google Sheets.',
  request: {
    params: z.object({
      sheetName: z.string().describe('Nombre de la hoja'),
      index: z.string().describe('Índice del registro'),
    }),
  },
  responses: {
    200: {
      description: 'Registro eliminado exitosamente',
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
      description: 'Registro no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    500: {
      description: 'Error al eliminar registro',
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
googleSheetsRouter.openapi(getSheetsRoute, getSheets);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
googleSheetsRouter.openapi(getSheetDataRoute, getSheetData);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
googleSheetsRouter.openapi(createRecordRoute, createRecord);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
googleSheetsRouter.openapi(updateRecordRoute, updateRecord);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
googleSheetsRouter.openapi(deleteRecordRoute, deleteRecord);

export default googleSheetsRouter;