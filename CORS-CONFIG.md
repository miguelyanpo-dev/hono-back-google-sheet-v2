# Configuración de CORS

## Problema Identificado

El endpoint POST `/api/calendar/event` solo aceptaba peticiones desde `localhost` debido a una configuración incorrecta de CORS.

## Causa

La variable de entorno `CORS_ORIGIN` no estaba configurada correctamente en el entorno de producción (Vercel), o estaba configurada solo con `localhost`, lo que bloqueaba las peticiones desde otros orígenes.

## Solución

### 1. Configuración Local (Desarrollo)

Para desarrollo local, puedes dejar la variable `CORS_ORIGIN` sin configurar, y el sistema permitirá todos los orígenes (`*`).

### 2. Configuración en Producción (Vercel)

En Vercel, debes configurar la variable de entorno `CORS_ORIGIN` con los dominios permitidos:

**Opción 1: Permitir todos los orígenes (no recomendado para producción)**
```
CORS_ORIGIN=*
```

**Opción 2: Permitir dominios específicos (recomendado)**
```
CORS_ORIGIN=https://classbarber.es,https://www.classbarber.es,https://app.classbarber.es
```

**Opción 3: Permitir múltiples dominios incluyendo localhost para testing**
```
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://classbarber.es,https://www.classbarber.es
```

### 3. Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a **Settings** > **Environment Variables**
3. Agrega o edita la variable `CORS_ORIGIN` con los dominios permitidos
4. Guarda los cambios
5. Redeploy el proyecto para que los cambios tomen efecto

### 4. Verificar la Configuración

Después de desplegar, puedes verificar que CORS está configurado correctamente revisando los logs de Vercel. Deberías ver:

```
CORS Origins configured: ['https://classbarber.es', 'https://www.classbarber.es', ...]
```

## Headers CORS Configurados

El servidor está configurado con los siguientes headers CORS:

- **Métodos permitidos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers permitidos**: Content-Type, Authorization, x-access-token, x-refresh-token
- **Headers expuestos**: Content-Length, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- **Credentials**: Habilitado
- **Max Age**: 600 segundos (10 minutos)

## Pruebas

Para probar que CORS funciona correctamente desde tu aplicación frontend:

```javascript
// Ejemplo con fetch
fetch('https://tu-api.vercel.app/api/calendar/event', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    calendarId: 'tu-calendar-id',
    startDateTime: '2025-11-07T09:00:00',
    summary: 'Prueba de CORS',
    name: 'Cliente Test'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

Si recibes un error de CORS, verifica:
1. Que la variable `CORS_ORIGIN` esté configurada en Vercel
2. Que el dominio desde el que haces la petición esté incluido en `CORS_ORIGIN`
3. Que hayas redeployado después de cambiar las variables de entorno
