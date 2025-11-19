import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

export const getRoles = async (c: Context) => {
  try {
    // Obtener parámetros de query opcionales para paginación
    const page = c.req.query('page') || '0';
    const per_page = c.req.query('per_page') || '50';
    
    const endpoint = `roles?page=${page}&per_page=${per_page}`;

    const roles = await AuthService.authenticatedRequest(endpoint, {
      method: 'GET',
    });

    return c.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return c.json({
      success: false,
      error: 'Error al obtener roles',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
