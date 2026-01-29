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
    
    // Filtrar por ranking si se proporciona el parámetro
    let filteredData = data;
    if (query.ranking) {
      const rankingFilter = query.ranking.toLowerCase();
      const rankingMap: Record<string, string> = {
        'perdidos': 'Perdidos 🌠',
        'dormidos': 'Dormidos 😴',
        'frios': 'Fríos ⛄',
        'tibios': 'Tibios 🌡️',
        'calientes': 'Calientes 🔥'
      };
      
      const mappedRanking = rankingMap[rankingFilter];
      if (mappedRanking) {
        filteredData = data.filter(row => {
          // Buscar en todas las columnas el valor del ranking
          return Object.values(row).some(value => 
            typeof value === 'string' && value.trim() === mappedRanking
          );
        });
        console.log(`Datos filtrados por ranking "${mappedRanking}":`, filteredData.length, 'registros');
      } else {
        return c.json({
          success: false,
          error: 'Ranking no válido',
          message: 'Los rankings válidos son: perdidos, dormidos, frios, tibios, calientes',
        }, 400);
      }
    }

    // Filtrar por personName si se proporciona el parámetro
    if (query.personName) {
      const personNameFilter = query.personName.toLowerCase();
      filteredData = filteredData.filter(row => {
        const personName = String(row.personName || '').toLowerCase();
        return personName.includes(personNameFilter);
      });
      console.log(`Datos filtrados por personName "${query.personName}":`, filteredData.length, 'registros');
    }
    
    // Aplicar paginación con límite máximo de 20 items por página
    let paginatedData = filteredData;
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
    paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Determinar si hay más páginas o páginas anteriores
    hasMore = endIndex < filteredData.length;
    hasPrev = page > 1;

    return c.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        itemsPerPage,
        total: filteredData.length,
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
