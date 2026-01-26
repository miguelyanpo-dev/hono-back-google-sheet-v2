import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { config } from '../config/config';

export interface SheetData {
  [key: string]: any;
}

export class GoogleSheetsGenericService {
  private auth: JWT;
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = config.googleSheets.spreadsheetId;
    
    this.auth = new google.auth.JWT({
      email: config.googleSheets.serviceAccountEmail,
      key: config.googleSheets.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Obtiene los nombres de todas las hojas en el documento
   */
  async getSheetNames(): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheets = response.data.sheets || [];
      return sheets.map(sheet => sheet.properties?.title || '').filter(title => title);
    } catch (error) {
      console.error('Error obteniendo nombres de hojas:', error);
      throw new Error('No se pudieron obtener los nombres de las hojas');
    }
  }

  /**
   * Obtiene los encabezados de una hoja específica
   */
  async getHeaders(sheetName: string): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = response.data.values?.[0] || [];
      return headers;
    } catch (error) {
      console.error('Error obteniendo encabezados:', error);
      throw new Error('No se pudieron obtener los encabezados');
    }
  }

  /**
   * Obtiene todos los datos de una hoja específica
   */
  async getSheetData(sheetName: string): Promise<SheetData[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:Z`, // Asumimos que la fila 1 tiene encabezados
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      // Obtenemos los encabezados
      const headers = await this.getHeaders(sheetName);

      // Convertimos las filas a objetos usando los encabezados
      return rows.map(row => {
        const rowData: SheetData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        return rowData;
      });
    } catch (error) {
      console.error('Error obteniendo datos de la hoja:', error);
      throw new Error('No se pudieron obtener los datos de la hoja');
    }
  }

  /**
   * Obtiene un registro específico por su índice en una hoja
   */
  async getRecordByIndex(sheetName: string, index: number): Promise<SheetData | null> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${index + 2}:Z${index + 2}`, // +2 porque la fila 1 es encabezado
      });

      const row = response.data.values?.[0];
      if (!row) {
        return null;
      }

      const headers = await this.getHeaders(sheetName);
      const recordData: SheetData = {};

      headers.forEach((header, index) => {
        recordData[header] = row[index] || '';
      });

      return recordData;
    } catch (error) {
      console.error('Error obteniendo registro por índice:', error);
      throw new Error('No se pudo obtener el registro');
    }
  }

  /**
   * Crea un nuevo registro en una hoja específica
   */
  async createRecord(sheetName: string, recordData: SheetData): Promise<SheetData> {
    try {
      // Primero obtenemos la última fila para saber dónde insertar
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:A`,
      });

      const lastRow = response.data.values ? response.data.values.length + 1 : 2;

      // Obtenemos los encabezados para ordenar los datos
      const headers = await this.getHeaders(sheetName);

      // Preparamos los valores en el orden de los encabezados
      const values = headers.map(header => recordData[header] || '');

      // Insertamos el nuevo registro
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${lastRow}:${String.fromCharCode(65 + headers.length - 1)}${lastRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });

      // Retornamos el registro creado con todos sus campos
      const createdRecord: SheetData = {};
      headers.forEach((header, index) => {
        createdRecord[header] = values[index];
      });

      return createdRecord;
    } catch (error) {
      console.error('Error creando registro:', error);
      throw new Error('No se pudo crear el registro');
    }
  }

  /**
   * Actualiza un registro existente en una hoja específica
   */
  async updateRecord(sheetName: string, index: number, updateData: SheetData): Promise<SheetData | null> {
    try {
      // Obtenemos los encabezados
      const headers = await this.getHeaders(sheetName);

      // Obtenemos el registro actual
      const currentRecord = await this.getRecordByIndex(sheetName, index);
      if (!currentRecord) {
        return null;
      }

      // Combinamos los datos actuales con los datos de actualización
      const updatedRecord = { ...currentRecord, ...updateData };

      // Preparamos los valores en el orden de los encabezados
      const values = headers.map(header => updatedRecord[header] || '');

      // Actualizamos el registro
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${index + 2}:${String.fromCharCode(65 + headers.length - 1)}${index + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      });

      return updatedRecord;
    } catch (error) {
      console.error('Error actualizando registro:', error);
      throw new Error('No se pudo actualizar el registro');
    }
  }

  /**
   * Elimina un registro de una hoja específica
   */
  async deleteRecord(sheetName: string, index: number): Promise<boolean> {
    try {
      // Obtenemos la fila a eliminar
      const rowNumber = index + 2; // +2 porque la fila 1 es encabezado

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: await this.getSheetId(sheetName),
                dimension: 'ROWS',
                startIndex: rowNumber - 1, // Google Sheets usa 0-indexed para batchUpdate
                endIndex: rowNumber,
              },
            },
          }],
        },
      });

      return true;
    } catch (error) {
      console.error('Error eliminando registro:', error);
      throw new Error('No se pudo eliminar el registro');
    }
  }

  /**
   * Obtiene el ID de una hoja por su nombre
   */
  private async getSheetId(sheetName: string): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
      if (!sheet || !sheet.properties?.sheetId) {
        throw new Error(`Hoja "${sheetName}" no encontrada`);
      }

      return sheet.properties.sheetId;
    } catch (error) {
      console.error('Error obteniendo ID de hoja:', error);
      throw new Error('No se pudo obtener el ID de la hoja');
    }
  }
}