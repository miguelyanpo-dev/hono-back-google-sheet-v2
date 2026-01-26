import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const getSheetData = async (c: Context) => {
  try {
    const { nameSheet } = c.req.param();
    
    // Validar que el parámetro nameSheet esté presente
    if (!nameSheet) {
      return c.json({
        success: false,
        error: 'Parámetro nameSheet requerido',
        message: 'Debe proporcionar el nombre de la hoja en la URL',
      }, 400);
    }

    const query = c.req.query();

    const googleSheetsService = new GoogleSheetsGenericService();
    
    // Obtener todos los datos de la hoja
    console.log('Intentando obtener datos para la hoja:', nameSheet);
    const data = await googleSheetsService.getSheetData(nameSheet);
    console.log('Datos obtenidos exitosamente:', data.length, 'registros');
    
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
