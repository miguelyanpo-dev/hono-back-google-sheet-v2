import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const createRecord = async (c: Context) => {
  try {
    const { nameSheet } = c.req.param();
    const query = c.req.query();
    const spreadsheetId = query.spreadsheetId;
    
    const recordData = await c.req.json();
    const googleSheetsService = new GoogleSheetsGenericService(spreadsheetId);

    const newRecord = await googleSheetsService.createRecord(nameSheet, recordData);

    return c.json({
      success: true,
      data: newRecord,
    }, 201);
  } catch (error) {
    console.error('Error en createRecord:', error);
    return c.json({
      success: false,
      error: 'Error al crear registro',
      message: String(error),
    }, 500);
  }
};
