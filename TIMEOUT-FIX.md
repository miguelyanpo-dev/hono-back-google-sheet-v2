# Vercel 30-Second Timeout Fix

## Problem
The application was experiencing 30-second timeouts on Vercel when creating calendar events:
```
2025-11-02 23:59:49.345 [error] Vercel Runtime Timeout Error: Task timed out after 30 seconds
2025-11-02 23:59:19.580 [info] Redis connected successfully
2025-11-02 23:59:19.799 [info] 📅 POST /calendar/event - Request started
```

## Root Cause
1. **Google Calendar API calls were taking too long** - Authentication + API calls exceeded 30 seconds
2. **No timeout protection** - API calls could hang indefinitely
3. **Sequential authentication** - Google Auth was authenticating on every request
4. **No connection pooling** - Auth client wasn't being reused

## Solution Applied

### 1. Added Timeout Protection (`src/routes/service-calendar.routes.ts`)
Created a `withTimeout` helper to prevent API calls from hanging:
```typescript
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    )
  ]);
}
```

Applied to critical operations:
- **Availability check**: 10-second timeout
- **Event creation**: 15-second timeout

### 2. Pre-Authentication (`src/lib/google.ts`)
Optimized Google Auth client to pre-authenticate and cache the auth client:
```typescript
async function getServiceAccountCalendarClient() {
  // Pre-authenticate to get access token (improves first-call performance)
  if (!authClient) {
    authClient = await serviceAuth.getClient();
  }
  return google.calendar({ version: 'v3', auth: authClient || serviceAuth });
}
```

Benefits:
- ✅ Auth token is fetched once and reused
- ✅ Subsequent requests skip authentication overhead
- ✅ Faster response times in serverless environment

### 3. Made Function Async
Changed `getServiceAccountCalendarClient()` to async and updated all call sites to use `await`

## Expected Results
- ⏱️ Faster API responses (auth overhead removed after first call)
- 🛡️ Protected against hanging API calls (10-15s timeouts)
- ✅ Better error messages when timeouts occur
- 📊 Detailed timing logs for debugging

## Monitoring
Watch for these log patterns:
- `🔐 Google Auth client initialized` - Auth client cached successfully
- `⏱️ Time elapsed: Xms` - Track request timing
- `✅ Event created successfully - Total time: Xms` - Successful completions

If you see timeout errors, they'll now be specific:
- `Google Calendar API timeout while checking availability` (>10s)
- `Google Calendar API timeout while creating event` (>15s)

## Next Steps
If timeouts persist:
1. Consider increasing timeout values (currently 10s/15s)
2. Investigate Google Calendar API performance
3. Consider implementing request queuing for high load
4. Add retry logic for transient failures

## Deployment
```bash
npm run build
vercel --prod
```
