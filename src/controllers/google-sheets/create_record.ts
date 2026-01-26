import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const createRecord = async (c: Context) => {
  try {
    const { sheetName } = c.req.param();
    const recordData = await c.req.json();
    
    const googleSheetsService = new GoogleSheetsGenericService();
    const newRecord = await googleSheetsService.createRecord(sheetName, recordData);

    return c.json({
      success: true,
      data: newRecord,
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al crear registro',
      message: String(error),
    }, 500);
  }
};