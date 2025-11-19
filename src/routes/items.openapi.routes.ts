import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

// Schemas
const ItemSchema = z.object({
  id: z.string().openapi({ example: '1' }),
  name: z.string().openapi({ example: 'Mi Item' }),
  description: z.string().optional().openapi({ example: 'Descripción del item' }),
  createdAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
  updatedAt: z.string().openapi({ example: '2024-01-01T00:00:00.000Z' }),
});

const CreateItemSchema = z.object({
  name: z.string().min(1).openapi({ example: 'Mi Item' }),
  description: z.string().optional().openapi({ example: 'Descripción del item' }),
});

const UpdateItemSchema = z.object({
  name: z.string().min(1).optional().openapi({ example: 'Item Actualizado' }),
  description: z.string().optional().openapi({ example: 'Nueva descripción' }),
});

const SuccessResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.any(),
});

const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.string().openapi({ example: 'Error message' }),
});

// In-memory storage
type Item = z.infer<typeof ItemSchema>;
let items: Item[] = [];
let nextId = 1;

// Routes
const listItemsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Items'],
  summary: 'Listar todos los items',
  description: 'Obtiene una lista de todos los items disponibles',
  responses: {
    200: {
      description: 'Lista de items',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(ItemSchema),
            count: z.number(),
          }),
        },
      },
    },
  },
});

const getItemRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Items'],
  summary: 'Obtener un item por ID',
  description: 'Obtiene los detalles de un item específico',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
  },
  responses: {
    200: {
      description: 'Item encontrado',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: ItemSchema,
          }),
        },
      },
    },
    404: {
      description: 'Item no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const createItemRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Items'],
  summary: 'Crear un nuevo item',
  description: 'Crea un nuevo item con los datos proporcionados',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateItemSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Item creado exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: ItemSchema,
          }),
        },
      },
    },
    400: {
      description: 'Datos inválidos',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const updateItemRoute = createRoute({
  method: 'put',
  path: '/{id}',
  tags: ['Items'],
  summary: 'Actualizar un item',
  description: 'Actualiza los datos de un item existente',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Item actualizado exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: ItemSchema,
          }),
        },
      },
    },
    404: {
      description: 'Item no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    400: {
      description: 'Datos inválidos',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Items'],
  summary: 'Eliminar un item',
  description: 'Elimina un item existente',
  request: {
    params: z.object({
      id: z.string().openapi({ example: '1' }),
    }),
  },
  responses: {
    200: {
      description: 'Item eliminado exitosamente',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            data: ItemSchema,
          }),
        },
      },
    },
    404: {
      description: 'Item no encontrado',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// Create router
const itemsOpenAPIRouter = new OpenAPIHono<{ Bindings: {} }>();

// Implement routes
itemsOpenAPIRouter.openapi(listItemsRoute, (c) => {
  return c.json({
    success: true,
    data: items,
    count: items.length,
  }) as any;
});

itemsOpenAPIRouter.openapi(getItemRoute, (c) => {
  const { id } = c.req.valid('param');
  const item = items.find((i) => i.id === id);

  if (!item) {
    return c.json(
      {
        success: false,
        error: 'Item not found',
      },
      404
    ) as any;
  }

  return c.json({
    success: true,
    data: item,
  }) as any;
});

// @ts-expect-error - Type incompatibility between hono and zod-openapi versions
itemsOpenAPIRouter.openapi(createItemRoute, async (c) => {
  const body = c.req.valid('json');

  const newItem: Item = {
    id: String(nextId++),
    name: body.name,
    description: body.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.push(newItem);

  return c.json(
    {
      success: true,
      data: newItem,
    },
    201
  ) as any;
});

// @ts-expect-error - Type incompatibility between hono and zod-openapi versions
itemsOpenAPIRouter.openapi(updateItemRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  const itemIndex = items.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return c.json(
      {
        success: false,
        error: 'Item not found',
      },
      404
    ) as any;
  }

  const updatedItem: Item = {
    ...items[itemIndex],
    name: body.name ?? items[itemIndex].name,
    description: body.description ?? items[itemIndex].description,
    updatedAt: new Date().toISOString(),
  };

  items[itemIndex] = updatedItem;

  return c.json({
    success: true,
    data: updatedItem,
  }) as any;
});

itemsOpenAPIRouter.openapi(deleteItemRoute, (c) => {
  const { id } = c.req.valid('param');
  const itemIndex = items.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return c.json(
      {
        success: false,
        error: 'Item not found',
      },
      404
    ) as any;
  }

  const deletedItem = items[itemIndex];
  items.splice(itemIndex, 1);

  return c.json({
    success: true,
    message: 'Item deleted successfully',
    data: deletedItem,
  }) as any;
});

export default itemsOpenAPIRouter;
