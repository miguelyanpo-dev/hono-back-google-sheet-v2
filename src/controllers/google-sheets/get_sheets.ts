import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const getSheets = async (c: Context) => {
  try {
    const googleSheetsService = new GoogleSheetsGenericService();
    const sheetNames = await googleSheetsService.getSheetNames();

    return c.json({
      success: true,
      data: sheetNames,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al obtener hojas',
      message: String(error),
    }, 500);
  }
};