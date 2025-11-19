# Ejemplos de Uso con cURL

## Autenticación

### Obtener Token
```bash
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json"
```

---

## Usuarios

### Listar Usuarios
```bash
curl -X GET "http://localhost:3001/api/users?page=0&per_page=50" \
  -H "Content-Type: application/json"
```

### Listar Usuarios con Búsqueda
```bash
curl -X GET "http://localhost:3001/api/users?search=email:*@example.com*" \
  -H "Content-Type: application/json"
```

### Crear Usuario
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "connection": "Username-Password-Authentication",
    "given_name": "John",
    "family_name": "Doe",
    "name": "John Doe"
  }'
```

### Actualizar Usuario
```bash
curl -X PATCH http://localhost:3001/api/users/auth0|123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "given_name": "Jane",
    "family_name": "Smith",
    "blocked": false
  }'
```

---

## Roles

### Listar Roles
```bash
curl -X GET "http://localhost:3001/api/roles?page=0&per_page=50" \
  -H "Content-Type: application/json"
```

### Crear Rol
```bash
curl -X POST http://localhost:3001/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "description": "Administrator role with full access"
  }'
```

### Actualizar Rol
```bash
curl -X PATCH http://localhost:3001/api/roles/rol_123456789 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "description": "Super administrator with extended privileges"
  }'
```

### Asignar Usuarios a un Rol
```bash
curl -X POST http://localhost:3001/api/roles/rol_123456789/users \
  -H "Content-Type: application/json" \
  -d '{
    "users": ["auth0|user1", "auth0|user2"]
  }'
```

### Obtener Usuarios de un Rol
```bash
curl -X GET "http://localhost:3001/api/roles/rol_123456789/users?page=0&per_page=50" \
  -H "Content-Type: application/json"
```

---

## Ejemplos con PowerShell (Windows)

### Obtener Token
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/token" `
  -Method POST `
  -ContentType "application/json"
```

### Crear Usuario
```powershell
$body = @{
  email = "newuser@example.com"
  password = "SecurePass123!"
  connection = "Username-Password-Authentication"
  given_name = "John"
  family_name = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Listar Usuarios
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/users?page=0&per_page=50" `
  -Method GET `
  -ContentType "application/json"
```

### Crear Rol
```powershell
$body = @{
  name = "Admin"
  description = "Administrator role with full access"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/roles" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Asignar Usuarios a Rol
```powershell
$body = @{
  users = @("auth0|user1", "auth0|user2")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/roles/rol_123456789/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

## Notas

1. Reemplaza `localhost:3001` con la URL de tu servidor si es diferente.
2. Reemplaza los IDs de ejemplo (`auth0|123456789`, `rol_123456789`) con IDs reales de tu tenant de Auth0.
3. Todas las peticiones a usuarios y roles obtienen automáticamente el token de Auth0, no necesitas incluirlo manualmente.
4. El sistema implementa caché de tokens para optimizar las peticiones.
