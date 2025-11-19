# Auth0 Management API

API REST para gestionar usuarios y roles de Auth0 usando la Management API v2, construida con [Hono](https://hono.dev/) - un framework web ultrarrápido y ligero para TypeScript.

## Características

- Framework Hono (rápido y ligero)
- TypeScript
- **Documentación Swagger/OpenAPI interactiva**
- Autenticación automática con Auth0
- Caché de tokens para optimizar peticiones
- Gestión completa de usuarios (CRUD)
- Gestión completa de roles (CRUD)
- Asignación de usuarios a roles
- CORS configurado
- Logging de requests
- Manejo de errores centralizado
- Validación de campos obligatorios
- Paginación en listados
- Desplegable en Vercel

## Instalación

```bash
npm install
```

## Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura las variables de entorno en `.env` con tus credenciales de Auth0:
```env
PORT=3001
NODE_ENV=development
PRODUCTION_URL=https://back-auth-0-yanpo.vercel.app
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Auth0 Configuration
URL_BASE=https://tu-tenant.auth0.com
PATH_API=/api/v2/
PATH_TOKEN=/oauth/token
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
AUTH0_AUDIENCE=https://tu-tenant.auth0.com/api/v2/
AUTH0_GRANT_TYPE=client_credentials
```

## Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## Documentación Swagger

Accede a la documentación interactiva en:

```
http://localhost:3001/api/v1/doc
```

Desde Swagger UI puedes:
- Ver todos los endpoints disponibles
- Probar las APIs directamente desde el navegador
- Ver esquemas de request/response
- Ejecutar peticiones en tiempo real

**Consulta `SWAGGER_GUIDE.md` para más detalles sobre cómo usar Swagger.**

## Endpoints Disponibles

### Health Check
```bash
GET /
```

### Rutas con Validación (Recomendadas - con Swagger)

Estas rutas incluyen validación automática con Zod y están documentadas en Swagger:

**Autenticación:**
- `POST /api/v1/auth/token` - Obtener token de Auth0

**Usuarios:**
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `PATCH /api/v1/users/:id` - Actualizar usuario

**Roles:**
- `GET /api/v1/roles` - Listar roles
- `POST /api/v1/roles` - Crear rol
- `PATCH /api/v1/roles/:id` - Actualizar rol
- `POST /api/v1/roles/:id/users` - Asignar usuarios a rol
- `GET /api/v1/roles/:id/users` - Obtener usuarios de un rol

### Rutas sin Validación (Más rápidas)

**Autenticación:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/token` | Obtener token de Auth0 |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/users` | Listar usuarios |
| `POST` | `/api/users` | Crear usuario |
| `PATCH` | `/api/users/:id` | Actualizar usuario |

### Roles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/roles` | Listar roles |
| `POST` | `/api/roles` | Crear rol |
| `PATCH` | `/api/roles/:id` | Actualizar rol |
| `POST` | `/api/roles/:id/users` | Asignar usuarios a rol |
| `GET` | `/api/roles/:id/users` | Obtener usuarios de un rol |

### Ejemplos de uso

**Obtener token:**
```bash
curl -X POST http://localhost:3001/api/auth/token
```

**Listar usuarios:**
```bash
curl http://localhost:3001/api/users?page=0&per_page=50
```

**Crear usuario:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "connection": "Username-Password-Authentication"
  }'
```

**Crear rol:**
```bash
curl -X POST http://localhost:3001/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "description": "Administrator role"
  }'
```

**Asignar usuarios a rol:**
```bash
curl -X POST http://localhost:3001/api/roles/rol_123/users \
  -H "Content-Type: application/json" \
  -d '{"users": ["auth0|user1", "auth0|user2"]}'
```

**Para más ejemplos detallados, consulta:**
- `API_DOCUMENTATION.md` - Documentación completa de la API
- `CURL_EXAMPLES.md` - Ejemplos de uso con cURL y PowerShell

## Estructura del Proyecto

```
src/
├── app.ts                    # Configuración principal de Hono
├── index.ts                  # Entry point
├── config/
│   └── config.ts             # Variables de configuración
├── services/
│   └── auth.service.ts       # Servicio de autenticación con Auth0
├── controllers/
│   ├── auth/
│   │   └── post_get_token.ts # Obtener token
│   ├── users/
│   │   ├── get_users.ts      # Listar usuarios
│   │   ├── post_create_user.ts # Crear usuario
│   │   └── patch_update_user.ts # Actualizar usuario
│   └── roles/
│       ├── get_roles.ts      # Listar roles
│       ├── post_create_role.ts # Crear rol
│       ├── patch_update_role.ts # Actualizar rol
│       ├── post_assign_user_to_role.ts # Asignar usuarios
│       └── get_role_users.ts # Usuarios de un rol
├── routes/
│   ├── auth.routes.ts        # Rutas de autenticación
│   ├── users.routes.ts       # Rutas de usuarios
│   └── roles.routes.ts       # Rutas de roles
├── middlewares/
│   └── logger.ts             # Middleware de logging
└── types/
    └── index.ts              # Tipos TypeScript
```

## Despliegue en Vercel

```bash
vercel --prod
```

## Tecnologías

- [Hono](https://hono.dev/) - Framework web ultrarrápido
- [TypeScript](https://www.typescriptlang.org/) - Lenguaje
- [Auth0 Management API](https://auth0.com/docs/api/management/v2) - API de gestión de Auth0
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - OpenAPI con Zod
- [@hono/swagger-ui](https://github.com/honojs/middleware/tree/main/packages/swagger-ui) - Interfaz Swagger UI
- [Zod](https://zod.dev/) - Validación de esquemas TypeScript
- [tsx](https://github.com/esbuild-kit/tsx) - TypeScript executor
- [dotenv](https://www.npmjs.com/package/dotenv) - Variables de entorno

## Notas Importantes

1. **Autenticación Automática**: Todas las peticiones a `/api/users` y `/api/roles` obtienen automáticamente un token de Auth0 antes de realizar la petición.

2. **Caché de Tokens**: El servicio de autenticación implementa un sistema de caché para evitar solicitar tokens innecesariamente.

3. **Variables de Entorno**: Asegúrate de configurar correctamente todas las variables en el archivo `.env`.

4. **Permisos**: Tu aplicación de Auth0 debe tener los permisos necesarios en la Management API para realizar las operaciones.

5. **Documentación**: Consulta `API_DOCUMENTATION.md` para información detallada de cada endpoint.

## Licencia

MIT