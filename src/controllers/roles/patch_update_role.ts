import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

interface UpdateRoleBody {
  name?: string;
  description?: string;
}

export const patchUpdateRole = async (c: Context) => {
  try {
    const roleId = c.req.param('id');
    
    if (!roleId) {
      return c.json({
        success: false,
        error: 'ID de rol requerido'
      }, 400);
    }

    const body: UpdateRoleBody = await c.req.json();

    const role = await AuthService.authenticatedRequest(`roles/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return c.json({
      success: false,
      error: 'Error al actualizar rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
