# Documentación Swagger API

## Acceso a la Documentación

Una vez que el servidor esté en ejecución, puedes acceder a la documentación interactiva de Swagger en:

**URL de Swagger UI:** `http://localhost:3001/swagger`

**URL de OpenAPI JSON:** `http://localhost:3001/doc`

## Características

La documentación Swagger incluye:

- **Interfaz interactiva** para probar todos los endpoints
- **Descripción detallada** de cada endpoint
- **Esquemas de request/response** con ejemplos
- **Posibilidad de ejecutar peticiones** directamente desde el navegador
- **Organización por tags**: Sistema, Calendarios, Eventos, Disponibilidad

## Endpoints Documentados

### Sistema
- `GET /` - Health Check del servicio

### Calendarios
- `GET /api/calendar/list` - Listar calendarios disponibles

### Eventos
- `GET /api/calendar/events` - Obtener eventos de un calendario
- `GET /api/calendar/event/{eventId}` - Obtener un evento específico
- `POST /api/calendar/event` - Crear un nuevo evento
- `PUT /api/calendar/event/{eventId}` - Actualizar un evento existente
- `DELETE /api/calendar/event/{eventId}` - Eliminar un evento

### Disponibilidad
- `POST /api/calendar/check-availability` - Verificar disponibilidad de un horario

## Cómo Usar Swagger UI

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Abrir Swagger UI:**
   Navega a `http://localhost:3001/swagger` en tu navegador

3. **Explorar endpoints:**
   - Haz clic en cualquier endpoint para ver sus detalles
   - Expande las secciones para ver los parámetros requeridos y opcionales

4. **Probar endpoints:**
   - Haz clic en el botón "Try it out"
   - Completa los parámetros requeridos
   - Haz clic en "Execute" para enviar la petición
   - Verás la respuesta del servidor en tiempo real

## Ejemplos de Uso

### Crear un Evento

1. Ve a `POST /api/calendar/event`
2. Haz clic en "Try it out"
3. Modifica el JSON de ejemplo:
   ```json
   {
     "startDateTime": "2024-10-30T10:00:00Z",
     "endDateTime": "2024-10-30T11:00:00Z",
     "summary": "Cita médica",
     "description": "Consulta general",
     "location": "Consultorio 101",
     "attendees": [
       {
         "email": "paciente@example.com"
       }
     ]
   }
   ```
4. Haz clic en "Execute"

### Verificar Disponibilidad

1. Ve a `POST /api/calendar/check-availability`
2. Haz clic en "Try it out"
3. Ingresa el JSON:
   ```json
   {
     "startDateTime": "2024-10-30T14:00:00Z",
     "endDateTime": "2024-10-30T15:00:00Z"
   }
   ```
4. Haz clic en "Execute"

## Notas Importantes

- Los endpoints que modifican datos (POST, PUT, DELETE) requieren que el servidor esté correctamente configurado con las credenciales de Google Calendar
- Asegúrate de tener configurado el archivo `.env` con las variables necesarias
- El sistema utiliza Redis para bloqueos distribuidos al crear eventos, asegurándote de que Redis esté en ejecución si está habilitado

## Personalización

Si necesitas modificar la documentación OpenAPI, edita el archivo:
`src/openapi.json`

Después de modificarlo, reinicia el servidor para ver los cambios reflejados en Swagger UI.
