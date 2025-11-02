# Redis en Entornos Serverless (Vercel)

## Problema Identificado

El endpoint POST `/api/calendar/event` se quedaba cargando indefinidamente en producción (Vercel) porque intentaba conectarse a Redis sin éxito, bloqueando la función serverless.

## Causa

En entornos serverless como Vercel:
1. Las funciones tienen un **timeout limitado** (10 segundos en plan gratuito, 60 segundos en planes pagos)
2. Si Redis no está configurado o no puede conectarse, la función se queda esperando hasta el timeout
3. Esto causa que las peticiones fallen o se queden cargando indefinidamente

## Solución Implementada

### 1. Redis Opcional

Se modificó `src/lib/redis.ts` para hacer Redis completamente opcional:

- Si `REDIS_URL` no está configurada, Redis se desactiva automáticamente
- Si hay error al conectar, se captura y se continúa sin Redis
- Se agregó un timeout de conexión de 5 segundos

### 2. Lock Distribuido Opcional

El sistema de bloqueo distribuido (Redlock) ahora es opcional:

- Si Redis no está disponible, el endpoint funciona sin lock distribuido
- Se muestra un warning en los logs cuando Redis no está disponible
- El endpoint sigue funcionando normalmente para crear eventos

### 3. Timeout Configurado

Se agregó configuración de timeout en `vercel.json`:

```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 10
    }
  }
}
```

## Configuración en Vercel

### Opción 1: Sin Redis (Recomendado para empezar)

**No configures la variable `REDIS_URL`** en Vercel. El sistema funcionará sin bloqueo distribuido.

**Ventajas:**
- Más simple
- Sin costos adicionales
- Funciona inmediatamente

**Desventajas:**
- Sin protección contra race conditions en reservas simultáneas
- Para bajo volumen de tráfico, esto no es un problema

### Opción 2: Con Redis (Recomendado para producción con alto tráfico)

Si necesitas bloqueo distribuido para evitar reservas duplicadas:

1. **Crea una instancia de Redis** compatible con Vercel:
   - [Upstash Redis](https://upstash.com/) (Recomendado - tiene plan gratuito)
   - [Redis Labs](https://redis.com/)
   - Cualquier Redis con acceso público

2. **Configura la variable en Vercel:**
   ```
   REDIS_URL=rediss://default:password@your-redis-url:6379
   ```

3. **Redeploy** el proyecto

## Verificación

### Logs en Vercel

Después de desplegar, revisa los logs en Vercel:

**Sin Redis:**
```
Redis URL not configured, Redis features will be disabled
Redis not available, proceeding without distributed lock
```

**Con Redis funcionando:**
```
Redis connected successfully
Lock acquired for slot: lock:calendar:xxx:slot:2025-11-07T09:00:00
```

### Prueba el Endpoint

```bash
curl -X POST https://back-agendamiento-class-barber.vercel.app/api/calendar/event \
  -H "Content-Type: application/json" \
  -d '{
    "calendarId": "tu-calendar-id",
    "startDateTime": "2025-11-07T09:00:00",
    "summary": "Prueba",
    "name": "Cliente Test"
  }'
```

Debería responder en menos de 3 segundos.

## Recomendaciones

### Para Desarrollo Local
- Usa Redis local con Docker: `docker run -p 6379:6379 redis`
- O no uses Redis, el sistema funciona sin él

### Para Producción
- **Bajo tráfico (<100 reservas/día)**: No necesitas Redis
- **Alto tráfico (>100 reservas/día)**: Usa Upstash Redis (plan gratuito: 10,000 comandos/día)

## Troubleshooting

### El POST sigue cargando indefinidamente

1. Verifica que hayas redeployado después de los cambios
2. Revisa los logs en Vercel Dashboard
3. Asegúrate que `REDIS_URL` NO esté configurada (o esté correcta)
4. Verifica que `GOOGLE_SERVICE_ACCOUNT_KEY` esté configurada correctamente

### Error "Lock acquisition failed"

- Redis está configurado pero no es accesible
- Solución: Elimina la variable `REDIS_URL` de Vercel o configura una instancia válida

### Timeout después de 10 segundos

- La función está tardando demasiado
- Posibles causas:
  - Google Calendar API lenta
  - Redis intentando conectar sin éxito
  - Revisa los logs para identificar el cuello de botella
