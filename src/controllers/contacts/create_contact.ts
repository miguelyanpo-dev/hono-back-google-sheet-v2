import { Context } from 'hono';
import { GoogleSheetsService } from '../../services/google-sheets.service';

export const createContact = async (c: Context) => {
  try {
    const contactData = await c.req.json();
    
    // Validación básica
    if (!contactData.name || !contactData.email) {
      return c.json({
        success: false,
        error: 'Faltan campos requeridos',
        message: 'Los campos name y email son obligatorios',
      }, 400);
    }

    const googleSheetsService = new GoogleSheetsService();
    const newContact = await googleSheetsService.createContact({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone || '',
      identification: contactData.identification || '',
    });

    return c.json({
      success: true,
      data: newContact,
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al crear contacto',
      message: String(error),
    }, 500);
  }
};