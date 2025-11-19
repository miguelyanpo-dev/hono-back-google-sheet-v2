import { Context } from 'hono';
import { AuthService } from '../../services/auth.service';

interface CreateRoleBody {
  name: string;
  description: string;
}

export const postCreateRole = async (c: Context) => {
  try {
    const body: CreateRoleBody = await c.req.json();

    // Validar campos obligatorios
    if (!body.name || !body.description) {
      return c.json({
        success: false,
        error: 'Campos obligatorios faltantes',
        message: 'Los campos name y description son obligatorios'
      }, 400);
    }

    const role = await AuthService.authenticatedRequest('roles', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return c.json({
      success: true,
      data: role
    }, 201);
  } catch (error) {
    console.error('Error al crear rol:', error);
    return c.json({
      success: false,
      error: 'Error al crear rol',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
