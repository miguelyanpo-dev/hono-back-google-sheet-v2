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

### Health Check
```bash
GET /
```

### Items CRUD

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/items` | Listar todos los items |
| `GET` | `/api/items/:id` | Obtener un item por ID |
| `POST` | `/api/items` | Crear nuevo item |
| `PUT` | `/api/items/:id` | Actualizar item |
| `DELETE` | `/api/items/:id` | Eliminar item |

### Ejemplos de uso

**Crear item:**
```bash
curl -X POST http://localhost:3001/api/items \
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

## 📝 Notas

- El almacenamiento actual es en memoria (se reinicia al reiniciar el servidor)
- Para producción, integra una base de datos (PostgreSQL, MongoDB, etc.)
- Personaliza las rutas según tus necesidades

## 📄 Licencia

MIT