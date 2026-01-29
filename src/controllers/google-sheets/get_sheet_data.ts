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

    // Filtrar por sellerName si se proporciona el parámetro
    if (query.sellerName) {
      const sellerNameFilter = query.sellerName.toLowerCase();
      filteredData = filteredData.filter(row => {
        const sellerName = String(row.sellerName || '').toLowerCase();
        return sellerName.includes(sellerNameFilter);
      });
      console.log(`Datos filtrados por sellerName "${query.sellerName}":`, filteredData.length, 'registros');
    }

    // Filtrar por status_ranking si se proporciona el parámetro
    if (query.status_ranking) {
      const statusRankingFilter = query.status_ranking.toLowerCase();
      const validStatusRankings = ['calientes', 'tibios', 'frios', 'dormidos', 'perdidos'];
      
      if (validStatusRankings.includes(statusRankingFilter)) {
        filteredData = filteredData.filter(row => {
          const statusRanking = String(row.status_ranking || '').toLowerCase();
          return statusRanking.includes(statusRankingFilter);
        });
        console.log(`Datos filtrados por status_ranking "${statusRankingFilter}":`, filteredData.length, 'registros');
      } else {
        return c.json({
          success: false,
          error: 'Status ranking no válido',
          message: 'Los status rankings válidos son: calientes, tibios, frios, dormidos, perdidos',
        }, 400);
      }
    }

    // Filtrar por status si se proporciona el parámetro
    if (query.status) {
      const statusFilter = query.status.toLowerCase();
      filteredData = filteredData.filter(row => {
        const status = String(row.status || '').toLowerCase();
        return status.includes(statusFilter);
      });
      console.log(`Datos filtrados por status "${query.status}":`, filteredData.length, 'registros');
    }

    // Filtrar por date si se proporciona el parámetro
    if (query.date) {
      const dateFilter = query.date;
      filteredData = filteredData.filter(row => {
        const date = String(row.date || '');
        // Si el filtro es un año (4 dígitos), buscar en cualquier parte de la fecha
        if (/^\d{4}$/.test(dateFilter)) {
          return date.includes(dateFilter);
        }
        // Si es una fecha completa o parcial, buscar coincidencia exacta
        return date.toLowerCase().includes(dateFilter.toLowerCase());
      });
      console.log(`Datos filtrados por date "${query.date}":`, filteredData.length, 'registros');
    }

    // Filtrar por addressBillingRegion si se proporciona el parámetro
    if (query.addressBillingRegion) {
      const addressBillingRegionFilter = query.addressBillingRegion.toLowerCase();
      filteredData = filteredData.filter(row => {
        const addressBillingRegion = String(row.addressBillingRegion || '').toLowerCase();
        return addressBillingRegion.includes(addressBillingRegionFilter);
      });
      console.log(`Datos filtrados por addressBillingRegion "${query.addressBillingRegion}":`, filteredData.length, 'registros');
    }

    // Filtrar por addressBillingCity si se proporciona el parámetro
    if (query.addressBillingCity) {
      const addressBillingCityFilter = query.addressBillingCity.toLowerCase();
      filteredData = filteredData.filter(row => {
        const addressBillingCity = String(row.addressBillingCity || '').toLowerCase();
        return addressBillingCity.includes(addressBillingCityFilter);
      });
      console.log(`Datos filtrados por addressBillingCity "${query.addressBillingCity}":`, filteredData.length, 'registros');
    }

    // Filtrar por personIdentification si se proporciona el parámetro
    if (query.personIdentification) {
      const personIdentificationFilter = query.personIdentification.toLowerCase();
      filteredData = filteredData.filter(row => {
        const personIdentification = String(row.personIdentification || '').toLowerCase();
        return personIdentification.includes(personIdentificationFilter);
      });
      console.log(`Datos filtrados por personIdentification "${query.personIdentification}":`, filteredData.length, 'registros');
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
