import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const getSheetData = async (c: Context) => {
  try {
    const { sheetName } = c.req.param();
    
    // Validar que el parámetro sheetName esté presente
    if (!sheetName) {
      return c.json({
        success: false,
        error: 'Parámetro sheetName requerido',
        message: 'Debe proporcionar el nombre de la hoja en la URL',
      }, 400);
    }

    const query = c.req.query();

    const googleSheetsService = new GoogleSheetsGenericService();
    
    // Obtener todos los datos de la hoja
    const data = await googleSheetsService.getSheetData(sheetName);
    
    // Aplicar paginación si se proporciona
    let paginatedData = data;
    if (query.page && query.itemsPerPage) {
      const page = Number(query.page);
      const itemsPerPage = Number(query.itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      paginatedData = data.slice(startIndex, endIndex);
    }

    return c.json({
      success: true,
      data: paginatedData,
      total: data.length,
    });
  } catch (error) {
    console.error('Error en getSheetData:', error);
    return c.json({
      success: false,
      error: 'Error al obtener datos de la hoja',
      message: error instanceof Error ? error.message : String(error),
    }, 500);
  }
};
