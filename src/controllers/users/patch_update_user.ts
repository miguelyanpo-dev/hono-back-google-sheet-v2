import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

interface UpdateUserBody {
  blocked?: boolean;
  email_verified?: boolean;
  email?: string;
  phone_number?: string;
  phone_verified?: boolean;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  given_name?: string;
  family_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  verify_email?: boolean;
  verify_phone_number?: boolean;
  password?: string;
  connection?: string;
  client_id?: string;
  username?: string;
}

export const patchUpdateUser = async (c: Context) => {
  try {
    const userId = c.req.param('id');
    
    if (!userId) {
      return c.json({
        success: false,
        error: 'ID de usuario requerido'
      }, 400);
    }

    const body: UpdateUserBody = await c.req.json();

    const user = await AuthService.authenticatedRequest(`users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return c.json({
      success: false,
      error: 'Error al actualizar usuario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
