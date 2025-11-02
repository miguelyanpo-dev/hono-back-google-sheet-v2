# 🚀 Guía Rápida de Inicio

## ⚡ Inicio en 5 Pasos

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3001
NODE_ENV=development

# Google Service Account (JSON en una línea)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# Google Calendar
GOOGLE_CALENDAR_ID=tu-email@gmail.com
APPOINTMENT_DURATION=30
TIMEZONE=Europe/Madrid

# Redis
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=*
```

### 3. Compartir el Calendario

Ve a [Google Calendar](https://calendar.google.com) y comparte tu calendario con el Service Account:

```
tu-service-account@proyecto.iam.gserviceaccount.com
```

**Permisos**: "Hacer cambios en los eventos"

### 4. Iniciar Redis (si usas local)

```bash
# Ubuntu/Debian
sudo systemctl start redis-server

# macOS
brew services start redis

# Verificar
redis-cli ping
# Debe responder: PONG
```

### 5. Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Service Account loaded from GOOGLE_SERVICE_ACCOUNT_JSON env var
Redis connected successfully
Server running at http://localhost:3001
```

---

## 🧪 Probar la API

### Health Check

```bash
curl http://localhost:3001/
```

### Listar Calendarios

```bash
curl http://localhost:3001/api/calendar/list
```

### Listar Eventos de Hoy

```bash
TODAY=$(date -Iseconds | cut -d'+' -f1)
TOMORROW=$(date -d "tomorrow" -Iseconds | cut -d'+' -f1)

curl "http://localhost:3001/api/calendar/events?timeMin=${TODAY}Z&timeMax=${TOMORROW}Z"
```

### Crear una Cita

```bash
curl -X POST http://localhost:3001/api/calendar/event \
  -H "Content-Type: application/json" \
  -d '{
    "startDateTime": "2025-10-28T14:00:00-05:00",
    "endDateTime": "2025-10-28T14:30:00-05:00",
    "summary": "Cita de Prueba",
    "description": "Cliente: Juan Pérez"
  }'
```

### Verificar Disponibilidad

```bash
curl -X POST http://localhost:3001/api/calendar/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "startDateTime": "2025-10-28T15:00:00-05:00",
    "endDateTime": "2025-10-28T15:30:00-05:00"
  }'
```

---

## 📋 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/calendar/list` | Listar calendarios |
| GET | `/api/calendar/events` | Listar eventos |
| GET | `/api/calendar/event/:id` | Obtener evento |
| POST | `/api/calendar/event` | Crear evento |
| PUT | `/api/calendar/event/:id` | Actualizar evento |
| DELETE | `/api/calendar/event/:id` | Eliminar evento |
| POST | `/api/calendar/check-availability` | Verificar disponibilidad |

---

## 🗓️ Múltiples Calendarios

Para trabajar con múltiples calendarios, simplemente especifica el `calendarId` en cada petición:

```bash
# Calendario 1
curl -X POST http://localhost:3001/api/calendar/event \
  -H "Content-Type: application/json" \
  -d '{
    "calendarId": "doctor1@clinica.com",
    "startDateTime": "2025-10-28T14:00:00-05:00",
    "summary": "Cita Dr. Juan"
  }'

# Calendario 2
curl -X POST http://localhost:3001/api/calendar/event \
  -H "Content-Type: application/json" \
  -d '{
    "calendarId": "doctor2@clinica.com",
    "startDateTime": "2025-10-28T14:00:00-05:00",
    "summary": "Cita Dra. María"
  }'
```

**Recuerda**: Cada calendario debe estar compartido con el Service Account.

---

## 🛡️ Rate Limiting

Por defecto, el sistema permite **100 peticiones cada 15 minutos** por IP.

Verás estos headers en cada respuesta:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
```

Si excedes el límite, recibirás un error 429:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

---

## ❓ Solución Rápida de Problemas

### ❌ Error: "Service Account not configured"

```bash
# Verifica que el JSON esté en una sola línea
cat .env | grep GOOGLE_SERVICE_ACCOUNT_JSON

# Debe verse así (sin saltos de línea):
# GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### ❌ Error: "Redis connection failed"

```bash
# Verifica que Redis esté corriendo
redis-cli ping
# Debe responder: PONG

# Si no está corriendo:
sudo systemctl start redis-server
```

### ❌ Error: "calendar_list_failed"

1. Ve a Google Calendar
2. Comparte el calendario con el Service Account
3. Dale permisos de "Hacer cambios en los eventos"

### ❌ Puerto 3001 en uso

```bash
# Detener el servidor anterior
pkill -f "tsx watch"

# O cambiar el puerto en .env
PORT=3002
```

---

## 🚀 Despliegue en Vercel

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables, añade:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_CALENDAR_ID`
- `TIMEZONE` (ej: `Europe/Madrid`)
- `REDIS_URL` (usa Upstash)
- `CORS_ORIGIN`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_MAX_REQUESTS`

### 3. Desplegar

```bash
vercel --prod
```

---

## 📚 Documentación Completa

Para más detalles, consulta el [README.md](./README.md) completo.

---

## 💡 Ejemplos de Integración

### React/Next.js

```javascript
const API_URL = 'http://localhost:3001/api/calendar';

export async function crearCita(datos) {
  const response = await fetch(`${API_URL}/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  
  return await response.json();
}
```

### Vue.js

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/calendar'
});

export const crearCita = (datos) => api.post('/event', datos);
export const listarEventos = (params) => api.get('/events', { params });
```

### Angular

```typescript
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CalendarService {
  private apiUrl = 'http://localhost:3001/api/calendar';
  
  constructor(private http: HttpClient) {}
  
  crearCita(datos: any) {
    return this.http.post(`${this.apiUrl}/event`, datos);
  }
}
```

---

## ✅ Checklist de Configuración

- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` creado
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` configurado
- [ ] Calendario compartido con Service Account
- [ ] Redis corriendo (local o en la nube)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Health check funcionando (`curl http://localhost:3001/`)
- [ ] API probada con curl o Postman

---

## 🎉 ¡Listo!

Tu backend está funcionando. Ahora puedes:

1. Integrar con tu frontend
2. Añadir más calendarios
3. Personalizar los endpoints
4. Desplegar en Vercel

¿Necesitas ayuda? Consulta el [README.md](./README.md) o abre un issue.
