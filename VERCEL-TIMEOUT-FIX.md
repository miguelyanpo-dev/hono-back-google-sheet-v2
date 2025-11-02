# Solución al Error 504 Timeout en Vercel

## Problemas Identificados

### 1. Error 504 FUNCTION_INVOCATION_TIMEOUT
Al hacer POST a `/api/calendar/event`

### 2. Error de Rate Limiting
```
Rate limit error: Error: Stream isn't writeable and enableOfflineQueue options is false
```
El middleware de rate limiting intentaba usar Redis sin verificar disponibilidad

## Cambios Realizados

### 1. Redis Optimizado (`src/lib/redis.ts`)
- **lazyConnect: true** - No conectar inmediatamente
- **maxRetriesPerRequest: 1** - Solo 1 reintento
- **connectTimeout: 2000ms** - Timeout reducido a 2 segundos
- **commandTimeout: 2000ms** - Timeout para comandos
- **enableOfflineQueue: false** - No encolar comandos si está offline

### 2. Rate Limiting Arreglado (`src/middlewares/rateLimit.ts`)
- Verificación de Redis disponible antes de usarlo
- Si Redis no está disponible, el rate limiting se deshabilita automáticamente
- No bloquea las peticiones cuando Redis no está configurado

### 3. Redis Lock Deshabilitado Temporalmente (`src/routes/service-calendar.routes.ts`)
- Redis lock comentado para evitar timeouts
- Se puede habilitar después de verificar que funciona sin él
- Logging detallado agregado para identificar cuellos de botella

### 4. Timeout Aumentado (`vercel.json`)
- Aumentado de 10 a 30 segundos
- **NOTA**: En plan gratuito de Vercel, el máximo es 10 segundos
- Para 30 segundos necesitas plan Pro ($20/mes)

### 5. Logging Detallado
- Timestamps en cada paso del proceso
- Identificar dónde se está tardando más tiempo

## Pasos para Resolver

### Opción 1: Sin Redis (Más Rápido)

1. **En Vercel Dashboard:**
   - Ve a Settings > Environment Variables
   - **ELIMINA** la variable `REDIS_URL` si existe
   - O déjala vacía

2. **Commit y Deploy:**
   ```bash
   git add .
   git commit -m "fix: optimizar para evitar timeout en Vercel"
   git push
   ```

3. **Verifica en Vercel Logs:**
   - Deberías ver: `Redis URL not configured, Redis features will be disabled`
   - Deberías ver: `Skipping Redis lock for faster response`

### Opción 2: Con Redis (Requiere Configuración Correcta)

1. **Crea cuenta en Upstash Redis:**
   - Ve a https://upstash.com/
   - Crea una base de datos Redis
   - Copia la URL de conexión (debe empezar con `rediss://`)

2. **Configura en Vercel:**
   ```
   REDIS_URL=rediss://default:tu-password@tu-redis-url.upstash.io:6379
   ```

3. **Habilita Redis Lock:**
   - Descomenta el código de Redis lock en `service-calendar.routes.ts`
   - Líneas 112-124

### Opción 3: Aumentar Timeout (Requiere Plan Pro)

Si tienes plan Pro de Vercel:

1. El timeout ya está configurado a 30 segundos en `vercel.json`
2. Esto debería ser suficiente para Google Calendar API

Si tienes plan gratuito:
- El máximo es 10 segundos
- Debes optimizar el código para que responda en menos de 10 segundos
- Redis debe estar deshabilitado o ser muy rápido

## Verificación de Variables de Entorno en Vercel

Asegúrate de tener configuradas estas variables:

### Requeridas:
```
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

### Opcionales:
```
CORS_ORIGIN=https://classbarber.es,https://www.classbarber.es
REDIS_URL=rediss://... (solo si quieres usar Redis)
TIMEZONE=America/Bogota
```

## Debugging

### Ver Logs en Tiempo Real

1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña "Logs"
4. Haz una petición POST
5. Observa los logs:

```
📅 POST /calendar/event - Request started
⏱️  Time elapsed: 5ms - Getting calendar client
⏱️  Time elapsed: 150ms - Parsing dates
⏱️  Time elapsed: 200ms - Checking availability
⏱️  Time elapsed: 2500ms - Availability checked
⏱️  Time elapsed: 2550ms - Creating event
✅ Event created successfully - Total time: 4800ms
```

### Identificar el Problema

Si ves que se tarda más de 10 segundos en algún paso:

1. **Getting calendar client (>5s):**
   - Problema con `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Verifica que esté correctamente configurada

2. **Checking availability (>5s):**
   - Google Calendar API lenta
   - Considera cachear resultados
   - Verifica permisos del Service Account

3. **Creating event (>5s):**
   - Google Calendar API lenta
   - Considera quitar `sendUpdates: 'all'` si no necesitas emails

## Solución Rápida (Recomendada)

Para que funcione **AHORA MISMO**:

1. **Elimina `REDIS_URL` de Vercel**
2. **Asegúrate que `GOOGLE_SERVICE_ACCOUNT_JSON` esté correcta**
3. **Redeploy**

Esto debería hacer que el endpoint responda en 2-5 segundos.

## Próximos Pasos

Una vez que funcione:

1. Monitorea los logs para ver tiempos de respuesta
2. Si necesitas Redis, configura Upstash
3. Si los tiempos son consistentemente >8s, considera plan Pro
4. Optimiza Google Calendar API calls si es necesario

## Contacto

Si el problema persiste después de estos cambios, revisa:
- Logs de Vercel para ver el error exacto
- Configuración de variables de entorno
- Permisos del Service Account en Google Cloud
