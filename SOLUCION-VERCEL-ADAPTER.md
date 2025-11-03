# 🔧 Solución: Problema de Adaptador Vercel + Body Parsing

## El Problema Real Identificado

El timeout de 30 segundos NO era causado por:
- ❌ Rate limiting (ya lo deshabilitamos)
- ❌ Google Calendar API
- ❌ Redis

**El problema real**: `c.req.json()` se cuelga indefinidamente en Vercel. Esto es un problema de compatibilidad entre:
- El adaptador `@hono/node-server/vercel`
- El runtime de Vercel
- El body parsing de Hono

## Evidencia

```
01:10:21.684 [info] ⏱️  Time elapsed: 0ms - Parsing request body
[30 SEGUNDOS DE SILENCIO]
01:10:51.669 [error] Vercel Runtime Timeout Error
```

Nunca llega a "Body parsed successfully" - el `await c.req.json()` nunca termina.

## Soluciones Aplicadas

### 1. Cambio de Adaptador (`api/index.ts`)

**Antes:**
```typescript
import { handle } from '@hono/node-server/vercel';
export default handle(app);
```

**Después:**
```typescript
// Export the Hono app directly for Vercel
// Vercel's Edge Runtime can handle Hono apps natively
export default app;
```

**Por qué**: Vercel puede manejar apps de Hono directamente sin necesidad del adaptador `@hono/node-server/vercel`, que puede estar causando problemas con el body parsing.

### 2. Body Parsing Manual (`src/routes/service-calendar.routes.ts`)

```typescript
// Workaround for Vercel/Hono body parsing issue
const rawRequest = c.req.raw;
const text = await rawRequest.text();
body = JSON.parse(text) as Body;
```

**Por qué**: Si `c.req.json()` falla, parseamos el raw request directamente.

### 3. Configuración Vercel Mejorada (`vercel.json`)

```json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 60,  // Aumentado de 30 a 60 segundos
      "memory": 1024      // Memoria explícita
    }
  }
}
```

**Por qué**: 
- Más tiempo para operaciones lentas
- Memoria suficiente para el runtime

## Resultado Esperado

### Logs de Éxito:
```
[info] ⚠️  Rate limiting DISABLED to fix body parsing timeout
[info] 📅 POST /calendar/event - Request started
[info] ⏱️  Time elapsed: 0ms - Parsing request body
[info] ⏱️  Time elapsed: 5ms - Got raw request
[info] ⏱️  Time elapsed: 50ms - Got text, length: 345
[info] ⏱️  Time elapsed: 51ms - Body parsed successfully
[info] ⏱️  Time elapsed: 52ms - Getting calendar client
[info] 🔄 Initializing Google Auth client...
[info] 🔐 Google Auth client initialized successfully
[info] ⏱️  Time elapsed: 1234ms - Calendar client obtained
[info] ⏱️  Time elapsed: 2456ms - Availability checked
[info] ✅ Event created successfully - Total time: 4567ms
```

## Si Esto También Falla

Si el problema persiste, considera estas alternativas:

### Opción A: Usar Vercel Edge Functions
Cambiar a Edge Functions en lugar de Serverless Functions:
```json
// vercel.json
{
  "functions": {
    "api/index.ts": {
      "runtime": "edge"
    }
  }
}
```

### Opción B: Migrar a Next.js API Routes
Si Hono sigue teniendo problemas con Vercel, considera migrar a Next.js API Routes que tienen soporte nativo de Vercel.

### Opción C: Usar otro hosting
- Railway
- Render
- Fly.io
- Google Cloud Run

Todos estos tienen mejor soporte para aplicaciones Hono estándar.

## Despliegue

```bash
# Build
npm run build

# Deploy
vercel --prod
```

## Monitoreo

Busca estos logs específicos:
- ✅ `Got raw request` - Confirma que el raw request está disponible
- ✅ `Got text, length: X` - Confirma que el body se recibió
- ✅ `Body parsed successfully` - Confirma que el parsing funcionó
- ✅ `Event created successfully` - Operación completa

Si ves timeout antes de "Got raw request", el problema es más profundo (Vercel runtime).

## Archivos Modificados

1. `api/index.ts` - Cambio de adaptador
2. `src/routes/service-calendar.routes.ts` - Body parsing manual
3. `vercel.json` - Configuración mejorada

## Próximos Pasos

1. **Deploy y probar** - Esta debería ser la solución
2. **Si falla**: Revisar logs para ver dónde se detiene
3. **Si persiste**: Considerar migración a Edge Functions o diferente hosting

**Estado**: 🟡 Solución aplicada - requiere prueba
**Confianza**: 🟢 Media-Alta - cambio de adaptador debería resolver el problema
