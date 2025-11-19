import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

export const postGetToken = async (c: Context) => {
  try {
    // Limpiar caché para forzar un nuevo token
    AuthService.clearCache();
    
    const token = await AuthService.getAccessToken();
    
    return c.json({
      success: true,
      access_token: token,
      token_type: 'Bearer'
    });
  } catch (error) {
    console.error('Error al obtener token:', error);
    return c.json({
      success: false,
      error: 'Error al obtener token de Auth0',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
