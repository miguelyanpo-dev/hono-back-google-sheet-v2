# Ejemplos de CURL - Aliado API Proxy

Este documento contiene ejemplos de cómo usar la API con CURL.

## 🔍 Facturas

### Obtener lista de facturas

**Ejemplo básico:**
```bash
curl --request GET \
  --url 'http://localhost:3001/api/v1/invoices' \
  --header 'accept: application/json'
```

**Con paginación:**
```bash
curl --request GET \
  --url 'http://localhost:3001/api/v1/invoices?page=1&itemsPerPage=10' \
  --header 'accept: application/json'
```

**Producción:**
```bash
curl --request GET \
  --url 'https://hono-back-google-sheet-v2.vercel.app/api/v1/invoices?page=1&itemsPerPage=10' \
  --header 'accept: application/json'
```

### Respuestas

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "pagination": {
      "page": 1,
      "itemsPerPage": 10,
      "total": 100
    }
  }
}
```

**Respuesta de error (500):**
```json
{
  "success": false,
  "error": "Error al obtener facturas",
  "message": "Error en petición a Aliado: 401 - Unauthorized"
}
```

## 🏥 Health Check

```bash
curl --request GET \
  --url 'http://localhost:3001/' \
  --header 'accept: application/json'
```

**Respuesta:**
```json
{
  "ok": true,
  "service": "aliado-api-proxy",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-11-24T20:44:00.000Z"
}
```

## 📖 Documentación OpenAPI

### Obtener especificación OpenAPI JSON

```bash
curl --request GET \
  --url 'http://localhost:3001/api/v1/openapi.json' \
  --header 'accept: application/json'
```

### Acceder a Swagger UI

Abre en tu navegador:
- Desarrollo: http://localhost:3001/api/v1/doc
- Producción: https://hono-back-aliado.vercel.app/api/v1/doc

## 🔧 Configuración

Recuerda configurar el token de Aliado en tu archivo `.env`:

```env
ALIADO_BEARER_TOKEN=tu_token_aqui
```

El proxy automáticamente incluirá este token en todas las peticiones a la API de Aliado.
