import { config } from '../config/config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

let cachedToken: string | null = null;
let tokenExpiration: number = 0;

export class AuthService {
  /**
   * Obtiene un token de acceso de Auth0
   * Implementa caché para evitar solicitudes innecesarias
   */
  static async getAccessToken(): Promise<string> {
    // Verificar si hay un token en caché y no ha expirado
    const now = Date.now();
    if (cachedToken && tokenExpiration > now) {
      return cachedToken;
    }

    try {
      const tokenUrl = `${config.auth0.urlBase}${config.auth0.pathToken}`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: config.auth0.clientId,
          client_secret: config.auth0.clientSecret,
          audience: config.auth0.audience,
          grant_type: config.auth0.grantType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener token: ${response.status} - ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      // Guardar token en caché
      cachedToken = data.access_token;
      // Establecer expiración (por defecto 24 horas o el valor proporcionado menos 5 minutos de margen)
      const expiresIn = data.expires_in ? data.expires_in - 300 : 86400;
      tokenExpiration = now + (expiresIn * 1000);

      return data.access_token;
    } catch (error) {
      console.error('Error al obtener token de Auth0:', error);
      throw error;
    }
  }

  /**
   * Limpia el token en caché
   */
  static clearCache(): void {
    cachedToken = null;
    tokenExpiration = 0;
  }

  /**
   * Realiza una petición autenticada a la API de Auth0
   */
  static async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `${config.auth0.urlBase}${config.auth0.pathApi}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en petición: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}
