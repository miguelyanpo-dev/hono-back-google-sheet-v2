import { Hono } from 'hono';

const itemsRouter = new Hono();

// In-memory storage (reemplazar con base de datos real)
type Item = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

let items: Item[] = [];
let nextId = 1;

// GET /items - Listar todos los items
itemsRouter.get('/', (c) => {
  return c.json({
    success: true,
    data: items,
    count: items.length
  });
});

// GET /items/:id - Obtener un item por ID
itemsRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const item = items.find(i => i.id === id);
  
  if (!item) {
    return c.json({ 
      success: false,
      error: 'Item not found' 
    }, 404);
  }
  
  return c.json({
    success: true,
    data: item
  });
});

// POST /items - Crear un nuevo item
itemsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json<{ name: string; description?: string }>();
    
    if (!body.name) {
      return c.json({ 
        success: false,
        error: 'Name is required' 
      }, 400);
    }
    
    const newItem: Item = {
      id: String(nextId++),
      name: body.name,
      description: body.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    items.push(newItem);
    
    return c.json({
      success: true,
      data: newItem
    }, 201);
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: 'Invalid request body',
      details: error.message 
    }, 400);
  }
});

// PUT /items/:id - Actualizar un item existente
itemsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json<{ name?: string; description?: string }>();
    
    const itemIndex = items.findIndex(i => i.id === id);
    
    if (itemIndex === -1) {
      return c.json({ 
        success: false,
        error: 'Item not found' 
      }, 404);
    }
    
    const updatedItem: Item = {
      ...items[itemIndex],
      name: body.name ?? items[itemIndex].name,
      description: body.description ?? items[itemIndex].description,
      updatedAt: new Date().toISOString()
    };
    
    items[itemIndex] = updatedItem;
    
    return c.json({
      success: true,
      data: updatedItem
    });
  } catch (error: any) {
    return c.json({ 
      success: false,
      error: 'Invalid request body',
      details: error.message 
    }, 400);
  }
});

// DELETE /items/:id - Eliminar un item
itemsRouter.delete('/:id', (c) => {
  const id = c.req.param('id');
  const itemIndex = items.findIndex(i => i.id === id);
  
  if (itemIndex === -1) {
    return c.json({ 
      success: false,
      error: 'Item not found' 
    }, 404);
  }
  
  const deletedItem = items[itemIndex];
  items.splice(itemIndex, 1);
  
  return c.json({
    success: true,
    message: 'Item deleted successfully',
    data: deletedItem
  });
});

export default itemsRouter;
