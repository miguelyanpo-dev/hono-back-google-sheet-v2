# Guía de Swagger UI

## 🎯 Acceso a la Documentación

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de Swagger en:

```
http://localhost:3001/api/v1/doc
```

O simplemente:

```
http://localhost:3001/api/v1
```

## 📚 Características de Swagger UI

### 1. **Explorar Endpoints**
- Todos los endpoints están organizados por categorías (tags):
  - **Autenticación**: Obtener token de Auth0
  - **Usuarios**: CRUD completo de usuarios
  - **Roles**: CRUD completo de roles y asignación de usuarios

### 2. **Probar APIs Directamente**
- Haz clic en cualquier endpoint para expandirlo
- Haz clic en el botón **"Try it out"**
- Completa los parámetros requeridos
- Haz clic en **"Execute"** para enviar la petición
- Verás la respuesta en tiempo real

### 3. **Ver Esquemas**
- Cada endpoint muestra:
  - Parámetros requeridos y opcionales
  - Tipos de datos esperados
  - Ejemplos de request y response
  - Códigos de estado HTTP posibles

## 🔄 Diferencia entre Rutas

### Rutas sin validación (más rápidas):
```
/api/auth/*
/api/users/*
/api/roles/*
```

### Rutas con validación OpenAPI (recomendadas para desarrollo):
```
/api/v1/auth/*
/api/v1/users/*
/api/v1/roles/*
```

Las rutas `/api/v1/*` incluyen:
- ✅ Validación automática de datos con Zod
- ✅ Documentación en Swagger
- ✅ Mensajes de error más descriptivos
- ✅ Ejemplos interactivos

## 📝 Ejemplos de Uso en Swagger

### 1. Obtener Token
1. Ve a **Autenticación → POST /token**
2. Haz clic en "Try it out"
3. Haz clic en "Execute"
4. Copia el `access_token` de la respuesta (aunque no lo necesitas manualmente)

### 2. Crear Usuario
1. Ve a **Usuarios → POST /users**
2. Haz clic en "Try it out"
3. Edita el JSON de ejemplo:
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "connection": "Username-Password-Authentication",
  "given_name": "Test",
  "family_name": "User"
}
```
4. Haz clic en "Execute"
5. Verás el usuario creado en la respuesta

### 3. Listar Usuarios
1. Ve a **Usuarios → GET /users**
2. Haz clic en "Try it out"
3. Opcionalmente configura:
   - `page`: Número de página (ej: 0)
   - `per_page`: Usuarios por página (ej: 50)
   - `search`: Búsqueda (ej: `email:*@example.com*`)
4. Haz clic en "Execute"

### 4. Crear Rol
1. Ve a **Roles → POST /roles**
2. Haz clic en "Try it out"
3. Edita el JSON:
```json
{
  "name": "Administrator",
  "description": "Full access administrator role"
}
```
4. Haz clic en "Execute"

### 5. Asignar Usuarios a Rol
1. Ve a **Roles → POST /roles/{id}/users**
2. Haz clic en "Try it out"
3. Ingresa el ID del rol en el parámetro `id`
4. Edita el JSON con los IDs de usuarios:
```json
{
  "users": ["auth0|123456", "auth0|789012"]
}
```
5. Haz clic en "Execute"

## 🎨 Interfaz de Swagger

La interfaz de Swagger te permite:

- 📖 **Ver documentación completa** de cada endpoint
- 🧪 **Probar APIs** sin necesidad de Postman o cURL
- 📋 **Copiar ejemplos** de código
- 🔍 **Buscar** endpoints específicos
- 📊 **Ver modelos** de datos (schemas)
- ⚡ **Ejecutar peticiones** en tiempo real

## 🚀 Ventajas

1. **No necesitas Postman**: Todo desde el navegador
2. **Documentación siempre actualizada**: Se genera automáticamente del código
3. **Validación automática**: Los datos se validan antes de llegar a Auth0
4. **Ejemplos interactivos**: Aprende mientras pruebas
5. **Errores claros**: Mensajes descriptivos cuando algo falla

## 📌 Notas Importantes

- ✅ **Autenticación automática**: No necesitas agregar tokens manualmente, el sistema lo hace por ti
- ✅ **Caché de tokens**: Los tokens se reutilizan para optimizar peticiones
- ✅ **Validación Zod**: Los datos se validan según los esquemas definidos
- ✅ **Respuestas consistentes**: Todas las respuestas siguen el mismo formato

## 🔗 URLs Útiles

- **Swagger UI**: http://localhost:3001/api/v1/doc
- **OpenAPI JSON**: http://localhost:3001/api/v1/openapi.json
- **Health Check**: http://localhost:3001/

## 💡 Tips

1. **Usa Swagger para desarrollo**: Es más rápido que cURL o Postman
2. **Copia los ejemplos**: Los ejemplos en Swagger son válidos y funcionan
3. **Revisa los schemas**: Te ayudan a entender qué campos son obligatorios
4. **Prueba primero en Swagger**: Antes de integrar en tu aplicación
5. **Exporta la especificación**: Puedes usar el JSON de OpenAPI en otras herramientas
