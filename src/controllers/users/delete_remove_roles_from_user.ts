import { Context } from 'hono';
import { config } from '../../config/config';

export const deleteRemoveRolesFromUser = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { roles } = await c.req.json();
    
    if (!id) {
      return c.json({
        success: false,
        error: 'ID de usuario requerido',
        message: 'Debe proporcionar un ID de usuario válido'
      }, 400);
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return c.json({
        success: false,
        error: 'Roles requeridos',
        message: 'Debe proporcionar un array de roles válido'
      }, 400);
    }

    // Obtener token de Auth0
    const tokenUrl = `${config.auth0.urlBase}${config.auth0.pathToken}`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.auth0.clientId,
        client_secret: config.auth0.clientSecret,
        audience: config.auth0.audience,
        grant_type: config.auth0.grantType,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Error al obtener token: ${tokenResponse.status}`);
    }

    const { access_token } = await tokenResponse.json();

    // Remover roles del usuario
    const url = `${config.auth0.urlBase}${config.auth0.pathApi}users/${id}/roles`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en petición: ${response.status} - ${errorText}`);
    }

    // Auth0 devuelve 204 No Content cuando la eliminación es exitosa
    if (response.status === 204) {
      return c.json({
        success: true,
        message: 'Roles removidos exitosamente',
        data: { roles }
      });
    }

    // Si hay contenido, parsearlo
    const data = await response.json();
    return c.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error al remover roles del usuario:', error);
    return c.json({
      success: false,
      error: 'Error al remover roles del usuario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
};
