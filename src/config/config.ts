export const config = {
  port: Number(process.env.PORT || 3001),
  env: process.env.NODE_ENV || 'development',
  productionUrl: process.env.PRODUCTION_URL || 'https://hono-back-aliado.vercel.app',
  cors: {
    origins: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['*']
  },
  aliado: {
    apiUrl: process.env.ALIADO_API_URL || 'https://app.aliaddo.net/v1',
    bearerToken: process.env.ALIADO_BEARER_TOKEN || ''
  }
} as const;
