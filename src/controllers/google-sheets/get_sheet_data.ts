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
        'calientes': 'Calientes 🔥',
        'antiguos': 'Antiguos 🕰️',
        'excluidos': 'Excluidos 🚫',
        'listanegra': 'Lista Negra 🚫'
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
          message: 'Los rankings válidos son: perdidos, dormidos, frios, tibios, calientes, antiguos, excluido, listanegra',
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
      const validStatusRankings = ['calientes', 'tibios', 'frios', 'dormidos', 'perdidos', 'antiguos', 'excluido', 'listanegra'];
      
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
          message: 'Los status rankings válidos son: calientes, tibios, frios, dormidos, perdidos, antiguos, excluido, listanegra',
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

    // Ordenar por date si se proporciona el parámetro sort=date
    if (query.sort === 'date') {
      filteredData.sort((a, b) => {
        const dateA = new Date(String(a.date || ''));
        const dateB = new Date(String(b.date || ''));
        return dateA.getTime() - dateB.getTime();
      });
      console.log('Datos ordenados por fecha ascendente');
    }

    // Ordenar por date en orden descendente si se proporciona el parámetro sort=date_desc
    if (query.sort === 'date_desc') {
      filteredData.sort((a, b) => {
        const dateA = new Date(String(a.date || ''));
        const dateB = new Date(String(b.date || ''));
        return dateB.getTime() - dateA.getTime();
      });
      console.log('Datos ordenados por fecha descendente');
    }

    // Ordenar por daysFromDate de menor a mayor si se proporciona el parámetro sort=daysFromDate
    if (query.sort === 'daysFromDate') {
      filteredData.sort((a, b) => {
        const daysA = Number(String(a.daysFromDate || '0'));
        const daysB = Number(String(b.daysFromDate || '0'));
        return daysA - daysB;
      });
      console.log('Datos ordenados por daysFromDate de menor a mayor');
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

    // Filtrar por consecutive si se proporciona el parámetro
    if (query.consecutive) {
      const consecutiveFilter = query.consecutive.toUpperCase(); // Convertir a mayúsculas para coincidir con el formato de los datos
      filteredData = filteredData.filter(row => {
        const consecutive = String(row.consecutive || '').toUpperCase();
        return consecutive.includes(consecutiveFilter);
      });
      console.log(`Datos filtrados por consecutive "${query.consecutive}":`, filteredData.length, 'registros');
    }

    // Filtrar por reasignado si se proporciona el parámetro
    if (query.reasignado) {
      const reasignadoFilter = query.reasignado;
      filteredData = filteredData.filter(row => {
        const reasignado = String(row.reasignado || '');
        return reasignado === reasignadoFilter;
      });
      console.log(`Datos filtrados por reasignado "${query.reasignado}":`, filteredData.length, 'registros');
    }

    // Filtrar por misSeguimientos si se proporciona el parámetro
    if (query.misSeguimientos) {
      const misSeguimientosFilter = query.misSeguimientos;
      filteredData = filteredData.filter(row => {
        const misSeguimientos = String(row.misSeguimientos || '');
        return misSeguimientos === misSeguimientosFilter;
      });
      console.log(`Datos filtrados por misSeguimientos "${query.misSeguimientos}":`, filteredData.length, 'registros');
    }

    // Filtrar por itemsPerPage si se proporciona el parámetro
    if (query.itemsPerPage) {
      const itemsPerPageFilter = Number(query.itemsPerPage);
      if (!isNaN(itemsPerPageFilter) && itemsPerPageFilter > 0 && itemsPerPageFilter <= 1000) {
        // Aplicar paginación con el valor proporcionado
        let page = 1;
        if (query.page) {
          page = Math.max(1, Number(query.page));
        }
        
        const startIndex = (page - 1) * itemsPerPageFilter;
        const endIndex = startIndex + itemsPerPageFilter;
        filteredData = filteredData.slice(startIndex, endIndex);
        console.log(`Datos filtrados por itemsPerPage "${itemsPerPageFilter}":`, filteredData.length, 'registros');
      } else {
        return c.json({
          success: false,
          error: 'Items per page no válido',
          message: 'El valor de itemsPerPage debe ser un número entre 1 y 1000',
        }, 400);
      }
    }
    
    // Aplicar paginación con límite máximo de 1000 items por página y valor por defecto de 20
    let paginatedData = filteredData;
    let page = 1;
    let itemsPerPage = 20; // Valor por defecto
    let hasMore = false;
    let hasPrev = false;

    if (query.page) {
      page = Math.max(1, Number(query.page));
    }
    
    if (query.itemsPerPage) {
      itemsPerPage = Math.min(1000, Math.max(1, Number(query.itemsPerPage)));
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Determinar si hay más páginas o páginas anteriores
    hasMore = endIndex < filteredData.length;
    hasPrev = page > 1;

    // Calcular totales por status_ranking
    const totalTodos = filteredData.length;
    const totalCalientes = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('calientes')).length;
    const totalTibios = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('tibios')).length;
    const totalFrios = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('frios')).length;
    const totalDormidos = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('dormidos')).length;
    const totalPerdidos = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('perdidos')).length;
    const totalAntiguos = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('antiguos')).length;
    const totalExcluidos = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('excluido')).length;
    const totalListaNegra = filteredData.filter(row => String(row.status_ranking || '').toLowerCase().includes('listanegra')).length;
    
    // Calcular totales para reasignado y misSeguimientos
    const totalReasignados = filteredData.filter(row => String(row.reasignado || '') === '1').length;
    const totalMisSeguimientos = filteredData.filter(row => String(row.misSeguimientos || '') === '1').length;
    

    return c.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        itemsPerPage,
        total: filteredData.length,
        hasMore,
        hasPrev,
        totals: {
          totalTodos,
          totalCalientes,
          totalTibios,
          totalFrios,
          totalDormidos,
          totalPerdidos,
          totalAntiguos,
          totalExcluidos,
          totalListaNegra,
          totalReasignados,
          totalMisSeguimientos
        }
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
