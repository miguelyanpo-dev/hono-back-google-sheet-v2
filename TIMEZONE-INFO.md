# 🌍 Gestión de Zonas Horarias y Cambio Horario

## ⏰ Cambio Horario Europeo

### ¿Cómo funciona?

Tu aplicación utiliza el formato **IANA timezone** (`Europe/Madrid`), que **maneja automáticamente** el cambio horario europeo sin necesidad de configuración adicional.

### 📅 Calendario de Cambios 2025

| Fecha | Cambio | Hora | Zona Horaria | UTC Offset |
|-------|--------|------|--------------|------------|
| **30 de marzo 2025** | ⏩ Adelanta 1 hora | 02:00 → 03:00 | CEST (Verano) | UTC+2 |
| **26 de octubre 2025** | ⏪ Atrasa 1 hora | 03:00 → 02:00 | CET (Invierno) | UTC+1 |

### 🔄 Funcionamiento Automático

Cuando configuras `TIMEZONE=Europe/Madrid` en tu `.env`:

1. **Google Calendar API** recibe el `timeZone: "Europe/Madrid"` en cada evento
2. **JavaScript/Node.js** utiliza la base de datos IANA tz para calcular el offset correcto
3. **El sistema operativo** mantiene actualizada la información de cambios horarios
4. **Todo funciona automáticamente** - no necesitas código adicional

### ✅ Qué hace tu aplicación correctamente

```typescript
// En service-calendar.routes.ts
const eventBody = {
  summary: body.summary || 'Cita',
  start: { 
    dateTime: new Date(body.startDateTime).toISOString(),
    timeZone: config.calendar.timezone  // ✅ Europe/Madrid
  },
  end: { 
    dateTime: endDateTime,
    timeZone: config.calendar.timezone  // ✅ Europe/Madrid
  }
};
```

### 🌐 Otras Zonas Horarias Europeas

Todas estas zonas manejan automáticamente el cambio horario:

- `Europe/Madrid` - España (excepto Canarias)
- `Europe/Paris` - Francia
- `Europe/Berlin` - Alemania
- `Europe/Rome` - Italia
- `Europe/Amsterdam` - Países Bajos
- `Europe/Brussels` - Bélgica
- `Europe/Lisbon` - Portugal
- `Atlantic/Canary` - Islas Canarias (UTC+0/+1)
- `Europe/London` - Reino Unido (GMT/BST)

### 🚫 Lo que NO debes hacer

❌ **No calcules manualmente los offsets**
```typescript
// ❌ MAL - No hagas esto
const offset = isDST ? '+02:00' : '+01:00';
```

❌ **No uses offsets fijos**
```typescript
// ❌ MAL - No hagas esto
timeZone: 'UTC+1'  // Esto NO cambia automáticamente
```

✅ **Usa siempre zonas IANA**
```typescript
// ✅ BIEN - Haz esto
timeZone: 'Europe/Madrid'  // Cambia automáticamente
```

### 🧪 Cómo verificar que funciona

#### Opción 1: Script de Prueba (Recomendado)

Ejecuta el script de prueba incluido para ver cómo funciona el cambio horario:

```bash
npm run test:timezone
```

Este script demuestra que el sistema detecta automáticamente:
- **CET (UTC+1)** en marzo y noviembre (invierno)
- **CEST (UTC+2)** en abril, agosto y octubre (verano)

#### Opción 2: Probar con la API

Puedes probar que el sistema maneja correctamente el cambio horario creando eventos:

```bash
# Crear una cita en marzo (horario de verano)
curl -X POST http://localhost:3001/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Prueba Verano",
    "startDateTime": "2025-04-15T10:00:00",
    "endDateTime": "2025-04-15T11:00:00"
  }'

# Crear una cita en noviembre (horario de invierno)
curl -X POST http://localhost:3001/api/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Prueba Invierno",
    "startDateTime": "2025-11-15T10:00:00",
    "endDateTime": "2025-11-15T11:00:00"
  }'
```

Ambas citas se crearán correctamente con el offset apropiado (UTC+2 en verano, UTC+1 en invierno).

### 📚 Referencias

- [Lista completa de zonas IANA](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
- [Google Calendar API - Timezone](https://developers.google.com/calendar/api/v3/reference/events)
- [Cambio horario en la UE](https://ec.europa.eu/commission/presscorner/detail/en/MEMO_19_1854)

### 💡 Resumen

**No necesitas hacer nada especial.** Tu configuración actual con `TIMEZONE=Europe/Madrid` ya maneja automáticamente todos los cambios horarios europeos. El sistema:

- ✅ Detecta automáticamente si estamos en horario de verano o invierno
- ✅ Aplica el offset correcto (UTC+1 o UTC+2)
- ✅ Funciona para cualquier fecha del año
- ✅ Se actualiza automáticamente cada último domingo de marzo y octubre
