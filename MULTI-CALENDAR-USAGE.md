# Uso con Múltiples Calendarios

Este documento explica cómo trabajar con múltiples calendarios en la API.

## Obtener Lista de Calendarios

Primero, obtén la lista de calendarios disponibles:

```bash
GET /api/calendar/list
```

**Respuesta:**
```json
{
  "success": true,
  "items": [
    {
      "id": "barbero1@classbarber.com",
      "summary": "Barbero 1 - Juan",
      "timeZone": "Europe/Madrid"
    },
    {
      "id": "barbero2@classbarber.com",
      "summary": "Barbero 2 - Pedro",
      "timeZone": "Europe/Madrid"
    },
    {
      "id": "barbero3@classbarber.com",
      "summary": "Barbero 3 - María",
      "timeZone": "Europe/Madrid"
    }
  ]
}
```

## Crear Evento en un Calendario Específico

Ahora el campo `calendarId` es **requerido** al crear un evento:

```bash
POST /api/calendar/event
Content-Type: application/json

{
  "calendarId": "barbero1@classbarber.com",
  "startDateTime": "2024-11-03T10:00:00Z",
  "endDateTime": "2024-11-03T10:30:00Z",
  "summary": "Corte de pelo - Cliente Juan",
  "description": "Corte clásico",
  "location": "ClassBarber - Sede Principal",
  "email": "cliente@example.com",
  "name": "Juan Pérez"
}
```

**Nota**: El campo `email` agregará automáticamente al cliente como asistente del evento. Si también proporcionas `name`, se incluirá el nombre del cliente en la invitación.

**Respuesta exitosa:**
```json
{
  "success": true,
  "available": true,
  "event": {
    "id": "evento123",
    "summary": "Corte de pelo - Cliente Juan",
    "start": {
      "dateTime": "2024-11-03T10:00:00Z",
      "timeZone": "Europe/Madrid"
    },
    "end": {
      "dateTime": "2024-11-03T10:30:00Z",
      "timeZone": "Europe/Madrid"
    },
    "htmlLink": "https://calendar.google.com/...",
    "attendees": [
      {
        "email": "cliente@example.com",
        "responseStatus": "needsAction"
      }
    ]
  }
}
```

**Respuesta si el horario está ocupado:**
```json
{
  "available": false,
  "message": "Slot busy",
  "conflictingEvents": [
    {
      "id": "evento456",
      "summary": "Cita existente",
      "start": {
        "dateTime": "2024-11-03T10:00:00Z"
      },
      "end": {
        "dateTime": "2024-11-03T10:30:00Z"
      }
    }
  ]
}
```

## Verificar Disponibilidad en un Calendario

Antes de crear un evento, puedes verificar la disponibilidad:

```bash
POST /api/calendar/check-availability
Content-Type: application/json

{
  "calendarId": "barbero1@classbarber.com",
  "startDateTime": "2024-11-03T10:00:00Z",
  "endDateTime": "2024-11-03T10:30:00Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "available": true,
  "conflictingEvents": []
}
```

## Obtener Eventos de un Calendario Específico

```bash
GET /api/calendar/events?calendarId=barbero1@classbarber.com&timeMin=2024-11-03T00:00:00Z&timeMax=2024-11-03T23:59:59Z
```

**Respuesta:**
```json
{
  "success": true,
  "events": [
    {
      "id": "evento123",
      "summary": "Corte de pelo - Cliente Juan",
      "start": {
        "dateTime": "2024-11-03T10:00:00Z"
      },
      "end": {
        "dateTime": "2024-11-03T10:30:00Z"
      }
    }
  ]
}
```

## Actualizar Evento

```bash
PUT /api/calendar/event/evento123
Content-Type: application/json

{
  "calendarId": "barbero1@classbarber.com",
  "summary": "Corte de pelo y barba - Cliente Juan",
  "startDateTime": "2024-11-03T10:00:00Z",
  "endDateTime": "2024-11-03T11:00:00Z"
}
```

## Eliminar Evento

```bash
DELETE /api/calendar/event/evento123?calendarId=barbero1@classbarber.com
```

## Ejemplo de Flujo Completo

### 1. Listar calendarios disponibles
```javascript
const calendars = await fetch('/api/calendar/list').then(r => r.json());
console.log(calendars.items);
```

### 2. Seleccionar un calendario
```javascript
const selectedCalendar = calendars.items[0].id; // "barbero1@classbarber.com"
```

### 3. Verificar disponibilidad
```javascript
const availability = await fetch('/api/calendar/check-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    calendarId: selectedCalendar,
    startDateTime: '2024-11-03T10:00:00Z',
    endDateTime: '2024-11-03T10:30:00Z'
  })
}).then(r => r.json());

if (availability.available) {
  console.log('Horario disponible');
}
```

### 4. Crear el evento
```javascript
const event = await fetch('/api/calendar/event', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    calendarId: selectedCalendar,
    startDateTime: '2024-11-03T10:00:00Z',
    endDateTime: '2024-11-03T10:30:00Z',
    summary: 'Corte de pelo - Cliente Juan',
    description: 'Corte clásico',
    attendees: [{ email: 'cliente@example.com' }]
  })
}).then(r => r.json());

console.log('Evento creado:', event.event.id);
```

## Validaciones

### Campo `calendarId` es Requerido

Si intentas crear un evento sin especificar `calendarId`, recibirás un error:

```json
{
  "error": "calendarId is required"
}
```

### Campo `startDateTime` es Requerido

```json
{
  "error": "startDateTime is required"
}
```

## Notas Importantes

1. **Formato de Fechas**: Usa formato ISO 8601 (ej: `2024-11-03T10:00:00Z`)
2. **Zona Horaria**: El sistema usa la zona horaria configurada en `TIMEZONE` (default: Europe/Madrid)
3. **Locks Distribuidos**: El sistema usa Redis para prevenir reservas dobles en el mismo horario
4. **Notificaciones**: Los asistentes reciben notificaciones por email automáticamente
5. **Duración por Defecto**: Si no especificas `endDateTime`, se usa la duración configurada en `APPOINTMENT_DURATION` (default: 60 minutos)

## Errores Comunes

### Error 400: calendarId is required
**Causa**: No se especificó el ID del calendario
**Solución**: Incluye el campo `calendarId` en el body del request

### Error 409: Slot busy
**Causa**: Ya existe un evento en ese horario
**Solución**: Elige otro horario o verifica los eventos conflictivos

### Error 500: calendar_list_failed
**Causa**: Problemas con las credenciales de Google o permisos
**Solución**: Verifica que la cuenta de servicio tenga acceso a los calendarios
