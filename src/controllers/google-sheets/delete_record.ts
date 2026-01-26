import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const deleteRecord = async (c: Context) => {
  try {
    const { nameSheet, index } = c.req.param();
    const query = c.req.query();
    const spreadsheetId = query.spreadsheetId;
    
    const googleSheetsService = new GoogleSheetsGenericService(spreadsheetId);
    const deleted = await googleSheetsService.deleteRecord(nameSheet, Number(index));

    if (!deleted) {
      return c.json({
        success: false,
        error: 'Registro no encontrado',
        message: `No se encontró un registro en el índice: ${index}`,
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Registro eliminado exitosamente',
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al eliminar registro',
      message: String(error),
    }, 500);
  }
};