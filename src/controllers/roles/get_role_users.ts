import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

export const getRoleUsers = async (c: Context) => {
  try {
    const roleId = c.req.param('id');
    
    if (!roleId) {
      return c.json({
        success: false,
        error: 'ID de rol requerido'
      }, 400);
    }

    // Obtener parámetros de query opcionales para paginación
    const page = c.req.query('page') || '0';
    const per_page = c.req.query('per_page') || '50';
    
    const endpoint = `roles/${roleId}/users?page=${page}&per_page=${per_page}`;

    const users = await AuthService.authenticatedRequest(endpoint, {
      method: 'GET',
    });

    return c.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios del rol:', error);
    return c.json({
      success: false,
      error: 'Error al obtener usuarios del rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
