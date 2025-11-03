import { google } from 'googleapis';
import { config } from '../config/config';
import path from 'path';
import fs from 'fs';

// Service Account Client (for server-to-server authentication)
let serviceAccountAuth: any = null;
let authClient: any = null; // Cache the authenticated client

function getServiceAccountAuth() {
  if (serviceAccountAuth) return serviceAccountAuth;
  
  try {
    // Opción 1: Cargar desde variable de entorno GOOGLE_SERVICE_ACCOUNT_JSON (para Vercel)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      serviceAccountAuth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });
      console.log('✅ Service Account loaded from GOOGLE_SERVICE_ACCOUNT_JSON env var');
      return serviceAccountAuth;
    }
    
    // Opción 2: Cargar desde credentials.json file (para desarrollo local)
    const credentialsPath = path.join(process.cwd(), 'credentials.json');
    if (fs.existsSync(credentialsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      serviceAccountAuth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });
      console.log('✅ Service Account loaded from credentials.json');
      return serviceAccountAuth;
    }
    
    // Opción 3: Cargar desde variables individuales (alternativa)
    if (config.google.serviceAccountEmail && config.google.serviceAccountKey) {
      serviceAccountAuth = new google.auth.GoogleAuth({
        credentials: {
          client_email: config.google.serviceAccountEmail,
          private_key: config.google.serviceAccountKey.replace(/\\n/g, '\n')
        },
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ]
      });
      console.log('✅ Service Account loaded from environment variables');
      return serviceAccountAuth;
    }
    
    console.warn('⚠️  No Service Account credentials found');
  } catch (error) {
    console.error('❌ Error loading Service Account:', error);
  }
  
  return serviceAccountAuth;
}

// Get calendar client using Service Account
async function getServiceAccountCalendarClient() {
  const serviceAuth = getServiceAccountAuth();
  if (!serviceAuth) {
    throw new Error('Service Account not configured');
  }
  
  // Pre-authenticate to get access token (improves first-call performance)
  if (!authClient) {
    try {
      authClient = await serviceAuth.getClient();
      console.log('🔐 Google Auth client initialized');
    } catch (err) {
      console.error('Failed to pre-authenticate:', err);
      // Continue without pre-auth, let googleapis handle it
    }
  }
  
  return google.calendar({ version: 'v3', auth: authClient || serviceAuth });
}

export { 
  getServiceAccountCalendarClient
};
