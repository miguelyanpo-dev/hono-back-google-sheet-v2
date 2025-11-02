# Redis Rate Limit Error Fix

## Problem
The application was experiencing errors in production:
```
Error: Stream isn't writeable and enableOfflineQueue options is false
```

This occurred in the rate limiting middleware when trying to execute Redis commands before the connection was established.

## Root Cause
1. Redis was configured with `lazyConnect: true` (doesn't connect immediately)
2. Redis was configured with `enableOfflineQueue: false` (doesn't queue commands when offline)
3. The rate limit middleware attempted to execute commands without checking connection status
4. In serverless environments (Vercel), connections can be cold and take time to establish

## Solution Applied

### 1. Connection Check in Rate Limit Middleware (`src/middlewares/rateLimit.ts`)
Added connection verification before executing Redis commands:
```typescript
// Asegurar que Redis está conectado antes de ejecutar comandos
if (redis.status !== 'ready') {
  await redis.connect();
}
```

### 2. Improved Redis Configuration (`src/lib/redis.ts`)
Enhanced connection resilience:
- Increased `maxRetriesPerRequest` from 1 to 2
- Increased timeouts from 2s to 3s (better for serverless cold starts)
- Added exponential backoff retry strategy (max 3 retries)
- Added 'close' event listener for better monitoring

### 3. Graceful Degradation
The middleware already had proper error handling that allows requests to proceed without rate limiting if Redis fails, preventing Redis issues from blocking the entire application.

## Benefits
- ✅ Prevents "Stream isn't writeable" errors
- ✅ Better handling of serverless cold starts
- ✅ Improved connection resilience with retry strategy
- ✅ Graceful degradation when Redis is unavailable
- ✅ Better monitoring with connection event logging

## Testing
After deploying, monitor logs for:
- "Redis connected successfully" - confirms connection is established
- No more "Stream isn't writeable" errors
- Rate limiting working correctly (check X-RateLimit-* headers)

## Deployment
Build and deploy to Vercel:
```bash
npm run build
vercel --prod
```
