# Changelog

## [1.0.0] - 2024-11-24

### 🔄 Cambios Mayores

#### Migración de Auth0 a Aliado
- **BREAKING CHANGE**: Eliminada toda la funcionalidad de Auth0
- Proyecto redirigido para trabajar con el proveedor de contabilidad Aliado
- Nuevo nombre del proyecto: `aliado-api-proxy`

### ✨ Nuevas Características

#### Módulo de Facturas
- Endpoint GET `/api/v1/invoices` para obtener lista de facturas
- Soporte de paginación con parámetros `page` y `itemsPerPage`
- Autenticación automática con Bearer Token desde variables de entorno

#### Infraestructura
- Servicio `AliadoService` para comunicación con API de Aliado
- Esquemas de validación con Zod
- Documentación OpenAPI/Swagger actualizada
- Estructura modular para fácil expansión

### 🗑️ Eliminado

#### Archivos y Carpetas Eliminados
- `src/controllers/auth/` - Controladores de Auth0
- `src/controllers/users/` - Controladores de usuarios
- `src/controllers/roles/` - Controladores de roles
- `src/routes/auth.*` - Rutas de autenticación Auth0
- `src/routes/users.*` - Rutas de usuarios
- `src/routes/roles.*` - Rutas de roles
- `src/services/auth.service.ts` - Servicio de Auth0
- `src/schemas/auth.schemas.ts` - Esquemas de Auth0
- `src/schemas/users.schemas.ts` - Esquemas de usuarios
- `src/schemas/roles.schemas.ts` - Esquemas de roles
- `src/types/` - Tipos de Auth0

### 🔧 Configuración

#### Variables de Entorno Actualizadas
```env
# Eliminadas
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET
- AUTH0_AUDIENCE
- AUTH0_GRANT_TYPE
- URL_BASE
- PATH_API
- PATH_TOKEN

# Agregadas
+ ALIADO_API_URL
+ ALIADO_BEARER_TOKEN
```

### 📝 Documentación

#### Nuevos Documentos
- `README.md` - Documentación principal actualizada
- `CURL_EXAMPLES.md` - Ejemplos de uso con CURL
- `GUIA_MODULOS.md` - Guía para agregar nuevos módulos
- `.env.example` - Ejemplo de configuración

#### Documentos Eliminados
- `API_DOCUMENTATION.md` - Documentación antigua de Auth0
- `SWAGGER_GUIDE.md` - Guía antigua de Swagger

### 🏗️ Estructura del Proyecto

#### Nueva Estructura
```
src/
├── config/
│   └── config.ts              # Configuración actualizada para Aliado
├── controllers/
│   ├── example/               # Ejemplos (sin cambios)
│   └── invoices/              # ✨ Nuevo módulo de facturas
├── middlewares/
│   └── logger.ts              # Sin cambios
├── routes/
│   └── invoices.routes.ts     # ✨ Nuevas rutas de facturas
├── schemas/
│   └── invoices.schemas.ts    # ✨ Nuevos esquemas
├── services/
│   └── aliado.service.ts      # ✨ Nuevo servicio de Aliado
├── app.ts                     # Reescrito completamente
└── index.ts                   # Sin cambios
```

### 🔐 Seguridad

- Token Bearer almacenado como variable de entorno
- Sin credenciales hardcodeadas en el código
- CORS configurado para producción

### 🚀 Despliegue

- Configuración de Vercel mantenida
- Scripts de build actualizados
- Health check endpoint actualizado

### 📊 Endpoints Disponibles

#### Antes (Auth0)
- POST `/api/auth/token`
- GET `/api/users`
- POST `/api/users`
- PATCH `/api/users/{id}`
- GET `/api/users/{id}/roles`
- POST `/api/users/{id}/roles`
- DELETE `/api/users/{id}/roles`
- GET `/api/roles`
- POST `/api/roles`
- PATCH `/api/roles/{id}`
- GET `/api/roles/{id}/users`
- POST `/api/roles/{id}/users`

#### Ahora (Aliado)
- GET `/api/v1/invoices` - Listar facturas con paginación

### 🎯 Próximos Pasos

- [ ] Agregar más endpoints del módulo de facturas (crear, actualizar, eliminar)
- [ ] Implementar módulo de Clientes
- [ ] Implementar módulo de Productos
- [ ] Implementar módulo de Pagos
- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Implementar rate limiting
- [ ] Agregar caché para respuestas

### 🐛 Correcciones

- Eliminados errores de TypeScript relacionados con Auth0
- Limpieza de imports no utilizados
- Actualización de referencias en documentación

### 📦 Dependencias

#### Sin Cambios
- `@hono/node-server`: 1.13.0
- `@hono/swagger-ui`: ^0.5.2
- `@hono/zod-openapi`: ^1.1.5
- `dotenv`: 17.2.3
- `hono`: 4.6.0
- `zod`: ^4.1.12

### 💡 Notas de Migración

Si estabas usando la versión anterior con Auth0:

1. Actualiza tus variables de entorno según `.env.example`
2. Todos los endpoints de Auth0 han sido eliminados
3. Usa los nuevos endpoints de Aliado documentados en `/api/v1/doc`
4. El token de autenticación ahora se configura en el servidor, no se requiere en cada petición del cliente

---

Para más información, consulta:
- [README.md](./README.md) - Documentación principal
- [GUIA_MODULOS.md](./GUIA_MODULOS.md) - Guía de desarrollo
- [CURL_EXAMPLES.md](./CURL_EXAMPLES.md) - Ejemplos de uso
