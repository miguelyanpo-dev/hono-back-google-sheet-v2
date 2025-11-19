import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

interface AssignUsersBody {
  users: string[];
}

export const postAssignUserToRole = async (c: Context) => {
  try {
    const roleId = c.req.param('id');
    
    if (!roleId) {
      return c.json({
        success: false,
        error: 'ID de rol requerido'
      }, 400);
    }

    const body: AssignUsersBody = await c.req.json();

    // Validar que se proporcione el array de usuarios
    if (!body.users || !Array.isArray(body.users) || body.users.length === 0) {
      return c.json({
        success: false,
        error: 'Array de usuarios requerido',
        message: 'Debe proporcionar un array de IDs de usuarios'
      }, 400);
    }

    const result = await AuthService.authenticatedRequest(`roles/${roleId}/users`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: result,
      message: 'Usuarios asignados al rol correctamente'
    });
  } catch (error) {
    console.error('Error al asignar usuarios al rol:', error);
    return c.json({
      success: false,
      error: 'Error al asignar usuarios al rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
