import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

export const getUsers = async (c: Context) => {
  try {
    // Obtener parámetros de query opcionales para paginación y filtrado
    const page = c.req.query('page') || '0';
    const per_page = c.req.query('per_page') || '50';
    const search = c.req.query('search') || '';
    
    let endpoint = `users?page=${page}&per_page=${per_page}`;
    if (search) {
      endpoint += `&q=${encodeURIComponent(search)}`;
    }

    const users = await AuthService.authenticatedRequest(endpoint, {
      method: 'GET',
    });

    return c.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return c.json({
      success: false,
      error: 'Error al obtener usuarios',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
