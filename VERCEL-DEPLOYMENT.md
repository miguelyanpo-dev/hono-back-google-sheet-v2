# Guía de Despliegue en Vercel (Serverless)

Este proyecto está configurado para desplegarse en Vercel como una aplicación serverless.

## Archivos de Configuración Creados

- **`api/index.ts`**: Punto de entrada para la función serverless de Vercel
- **`vercel.json`**: Configuración de Vercel con rewrites
- **`.vercelignore`**: Archivos excluidos del despliegue

## Pasos para Desplegar

### 1. Instalar Vercel CLI (opcional, para despliegue desde terminal)

```bash
npm install -g vercel
```

### 2. Despliegue desde la Terminal

Desde el directorio del proyecto, ejecuta:

```bash
vercel
```

Para producción:

```bash
vercel --prod
```

### 3. Despliegue desde el Dashboard de Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "Add New Project"
3. Importa tu repositorio de Git (GitHub, GitLab, o Bitbucket)
4. Vercel detectará automáticamente la configuración
5. Configura las variables de entorno (ver sección siguiente)
6. Haz clic en "Deploy"

## Variables de Entorno Requeridas

Debes configurar estas variables de entorno en el dashboard de Vercel:

### Variables Obligatorias

- **`GOOGLE_SERVICE_ACCOUNT_EMAIL`**: Email de la cuenta de servicio de Google
- **`GOOGLE_SERVICE_ACCOUNT_KEY`**: Clave privada de la cuenta de servicio (formato JSON)
- **`GOOGLE_CALENDAR_ID`**: ID del calendario de Google
- **`REDIS_URL`**: URL de conexión a Redis (ej: `redis://...`)

### Variables Opcionales

- **`PORT`**: Puerto (no necesario en Vercel, se usa solo en desarrollo local)
- **`APPOINTMENT_DURATION`**: Duración de citas en minutos (default: 60)
- **`TIMEZONE`**: Zona horaria (default: 'Europe/Madrid')
- **`BUSINESS_START`**: Hora de inicio (default: '09:00')
- **`BUSINESS_END`**: Hora de fin (default: '18:00')
- **`LOCK_EXPIRE`**: Segundos de expiración del lock (default: 15)
- **`LOCK_RETRY`**: Reintentos del lock (default: 2)
- **`LOCK_DELAY`**: Delay entre reintentos en ms (default: 250)
- **`RATE_LIMIT_WINDOW_MS`**: Ventana de rate limit en ms (default: 900000)
- **`RATE_LIMIT_MAX_REQUESTS`**: Máximo de requests (default: 100)
- **`RATE_LIMIT_ENABLED`**: Habilitar rate limit (default: true)
- **`CORS_ORIGIN`**: Orígenes permitidos para CORS (separados por comas)

### Cómo Configurar Variables de Entorno en Vercel

1. En el dashboard de tu proyecto en Vercel
2. Ve a "Settings" → "Environment Variables"
3. Agrega cada variable con su valor
4. Selecciona los entornos (Production, Preview, Development)
5. Guarda los cambios

**Importante**: Para `GOOGLE_SERVICE_ACCOUNT_KEY`, copia todo el contenido del archivo JSON de la cuenta de servicio.

## Configuración de Redis

Para usar Redis en Vercel, necesitas un servicio de Redis externo:

### Opciones Recomendadas:

1. **Upstash** (Recomendado para Vercel)
   - Ve a [upstash.com](https://upstash.com)
   - Crea una base de datos Redis
   - Copia la URL de conexión
   - Agrégala como variable `REDIS_URL`

2. **Redis Labs**
   - Ve a [redis.com](https://redis.com)
   - Crea una base de datos
   - Obtén la URL de conexión

3. **Railway**
   - Ve a [railway.app](https://railway.app)
   - Agrega un servicio Redis
   - Copia la URL de conexión

## Estructura del Proyecto para Vercel

```
/
├── api/
│   └── index.ts          # Función serverless (punto de entrada)
├── src/
│   ├── app.ts            # Aplicación Hono
│   ├── index.ts          # Entry point local
│   └── ...               # Resto del código
├── vercel.json           # Configuración de Vercel
└── .vercelignore         # Archivos ignorados
```

## Verificación del Despliegue

Una vez desplegado, puedes verificar:

1. **Health Check**: `https://tu-proyecto.vercel.app/`
2. **API Docs**: `https://tu-proyecto.vercel.app/doc`
3. **Swagger UI**: `https://tu-proyecto.vercel.app/swagger`

## Desarrollo Local

Para desarrollo local, sigue usando:

```bash
npm run dev
```

Esto ejecutará el servidor con `@hono/node-server` en el puerto 3001.

## Notas Importantes

- **Serverless Functions**: Cada request inicia una nueva instancia de la función
- **Límites de Vercel**: 
  - Timeout: 10 segundos (plan gratuito), 60 segundos (plan Pro)
  - Tamaño máximo: 50MB
- **Redis**: Es crucial para el rate limiting y locks distribuidos
- **Variables de Entorno**: Nunca subas el archivo `.env` al repositorio

## Troubleshooting

### Error: "Module not found"
- Asegúrate de que todas las dependencias estén en `dependencies` (no en `devDependencies`)
- Ejecuta `npm install` localmente para verificar

### Error: "Function timeout"
- Verifica que las operaciones de Google Calendar no tarden mucho
- Considera optimizar las consultas a la API

### Error de CORS
- Configura correctamente `CORS_ORIGIN` con los dominios permitidos
- Ejemplo: `https://miapp.com,https://www.miapp.com`

## Comandos Útiles

```bash
# Ver logs en tiempo real
vercel logs

# Ver información del proyecto
vercel inspect

# Eliminar un despliegue
vercel remove [deployment-url]

# Listar despliegues
vercel ls
```

## Soporte

Para más información sobre Vercel:
- [Documentación de Vercel](https://vercel.com/docs)
- [Hono en Vercel](https://hono.dev/getting-started/vercel)
