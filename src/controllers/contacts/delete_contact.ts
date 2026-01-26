import { Context } from 'hono';
import { GoogleSheetsService } from '../../services/google-sheets.service';

export const deleteContact = async (c: Context) => {
  try {
    const { id } = c.req.param();
    
    const googleSheetsService = new GoogleSheetsService();
    const deleted = await googleSheetsService.deleteContact(id);

    if (!deleted) {
      return c.json({
        success: false,
        error: 'Contacto no encontrado',
        message: `No se encontró un contacto con el ID: ${id}`,
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Contacto eliminado exitosamente',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al eliminar contacto',
      message: String(error),
    }, 500);
  }
};