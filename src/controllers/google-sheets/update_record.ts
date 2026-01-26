import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const updateRecord = async (c: Context) => {
  try {
    const { nameSheet, index } = c.req.param();
    const updateData = await c.req.json();
    
    const googleSheetsService = new GoogleSheetsGenericService();
    const updatedRecord = await googleSheetsService.updateRecord(nameSheet, Number(index), updateData);

    if (!updatedRecord) {
      return c.json({
        success: false,
        error: 'Registro no encontrado',
        message: `No se encontró un registro en el índice: ${index}`,
      }, 404);
    }

    return c.json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al actualizar registro',
      message: String(error),
    }, 500);
  }
};