import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';
import { config } from '../../config/config';

export const getSheets = async (c: Context) => {
  try {
    const query = c.req.query();
    const spreadsheetId = query.spreadsheetId || config.googleSheets.spreadsheetId;
    
    if (!spreadsheetId) {
      return c.json({
        success: false,
        error: 'Falta el ID de la hoja de cálculo',
        message: 'Debe proporcionar el parámetro spreadsheetId o tenerlo configurado en las variables de entorno',
      }, 400);
    }
    
    const googleSheetsService = new GoogleSheetsGenericService(spreadsheetId);
    const sheetNames = await googleSheetsService.getSheetNames();

    return c.json({
      success: true,
      data: sheetNames,
    });
  } catch (error) {
    console.error('Error en getSheets:', error);
    return c.json({
      success: false,
      error: 'Error al obtener hojas',
      message: String(error),
    }, 500);
  }
};
