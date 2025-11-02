import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { getServiceAccountCalendarClient } from '../lib/google';
import { getRedlock } from '../lib/redis';
import { config } from '../config/config';
import {
  CreateEventSchema,
  UpdateEventSchema,
  CheckAvailabilitySchema,
  CalendarListResponseSchema,
  EventsListResponseSchema,
  EventResponseSchema,
  CreateEventResponseSchema,
  AvailabilityResponseSchema,
  DeleteEventResponseSchema,
  ErrorResponseSchema
} from '../schemas/calendar.schemas';

const serviceCalendar = new OpenAPIHono();

// List calendars route
const listCalendarsRoute = createRoute({
  method: 'get',
  path: '/calendar/list',
  tags: ['Calendarios'],
  summary: 'Listar calendarios',
  description: 'Obtiene la lista de calendarios disponibles usando la cuenta de servicio de Google',
  responses: {
    200: {
      description: 'Lista de calendarios obtenida exitosamente',
      content: {
        'application/json': {
          schema: CalendarListResponseSchema
        }
      }
    },
    500: {
      description: 'Error al obtener la lista de calendarios',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(listCalendarsRoute, async (c) => {
  try {
    const cal = getServiceAccountCalendarClient();
    const res = await cal.calendarList.list();
    return c.json({ 
      success: true,
      items: res.data.items || [] 
    });
  } catch (err: any) {
    console.error('list calendars error:', err);
    return c.json({ error: 'calendar_list_failed', details: err.message }, 500);
  }
});

// Get events route
const getEventsRoute = createRoute({
  method: 'get',
  path: '/calendar/events',
  tags: ['Eventos'],
  summary: 'Obtener eventos',
  description: 'Obtiene los eventos de un calendario en un rango de tiempo específico',
  request: {
    query: z.object({
      calendarId: z.string().optional().openapi({
        example: 'primary',
        description: 'ID del calendario'
      }),
      timeMin: z.string().optional().openapi({
        example: '2024-10-30T00:00:00Z',
        description: 'Fecha y hora mínima (también se acepta periodStart)'
      }),
      timeMax: z.string().optional().openapi({
        example: '2024-10-31T23:59:59Z',
        description: 'Fecha y hora máxima (también se acepta periodEnd)'
      }),
      periodStart: z.string().optional().openapi({
        example: '2024-10-30T00:00:00Z',
        description: 'Alternativa a timeMin'
      }),
      periodEnd: z.string().optional().openapi({
        example: '2024-10-31T23:59:59Z',
        description: 'Alternativa a timeMax'
      })
    })
  },
  responses: {
    200: {
      description: 'Eventos obtenidos exitosamente',
      content: {
        'application/json': {
          schema: EventsListResponseSchema
        }
      }
    },
    500: {
      description: 'Error al obtener eventos',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(getEventsRoute, async (c) => {
  const calendarId = c.req.query('calendarId') || config.calendar.defaultCalendarId;
  const timeMin = c.req.query('timeMin') || c.req.query('periodStart');
  const timeMax = c.req.query('timeMax') || c.req.query('periodEnd');
  
  try {
    const cal = getServiceAccountCalendarClient();
    const params: any = {
      calendarId,
      singleEvents: true,
      orderBy: 'startTime'
    };
    
    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;
    
    const res = await cal.events.list(params);
    return c.json({ 
      success: true,
      events: res.data.items || [] 
    });
  } catch (err: any) {
    console.error('list events error:', err);
    return c.json({ error: 'events_list_failed', details: err.message }, 500);
  }
});

// Get specific event route
const getEventRoute = createRoute({
  method: 'get',
  path: '/calendar/event/{eventId}',
  tags: ['Eventos'],
  summary: 'Obtener evento específico',
  description: 'Obtiene los detalles de un evento específico por su ID',
  request: {
    params: z.object({
      eventId: z.string().openapi({
        example: 'abc123xyz',
        description: 'ID del evento'
      })
    }),
    query: z.object({
      calendarId: z.string().optional().openapi({
        example: 'primary',
        description: 'ID del calendario'
      })
    })
  },
  responses: {
    200: {
      description: 'Evento obtenido exitosamente',
      content: {
        'application/json': {
          schema: EventResponseSchema
        }
      }
    },
    500: {
      description: 'Error al obtener el evento',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(getEventRoute, async (c) => {
  const eventId = c.req.param('eventId');
  const calendarId = c.req.query('calendarId') || config.calendar.defaultCalendarId;
  
  try {
    const cal = getServiceAccountCalendarClient();
    const res = await cal.events.get({
      calendarId,
      eventId
    });
    return c.json({ 
      success: true,
      event: res.data 
    });
  } catch (err: any) {
    console.error('get event error:', err);
    return c.json({ error: 'event_get_failed', details: err.message }, 500);
  }
});

// Create event route
const createEventRoute = createRoute({
  method: 'post',
  path: '/calendar/event',
  tags: ['Eventos'],
  summary: 'Crear evento',
  description: 'Crea un nuevo evento en el calendario. Utiliza un sistema de bloqueo con Redis para evitar conflictos de reserva en el mismo horario.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateEventSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Evento creado exitosamente',
      content: {
        'application/json': {
          schema: CreateEventResponseSchema
        }
      }
    },
    400: {
      description: 'Datos de entrada inválidos',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    409: {
      description: 'El horario no está disponible (conflicto)',
      content: {
        'application/json': {
          schema: z.object({
            available: z.boolean(),
            message: z.string(),
            conflictingEvents: z.array(z.any())
          })
        }
      }
    },
    500: {
      description: 'Error al crear el evento',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(createEventRoute, async (c) => {
  const body = c.req.valid('json');
  const calendarId = body.calendarId || config.calendar.defaultCalendarId;
  
  if (!body.startDateTime) {
    return c.json({ error: 'startDateTime required' }, 400);
  }

  const slotKey = `lock:calendar:${calendarId}:slot:${body.startDateTime}`;
  const redlock = getRedlock();
  let lock: any = null;

  try {
    lock = await redlock.acquire([slotKey], config.lock.expireSeconds * 1000);
    const cal = getServiceAccountCalendarClient();

    const endDateTime = body.endDateTime || 
      new Date(new Date(body.startDateTime).getTime() + config.calendar.appointmentDuration * 60000).toISOString();

    const eventsRes = await cal.events.list({
      calendarId,
      timeMin: new Date(body.startDateTime).toISOString(),
      timeMax: endDateTime,
      singleEvents: true,
      orderBy: 'startTime'
    });

    if ((eventsRes.data.items || []).length > 0) {
      return c.json({ 
        available: false, 
        message: 'Slot busy',
        conflictingEvents: eventsRes.data.items 
      }, 409);
    }

    const eventBody: any = {
      summary: body.summary || 'Cita',
      start: { 
        dateTime: new Date(body.startDateTime).toISOString(),
        timeZone: config.calendar.timezone
      },
      end: { 
        dateTime: endDateTime,
        timeZone: config.calendar.timezone
      }
    };
    
    if (body.description) eventBody.description = body.description;
    if (body.location) eventBody.location = body.location;
    if (body.attendees) eventBody.attendees = body.attendees;

    const created = await cal.events.insert({
      calendarId,
      requestBody: eventBody,
      sendUpdates: 'all'
    });

    return c.json({ 
      success: true,
      available: true, 
      event: created.data 
    });
  } catch (err: any) {
    console.error('create event error:', err);
    return c.json({ error: 'create_event_failed', details: err.message }, 500);
  } finally {
    try {
      if (lock) await lock.release();
    } catch (e) {
      console.error('Error releasing lock:', e);
    }
  }
});

// Update event route
const updateEventRoute = createRoute({
  method: 'put',
  path: '/calendar/event/{eventId}',
  tags: ['Eventos'],
  summary: 'Actualizar evento',
  description: 'Actualiza un evento existente en el calendario',
  request: {
    params: z.object({
      eventId: z.string().openapi({
        example: 'abc123xyz',
        description: 'ID del evento a actualizar'
      })
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdateEventSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Evento actualizado exitosamente',
      content: {
        'application/json': {
          schema: EventResponseSchema
        }
      }
    },
    500: {
      description: 'Error al actualizar el evento',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(updateEventRoute, async (c) => {
  const eventId = c.req.param('eventId');
  const body = c.req.valid('json');
  const calendarId = body.calendarId || config.calendar.defaultCalendarId;
  
  try {
    const cal = getServiceAccountCalendarClient();
    
    const existing = await cal.events.get({
      calendarId,
      eventId
    });
    
    const eventBody: any = { ...existing.data };
    if (body.summary) eventBody.summary = body.summary;
    if (body.description) eventBody.description = body.description;
    if (body.location) eventBody.location = body.location;
    if (body.attendees) eventBody.attendees = body.attendees;
    if (body.startDateTime) {
      eventBody.start = { 
        dateTime: new Date(body.startDateTime).toISOString(),
        timeZone: config.calendar.timezone
      };
    }
    if (body.endDateTime) {
      eventBody.end = { 
        dateTime: new Date(body.endDateTime).toISOString(),
        timeZone: config.calendar.timezone
      };
    }
    
    const updated = await cal.events.update({
      calendarId,
      eventId,
      requestBody: eventBody,
      sendUpdates: 'all'
    });
    
    return c.json({ 
      success: true,
      event: updated.data 
    });
  } catch (err: any) {
    console.error('update event error:', err);
    return c.json({ error: 'event_update_failed', details: err.message }, 500);
  }
});

// Delete event route
const deleteEventRoute = createRoute({
  method: 'delete',
  path: '/calendar/event/{eventId}',
  tags: ['Eventos'],
  summary: 'Eliminar evento',
  description: 'Elimina un evento del calendario',
  request: {
    params: z.object({
      eventId: z.string().openapi({
        example: 'abc123xyz',
        description: 'ID del evento a eliminar'
      })
    }),
    query: z.object({
      calendarId: z.string().optional().openapi({
        example: 'primary',
        description: 'ID del calendario'
      })
    })
  },
  responses: {
    200: {
      description: 'Evento eliminado exitosamente',
      content: {
        'application/json': {
          schema: DeleteEventResponseSchema
        }
      }
    },
    500: {
      description: 'Error al eliminar el evento',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(deleteEventRoute, async (c) => {
  const eventId = c.req.param('eventId');
  const calendarId = c.req.query('calendarId') || config.calendar.defaultCalendarId;
  
  try {
    const cal = getServiceAccountCalendarClient();
    await cal.events.delete({
      calendarId,
      eventId,
      sendUpdates: 'all'
    });
    
    return c.json({ 
      success: true,
      message: 'Event deleted successfully' 
    });
  } catch (err: any) {
    console.error('delete event error:', err);
    return c.json({ error: 'event_delete_failed', details: err.message }, 500);
  }
});

// Check availability route
const checkAvailabilityRoute = createRoute({
  method: 'post',
  path: '/calendar/check-availability',
  tags: ['Disponibilidad'],
  summary: 'Verificar disponibilidad',
  description: 'Verifica si un horario específico está disponible en el calendario',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CheckAvailabilitySchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Disponibilidad verificada exitosamente',
      content: {
        'application/json': {
          schema: AvailabilityResponseSchema
        }
      }
    },
    400: {
      description: 'Datos de entrada inválidos',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Error al verificar disponibilidad',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

serviceCalendar.openapi(checkAvailabilityRoute, async (c) => {
  const body = c.req.valid('json');
  const calendarId = body.calendarId || config.calendar.defaultCalendarId;
  
  if (!body.startDateTime) {
    return c.json({ error: 'startDateTime required' }, 400);
  }
  
  try {
    const cal = getServiceAccountCalendarClient();
    const endDateTime = body.endDateTime || 
      new Date(new Date(body.startDateTime).getTime() + config.calendar.appointmentDuration * 60000).toISOString();
    
    const eventsRes = await cal.events.list({
      calendarId,
      timeMin: new Date(body.startDateTime).toISOString(),
      timeMax: endDateTime,
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const hasConflicts = (eventsRes.data.items || []).length > 0;
    
    return c.json({
      success: true,
      available: !hasConflicts,
      conflictingEvents: hasConflicts ? eventsRes.data.items : []
    });
  } catch (err: any) {
    console.error('check availability error:', err);
    return c.json({ error: 'availability_check_failed', details: err.message }, 500);
  }
});

export default serviceCalendar;
