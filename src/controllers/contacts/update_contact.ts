import { Context } from 'hono';
import { GoogleSheetsService } from '../../services/google-sheets.service';

export const updateContact = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const updateData = await c.req.json();
    
    const googleSheetsService = new GoogleSheetsService();
    const updatedContact = await googleSheetsService.updateContact(id, updateData);

    if (!updatedContact) {
      return c.json({
        success: false,
        error: 'Contacto no encontrado',
        message: `No se encontró un contacto con el ID: ${id}`,
      }, 404);
    }

    return c.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al actualizar contacto',
      message: String(error),
    }, 500);
  }
};