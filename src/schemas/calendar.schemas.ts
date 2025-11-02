import { z } from '@hono/zod-openapi';

// Request schemas
export const CreateEventSchema = z.object({
  calendarId: z.string().min(1).openapi({
    example: 'barbero1@classbarber.com',
    description: 'ID del calendario donde se creará el evento. Requerido para identificar el calendario específico cuando hay múltiples calendarios disponibles'
  }),
  startDateTime: z.string().datetime().openapi({
    example: '2024-10-30T10:00:00Z',
    description: 'Fecha y hora de inicio del evento en formato ISO 8601'
  }),
  endDateTime: z.string().datetime().optional().openapi({
    example: '2024-10-30T11:00:00Z',
    description: 'Fecha y hora de fin del evento. Si no se proporciona, se calcula automáticamente'
  }),
  summary: z.string().optional().openapi({
    example: 'Cita médica',
    description: 'Título o resumen del evento'
  }),
  description: z.string().optional().openapi({
    example: 'Consulta general con el Dr. García',
    description: 'Descripción detallada del evento'
  }),
  location: z.string().optional().openapi({
    example: 'ClassBarber - Sede Principal',
    description: 'Ubicación del evento'
  }),
  name: z.string().optional().openapi({
    example: 'Juan Pérez',
    description: 'Nombre del cliente que agenda la cita'
  }),
  attendees: z.array(z.object({
    email: z.string().email()
  })).optional().openapi({
    example: [{ email: 'paciente@example.com' }],
    description: 'Lista de asistentes al evento'
  })
});

export const UpdateEventSchema = z.object({
  calendarId: z.string().optional().openapi({
    example: 'primary',
    description: 'ID del calendario'
  }),
  summary: z.string().optional().openapi({
    example: 'Cita médica actualizada',
    description: 'Nuevo título del evento'
  }),
  description: z.string().optional().openapi({
    example: 'Consulta de seguimiento',
    description: 'Nueva descripción del evento'
  }),
  location: z.string().optional().openapi({
    example: 'Consultorio 102',
    description: 'Nueva ubicación del evento'
  }),
  startDateTime: z.string().datetime().optional().openapi({
    example: '2024-10-30T11:00:00Z',
    description: 'Nueva fecha y hora de inicio'
  }),
  endDateTime: z.string().datetime().optional().openapi({
    example: '2024-10-30T12:00:00Z',
    description: 'Nueva fecha y hora de fin'
  }),
  attendees: z.array(z.object({
    email: z.string().email()
  })).optional().openapi({
    example: [{ email: 'paciente@example.com' }],
    description: 'Nueva lista de asistentes'
  })
});

export const CheckAvailabilitySchema = z.object({
  calendarId: z.string().optional().openapi({
    example: 'primary',
    description: 'ID del calendario a verificar'
  }),
  startDateTime: z.string().datetime().openapi({
    example: '2024-10-30T10:00:00Z',
    description: 'Fecha y hora de inicio del período a verificar'
  }),
  endDateTime: z.string().datetime().optional().openapi({
    example: '2024-10-30T11:00:00Z',
    description: 'Fecha y hora de fin del período a verificar'
  })
});

// Response schemas
export const CalendarListResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true
  }),
  items: z.array(z.any()).openapi({
    description: 'Lista de calendarios disponibles'
  })
});

export const EventsListResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true
  }),
  events: z.array(z.any()).openapi({
    description: 'Lista de eventos del calendario'
  })
});

export const EventResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true
  }),
  event: z.any().openapi({
    description: 'Datos del evento'
  })
});

export const CreateEventResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true
  }),
  available: z.boolean().openapi({
    example: true,
    description: 'Indica si el horario estaba disponible'
  }),
  event: z.any().openapi({
    description: 'Evento creado'
  })
});

export const AvailabilityResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true
  }),
  available: z.boolean().openapi({
    example: true,
    description: 'Indica si el horario está disponible'
  }),
  conflictingEvents: z.array(z.any()).openapi({
    description: 'Eventos que causan conflicto (si los hay)'
  })
});

export const DeleteEventResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true
  }),
  message: z.string().openapi({
    example: 'Event deleted successfully'
  })
});

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'error_code'
  }),
  details: z.string().optional().openapi({
    example: 'Descripción detallada del error'
  })
});

export const HealthCheckResponseSchema = z.object({
  ok: z.boolean().openapi({
    example: true
  }),
  service: z.string().openapi({
    example: 'hono-google-calendar'
  }),
  version: z.string().openapi({
    example: '0.1.0'
  }),
  timestamp: z.string().openapi({
    example: '2024-10-30T10:00:00.000Z'
  })
});
