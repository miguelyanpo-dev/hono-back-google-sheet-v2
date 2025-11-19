import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

interface CreateUserBody {
  email: string;
  password: string;
  connection: string;
  phone_number?: string;
  user_metadata?: Record<string, any>;
  blocked?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  app_metadata?: Record<string, any>;
  given_name?: string;
  family_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  user_id?: string;
  verify_email?: boolean;
  username?: string;
}

export const postCreateUser = async (c: Context) => {
  try {
    const body: CreateUserBody = await c.req.json();

    // Validar campos obligatorios
    if (!body.email || !body.password || !body.connection) {
      return c.json({
        success: false,
        error: 'Campos obligatorios faltantes',
        message: 'Los campos email, password y connection son obligatorios'
      }, 400);
    }

    const user = await AuthService.authenticatedRequest('users', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: user
    }, 201);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return c.json({
      success: false,
      error: 'Error al crear usuario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
