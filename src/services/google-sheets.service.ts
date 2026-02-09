import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import { config } from '../config/config';
import * as path from 'path';

// Importamos el tipo correcto de Google Auth Library
import { GoogleAuth } from 'google-auth-library';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  identification: string;
  createdAt: string;
  updatedAt: string;
}

export class GoogleSheetsService {
  private auth: any;
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = config.googleSheets.spreadsheetId;
    
    // Ruta al archivo de credenciales
    const credentialsPath = path.join(__dirname, '../credentials/credentials.json');
    
    this.auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Obtiene todos los contactos de la hoja de cálculo
   */
  async getAllContacts(): Promise<Contact[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Contacts!A2:G', // Asumimos que la fila 1 tiene encabezados
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        email: row[2] || '',
        phone: row[3] || '',
        identification: row[4] || '',
        createdAt: row[5] || '',
        updatedAt: row[6] || '',
      }));
    } catch (error) {
      console.error('Error obteniendo contactos:', error);
      throw new Error('No se pudieron obtener los contactos');
    }
  }

  /**
   * Obtiene un contacto por su ID
   */
  async getContactById(id: string): Promise<Contact | null> {
    const contacts = await this.getAllContacts();
    return contacts.find(contact => contact.id === id) || null;
  }

  /**
   * Crea un nuevo contacto
   */
  async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const now = new Date().toISOString();
    const newContact: Contact = {
      id: this.generateId(),
      ...contactData,
      createdAt: now,
      updatedAt: now,
    };

    try {
      // Primero obtenemos la última fila para saber dónde insertar
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Contacts!A:A',
      });

      const lastRow = response.data.values ? response.data.values.length + 1 : 2;

      // Insertamos el nuevo contacto
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Contacts!A${lastRow}:G${lastRow}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            newContact.id,
            newContact.name,
            newContact.email,
            newContact.phone,
            newContact.identification,
            newContact.createdAt,
            newContact.updatedAt,
          ]],
        },
      });

      return newContact;
    } catch (error) {
      console.error('Error creando contacto:', error);
      throw new Error('No se pudo crear el contacto');
    }
  }

  /**
   * Actualiza un contacto existente
   */
  async updateContact(id: string, updateData: Partial<Omit<Contact, 'id'>>): Promise<Contact | null> {
    const contacts = await this.getAllContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === id);

    if (contactIndex === -1) {
      return null;
    }

    const contact = contacts[contactIndex];
    const updatedContact: Contact = {
      ...contact,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Encontramos la fila correspondiente (sumamos 2 porque la fila 1 es encabezado y arrays son 0-indexados)
      const rowNumber = contactIndex + 2;

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Contacts!A${rowNumber}:G${rowNumber}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            updatedContact.id,
            updatedContact.name,
            updatedContact.email,
            updatedContact.phone,
            updatedContact.identification,
            updatedContact.createdAt,
            updatedContact.updatedAt,
          ]],
        },
      });

      return updatedContact;
    } catch (error) {
      console.error('Error actualizando contacto:', error);
      throw new Error('No se pudo actualizar el contacto');
    }
  }

  /**
   * Elimina un contacto
   */
  async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getAllContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === id);

    if (contactIndex === -1) {
      return false;
    }

    try {
      // Obtenemos la fila a eliminar
      const rowNumber = contactIndex + 2; // +2 porque la fila 1 es encabezado

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Asumimos que la hoja Contacts es la primera (índice 0)
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
      console.error('Error eliminando contacto:', error);
      throw new Error('No se pudo eliminar el contacto');
    }
  }

  /**
   * Genera un ID único para el contacto
   */
  private generateId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}