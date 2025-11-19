# Auth0 Management API - Documentación

API REST para gestionar usuarios y roles de Auth0 usando la Management API v2.

## Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura las variables de entorno en `.env` con tus credenciales de Auth0:
```env
URL_BASE=https://tu-tenant.auth0.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
AUTH0_AUDIENCE=https://tu-tenant.auth0.com/api/v2/
```

3. Instala las dependencias:
```bash
npm install
```

4. Inicia el servidor:
```bash
npm run dev
```

## Endpoints

### Autenticación

#### POST /api/auth/token
Obtiene un token de acceso de Auth0.

**Response:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImlkUGNkdExPeW9EbUdFTnZXdVpaUSJ9...",
  "token_type": "Bearer"
}
```

---

### Usuarios

#### GET /api/users
Obtiene la lista de usuarios.

**Query Parameters:**
- `page` (opcional): Número de página (default: 0)
- `per_page` (opcional): Usuarios por página (default: 50)
- `search` (opcional): Búsqueda de usuarios

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

#### POST /api/users
Crea un nuevo usuario.

**Body (obligatorios):**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "connection": "Username-Password-Authentication"
}
```

**Body (opcionales):**
```json
{
  "phone_number": "+1234567890",
  "user_metadata": {},
  "blocked": false,
  "email_verified": false,
  "phone_verified": false,
  "app_metadata": {},
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe",
  "nickname": "johndoe",
  "picture": "https://example.com/photo.jpg",
  "verify_email": false,
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "auth0|...",
    "email": "user@example.com",
    ...
  }
}
```

#### PATCH /api/users/:id
Actualiza un usuario existente.

**Body (todos opcionales):**
```json
{
  "blocked": false,
  "email_verified": false,
  "email": "newemail@example.com",
  "phone_number": "+1234567890",
  "phone_verified": false,
  "user_metadata": {},
  "app_metadata": {},
  "given_name": "John",
  "family_name": "Doe",
  "name": "John Doe",
  "nickname": "johndoe",
  "picture": "https://example.com/photo.jpg",
  "verify_email": false,
  "verify_phone_number": false,
  "password": "NewSecurePass123!",
  "connection": "Username-Password-Authentication",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "auth0|...",
    ...
  }
}
```

---

### Roles

#### GET /api/roles
Obtiene la lista de roles.

**Query Parameters:**
- `page` (opcional): Número de página (default: 0)
- `per_page` (opcional): Roles por página (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

#### POST /api/roles
Crea un nuevo rol.

**Body (obligatorios):**
```json
{
  "name": "Admin",
  "description": "Administrator role with full access"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rol_...",
    "name": "Admin",
    "description": "Administrator role with full access"
  }
}
```

#### PATCH /api/roles/:id
Actualiza un rol existente.

**Body (opcionales):**
```json
{
  "name": "Super Admin",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rol_...",
    ...
  }
}
```

#### POST /api/roles/:id/users
Asigna usuarios a un rol.

**Body:**
```json
{
  "users": ["auth0|user1", "auth0|user2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Usuarios asignados al rol correctamente"
}
```

#### GET /api/roles/:id/users
Obtiene los usuarios asignados a un rol.

**Query Parameters:**
- `page` (opcional): Número de página (default: 0)
- `per_page` (opcional): Usuarios por página (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

---

## Estructura del Proyecto

```
src/
├── config/
│   └── config.ts              # Configuración y variables de entorno
├── services/
│   └── auth.service.ts        # Servicio de autenticación con Auth0
├── controllers/
│   ├── auth/
│   │   └── post_get_token.ts  # Controlador para obtener token
│   ├── users/
│   │   ├── get_users.ts       # Obtener usuarios
│   │   ├── post_create_user.ts # Crear usuario
│   │   └── patch_update_user.ts # Actualizar usuario
│   └── roles/
│       ├── get_roles.ts       # Obtener roles
│       ├── post_create_role.ts # Crear rol
│       ├── patch_update_role.ts # Actualizar rol
│       ├── post_assign_user_to_role.ts # Asignar usuarios a rol
│       └── get_role_users.ts  # Obtener usuarios de un rol
├── routes/
│   ├── auth.routes.ts         # Rutas de autenticación
│   ├── users.routes.ts        # Rutas de usuarios
│   └── roles.routes.ts        # Rutas de roles
├── middlewares/
│   └── logger.ts              # Middleware de logging
├── app.ts                     # Configuración de la aplicación
└── index.ts                   # Punto de entrada
```

## Características

- ✅ Autenticación automática con Auth0
- ✅ Caché de tokens para optimizar peticiones
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Gestión completa de roles (CRUD)
- ✅ Asignación de usuarios a roles
- ✅ Manejo de errores centralizado
- ✅ Validación de campos obligatorios
- ✅ Paginación en listados
- ✅ CORS configurado
- ✅ Logger de peticiones

## Notas Importantes

1. **Autenticación Automática**: Todas las peticiones a `/api/users` y `/api/roles` obtienen automáticamente un token de Auth0 antes de realizar la petición.

2. **Caché de Tokens**: El servicio de autenticación implementa un sistema de caché para evitar solicitar tokens innecesariamente.

3. **Variables de Entorno**: Asegúrate de configurar correctamente todas las variables en el archivo `.env`.

4. **Permisos**: Tu aplicación de Auth0 debe tener los permisos necesarios en la Management API para realizar las operaciones.
