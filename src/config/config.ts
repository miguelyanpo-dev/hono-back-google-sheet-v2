export const config = {
  port: Number(process.env.PORT || 3001),
  env: process.env.NODE_ENV || 'development',
  cors: {
    origins: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['*']
  }
} as const;
