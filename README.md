# Hono CRUD API

API REST básica construida con [Hono](https://hono.dev/) - un framework web ultrarrápido y ligero para TypeScript.

## 🚀 Características

- ✅ Framework Hono (rápido y ligero)
- ✅ TypeScript
- ✅ CRUD completo de ejemplo
- ✅ CORS configurado
- ✅ Logging de requests
- ✅ Manejo de errores
- ✅ Desplegable en Vercel
- ✅ **Documentación Swagger/OpenAPI integrada**
- ✅ Validación de datos con Zod

## 📦 Instalación

```bash
npm install
```

## ⚙️ Configuración

Crea un archivo `.env` en la raíz:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=*
```

## 🏃 Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📡 Endpoints Disponibles

### 📚 Documentación Swagger

Accede a la documentación interactiva de la API:

```
http://localhost:3001/api/v1/doc
```

La documentación Swagger te permite:
- Ver todos los endpoints disponibles
- Probar las APIs directamente desde el navegador
- Ver los esquemas de request/response
- Validar datos con Zod schemas

### Health Check
```bash
GET /
```

### Items CRUD (Rutas estándar)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/items` | Listar todos los items |
| `GET` | `/api/items/:id` | Obtener un item por ID |
| `POST` | `/api/items` | Crear nuevo item |
| `PUT` | `/api/items/:id` | Actualizar item |
| `DELETE` | `/api/items/:id` | Eliminar item |

### Items CRUD (Rutas OpenAPI con validación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/items` | Listar todos los items |
| `GET` | `/api/v1/items/:id` | Obtener un item por ID |
| `POST` | `/api/v1/items` | Crear nuevo item (con validación Zod) |
| `PUT` | `/api/v1/items/:id` | Actualizar item (con validación Zod) |
| `DELETE` | `/api/v1/items/:id` | Eliminar item |

### Ejemplos de uso

**Crear item:**
```bash
curl -X POST http://localhost:3001/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Mi Item", "description": "Descripción del item"}'
```

**Listar items:**
```bash
curl http://localhost:3001/api/items
```

**Obtener item:**
```bash
curl http://localhost:3001/api/items/1
```

**Actualizar item:**
```bash
curl -X PUT http://localhost:3001/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Item Actualizado"}'
```

**Eliminar item:**
```bash
curl -X DELETE http://localhost:3001/api/items/1
```

## 📁 Estructura del Proyecto

```
src/
├── app.ts              # Configuración principal de Hono
├── index.ts            # Entry point
├── config/
│   └── config.ts       # Variables de configuración
├── middlewares/
│   └── logger.ts       # Middleware de logging
├── routes/
│   └── items.routes.ts # Rutas CRUD de ejemplo
└── types/
    └── index.ts        # Tipos TypeScript
```

## 🚀 Despliegue en Vercel

```bash
vercel --prod
```

## 🛠️ Tecnologías

- [Hono](https://hono.dev/) - Framework web
- [TypeScript](https://www.typescriptlang.org/) - Lenguaje
- [tsx](https://github.com/esbuild-kit/tsx) - TypeScript executor
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - OpenAPI con Zod
- [@hono/swagger-ui](https://github.com/honojs/middleware/tree/main/packages/swagger-ui) - Interfaz Swagger UI
- [Zod](https://zod.dev/) - Validación de esquemas TypeScript

## 📝 Notas

- El almacenamiento actual es en memoria (se reinicia al reiniciar el servidor)
- Para producción, integra una base de datos (PostgreSQL, MongoDB, etc.)
- Personaliza las rutas según tus necesidades

## 📄 Licencia

MIT