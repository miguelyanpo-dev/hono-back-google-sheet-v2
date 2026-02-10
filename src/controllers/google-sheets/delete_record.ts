import { Context } from 'hono';
import { GoogleSheetsGenericService } from '../../services/google-sheets-generic.service';

export const deleteRecord = async (c: Context) => {
  try {
    const { nameSheet } = c.req.param();
    const query = c.req.query();
    const spreadsheetId = query.spreadsheetId;
    const personIdentification = query.personIdentification;
    
    if (!personIdentification) {
      return c.json({
        success: false,
        error: 'personIdentification requerido',
        message: 'Debe proporcionar el parámetro personIdentification para eliminar el registro',
      }, 400);
    }

    const googleSheetsService = new GoogleSheetsGenericService(spreadsheetId);
    
    // Obtener todos los datos de la hoja
    const allData = await googleSheetsService.getSheetData(nameSheet);
    
    // Encontrar el registro con el personIdentification especificado
    const recordIndex = allData.findIndex(record => 
      String(record.personIdentification || '').toLowerCase() === personIdentification.toLowerCase()
    );

    if (recordIndex === -1) {
      return c.json({
        success: false,
        error: 'Registro no encontrado',
        message: `No se encontró un registro con personIdentification: ${personIdentification}`,
      }, 404);
    }

    // Eliminar el registro
    const deleted = await googleSheetsService.deleteRecord(nameSheet, recordIndex);

    if (!deleted) {
      return c.json({
        success: false,
        error: 'Error al eliminar',
        message: 'No se pudo eliminar el registro',
      }, 500);
    }

    // Reordenar los datos por personIdentification
    const reorderedData = await reorderDataByPersonIdentification(googleSheetsService, nameSheet, allData, recordIndex);

    return c.json({
      success: true,
      message: `Registro con personIdentification ${personIdentification} eliminado exitosamente y datos reordenados`,
      reorderedData: reorderedData.length
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al eliminar registro',
      message: String(error),
    }, 500);
  }
};

/**
 * Reordena los datos en la hoja por personIdentification después de eliminar un registro
 */
async function reorderDataByPersonIdentification(
  googleSheetsService: GoogleSheetsGenericService, 
  nameSheet: string, 
  allData: any[], 
  deletedIndex: number
): Promise<any[]> {
  try {
    // Obtener los encabezados
    const headers = await googleSheetsService.getHeaders(nameSheet);
    
    // Filtrar el registro eliminado y ordenar por personIdentification
    const remainingData = allData
      .filter((_, index) => index !== deletedIndex)
      .sort((a, b) => {
        const personA = String(a.personIdentification || '').toLowerCase();
        const personB = String(b.personIdentification || '').toLowerCase();
        return personA.localeCompare(personB);
      });

    // Preparar los valores para actualizar en Google Sheets
    const values = remainingData.map(record => {
      return headers.map(header => {
        const value = record[header];
        // Si el valor es un número, mantenerlo como número
        if (typeof value === 'number') {
          return value;
        }
        // Si es un string que parece un número, convertirlo a número
        if (typeof value === 'string' && !isNaN(Number(value))) {
          return Number(value);
        }
        // Para otros casos, devolver el valor tal cual
        return value || '';
      });
    });

    // Actualizar el rango de datos en Google Sheets
    if (values.length > 0) {
      await googleSheetsService.sheets.spreadsheets.values.update({
        spreadsheetId: googleSheetsService.spreadsheetId,
        range: `${nameSheet}!A2:${String.fromCharCode(65 + headers.length - 1)}${values.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: values,
        },
      });
    } else {
      // Si no quedan datos, limpiar el rango
      await googleSheetsService.sheets.spreadsheets.values.clear({
        spreadsheetId: googleSheetsService.spreadsheetId,
        range: `${nameSheet}!A2:Z`,
      });
    }

    return remainingData;
  } catch (error) {
    console.error('Error reordenando datos:', error);
    throw new Error('No se pudo reordenar los datos después de la eliminación');
  }
}
