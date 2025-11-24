# Guía de Módulos - Aliado API Proxy

Esta guía describe la estructura modular del proyecto y cómo agregar nuevos módulos.

## 📁 Estructura de Módulos

El proyecto está organizado en módulos funcionales. Actualmente implementado:

### Módulo de Facturas (Invoices)

```
src/
├── controllers/invoices/
│   └── get_invoices.ts       # Controlador para obtener facturas
├── routes/
│   └── invoices.routes.ts    # Definición de rutas OpenAPI
├── schemas/
│   └── invoices.schemas.ts   # Esquemas de validación Zod
└── services/
    └── aliado.service.ts     # Servicio para comunicación con Aliado API
```

## 🔧 Componentes del Módulo

### 1. Service (Servicio)
**Ubicación**: `src/services/aliado.service.ts`

El servicio maneja la comunicación con la API externa de Aliado:

```typescript
export class AliadoService {
  static async authenticatedRequest(endpoint: string, options?: RequestInit) {
    // Maneja autenticación y peticiones HTTP
  }
  
  static async getInvoices(page: number, itemsPerPage: number) {
    // Método específico para obtener facturas
  }
}
```

### 2. Schema (Esquema)
**Ubicación**: `src/schemas/invoices.schemas.ts`

Define los esquemas de validación con Zod:

```typescript
export const InvoicesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  itemsPerPage: z.string().optional().default('10'),
});

export const SuccessResponse = z.object({
  success: z.boolean(),
  data: z.any(),
});
```

### 3. Controller (Controlador)
**Ubicación**: `src/controllers/invoices/get_invoices.ts`

Maneja la lógica de negocio del endpoint:

```typescript
export const getInvoices = async (c: Context) => {
  try {
    const { page, itemsPerPage } = c.req.query();
    const data = await AliadoService.getInvoices(pageNum, itemsNum);
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ success: false, error: '...', message: '...' }, 500);
  }
};
```

### 4. Routes (Rutas)
**Ubicación**: `src/routes/invoices.routes.ts`

Define las rutas OpenAPI y conecta con los controladores:

```typescript
const getInvoicesRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Facturas'],
  summary: 'Listar facturas',
  request: { query: InvoicesQuerySchema },
  responses: { /* ... */ },
});

invoicesRouter.openapi(getInvoicesRoute, getInvoices);
```

## ➕ Cómo Agregar un Nuevo Módulo

### Ejemplo: Módulo de Clientes

#### Paso 1: Crear el Servicio

Agregar métodos al servicio de Aliado:

```typescript
// src/services/aliado.service.ts
static async getClients(page: number, itemsPerPage: number) {
  const endpoint = `clients?page=${page}&itemsPerPage=${itemsPerPage}`;
  return await this.authenticatedRequest(endpoint);
}

static async getClientById(id: string) {
  const endpoint = `clients/${id}`;
  return await this.authenticatedRequest(endpoint);
}
```

#### Paso 2: Crear los Esquemas

```typescript
// src/schemas/clients.schemas.ts
import { z } from 'zod';

export const ClientsQuerySchema = z.object({
  page: z.string().optional().default('1'),
  itemsPerPage: z.string().optional().default('10'),
});

export const ClientIdSchema = z.object({
  id: z.string(),
});
```

#### Paso 3: Crear los Controladores

```typescript
// src/controllers/clients/get_clients.ts
import { Context } from 'hono';
import { AliadoService } from '../../services/aliado.service';

export const getClients = async (c: Context) => {
  try {
    const { page = '1', itemsPerPage = '10' } = c.req.query();
    const data = await AliadoService.getClients(
      parseInt(page), 
      parseInt(itemsPerPage)
    );
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Error al obtener clientes', 
      message: String(error) 
    }, 500);
  }
};
```

```typescript
// src/controllers/clients/get_client_by_id.ts
import { Context } from 'hono';
import { AliadoService } from '../../services/aliado.service';

export const getClientById = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const data = await AliadoService.getClientById(id);
    return c.json({ success: true, data });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Error al obtener cliente', 
      message: String(error) 
    }, 500);
  }
};
```

#### Paso 4: Crear las Rutas

```typescript
// src/routes/clients.routes.ts
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { ClientsQuerySchema, ClientIdSchema, SuccessResponse, ErrorResponse } from '../schemas/clients.schemas';
import { getClients } from '../controllers/clients/get_clients';
import { getClientById } from '../controllers/clients/get_client_by_id';

const clientsRouter = new OpenAPIHono();

const getClientsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Clientes'],
  summary: 'Listar clientes',
  request: { query: ClientsQuerySchema },
  responses: {
    200: {
      description: 'Lista de clientes',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al obtener clientes',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

const getClientByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Clientes'],
  summary: 'Obtener cliente por ID',
  request: { params: ClientIdSchema },
  responses: {
    200: {
      description: 'Cliente obtenido',
      content: { 'application/json': { schema: SuccessResponse } },
    },
    500: {
      description: 'Error al obtener cliente',
      content: { 'application/json': { schema: ErrorResponse } },
    },
  },
});

// @ts-expect-error - Known issue with @hono/zod-openapi type inference
clientsRouter.openapi(getClientsRoute, getClients);
// @ts-expect-error - Known issue with @hono/zod-openapi type inference
clientsRouter.openapi(getClientByIdRoute, getClientById);

export default clientsRouter;
```

#### Paso 5: Registrar en app.ts

```typescript
// src/app.ts
import clientsRouter from './routes/clients.routes';

// ...

// Mount Clients routes
apiV1.route('/clients', clientsRouter);
```

#### Paso 6: Actualizar OpenAPI JSON

Agregar las rutas en la documentación OpenAPI en `app.ts`:

```typescript
paths: {
  // ... rutas existentes
  '/clients': {
    get: {
      tags: ['Clientes'],
      summary: 'Listar clientes',
      // ... definición completa
    },
  },
  '/clients/{id}': {
    get: {
      tags: ['Clientes'],
      summary: 'Obtener cliente por ID',
      // ... definición completa
    },
  },
}
```

## 🎯 Mejores Prácticas

1. **Separación de responsabilidades**: Cada capa tiene una responsabilidad específica
2. **Reutilización**: El servicio `AliadoService` es compartido por todos los módulos
3. **Validación**: Usa Zod para validar entrada y salida
4. **Tipado**: Aprovecha TypeScript para mayor seguridad
5. **Documentación**: Cada endpoint debe estar documentado en OpenAPI
6. **Manejo de errores**: Siempre captura y maneja errores apropiadamente

## 🔄 Flujo de una Petición

```
Cliente HTTP
    ↓
app.ts (CORS, Logger)
    ↓
invoices.routes.ts (Validación OpenAPI)
    ↓
get_invoices.ts (Lógica de negocio)
    ↓
aliado.service.ts (Comunicación con API externa)
    ↓
API de Aliado
    ↓
Respuesta al Cliente
```

## 📝 Checklist para Nuevo Módulo

- [ ] Agregar métodos al servicio `AliadoService`
- [ ] Crear esquemas de validación en `src/schemas/`
- [ ] Crear controladores en `src/controllers/[modulo]/`
- [ ] Crear archivo de rutas en `src/routes/[modulo].routes.ts`
- [ ] Registrar rutas en `src/app.ts`
- [ ] Actualizar documentación OpenAPI en `app.ts`
- [ ] Agregar ejemplos CURL en `CURL_EXAMPLES.md`
- [ ] Probar endpoints con `npm run dev`
- [ ] Verificar documentación en `/api/v1/doc`

## 🚀 Próximos Módulos Sugeridos

- **Clientes**: Gestión de clientes
- **Productos**: Catálogo de productos
- **Pagos**: Registro de pagos
- **Reportes**: Generación de reportes
- **Configuración**: Ajustes de la cuenta

Cada módulo seguirá la misma estructura y patrones establecidos en el módulo de Facturas.
