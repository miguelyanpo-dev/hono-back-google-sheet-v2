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

    // Obtener spreadsheetId del query param o usar el default
    const spreadsheetId = query.spreadsheetId;

    const googleSheetsService = new GoogleSheetsGenericService(spreadsheetId);
    
    // Obtener todos los datos de la hoja
    console.log('Intentando obtener datos para la hoja:', nameSheet);
    const data = await googleSheetsService.getSheetData(nameSheet);
    console.log('Datos obtenidos exitosamente:', data.length, 'registros');
    
    // Aplicar paginación con límite máximo de 20 items por página
    let paginatedData = data;
    let page = 1;
    let itemsPerPage = 20;
    let hasMore = false;
    let hasPrev = false;

    if (query.page) {
      page = Math.max(1, Number(query.page));
    }
    
    if (query.itemsPerPage) {
      itemsPerPage = Math.min(20, Math.max(1, Number(query.itemsPerPage)));
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedData = data.slice(startIndex, endIndex);
    
    // Determinar si hay más páginas o páginas anteriores
    hasMore = endIndex < data.length;
    hasPrev = page > 1;

    return c.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        itemsPerPage,
        total: data.length,
        hasMore,
        hasPrev
      }
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
