import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

export const getUserRoles = async (c: Context) => {
  try {
    const { id } = c.req.param();
    
    if (!id) {
      return c.json({
        success: false,
        error: 'ID de usuario requerido',
        message: 'Debe proporcionar un ID de usuario válido'
      }, 400);
    }

    const roles = await AuthService.authenticatedRequest(`users/${id}/roles`, {
      method: 'GET',
    });

    return c.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    return c.json({
      success: false,
      error: 'Error al obtener roles del usuario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
