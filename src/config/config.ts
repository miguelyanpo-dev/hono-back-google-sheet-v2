export const config = {
  port: Number(process.env.PORT || 3001),
  env: process.env.NODE_ENV || 'development',
  cors: {
    origins: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['*']
  },
  auth0: {
    urlBase: process.env.URL_BASE || '',
    pathApi: process.env.PATH_API || '/api/v2/',
    pathToken: process.env.PATH_TOKEN || '/oauth/token',
    clientId: process.env.AUTH0_CLIENT_ID || '',
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    audience: process.env.AUTH0_AUDIENCE || '',
    grantType: process.env.AUTH0_GRANT_TYPE || 'client_credentials'
  }
} as const;
