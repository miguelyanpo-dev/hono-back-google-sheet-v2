export const config = {
  port: Number(process.env.PORT || 3001),
  google: {
    // Service Account (for server-to-server auth)
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '',
  },
  calendar: {
    defaultCalendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    appointmentDuration: Number(process.env.APPOINTMENT_DURATION || 60),
    timezone: process.env.TIMEZONE || 'Europe/Madrid',
    businessHours: {
      start: process.env.BUSINESS_START || '09:00',
      end: process.env.BUSINESS_END || '18:00'
    }
  },
  redis: {
    url: process.env.REDIS_URL || ''
  },
  lock: {
    expireSeconds: Number(process.env.LOCK_EXPIRE || 15),
    retryCount: Number(process.env.LOCK_RETRY || 2),
    retryDelay: Number(process.env.LOCK_DELAY || 250)
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutos
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false' // Habilitado por defecto
  }
} as const;
