import { Context } from 'hono';
import { GoogleSheetsService } from '../../services/google-sheets.service';

export const getContacts = async (c: Context) => {
  try {
    const query = c.req.query();
    const { id } = c.req.param();

    const googleSheetsService = new GoogleSheetsService();

    let data;
    
    if (id) {
      // Obtener un contacto específico por ID
      data = await googleSheetsService.getContactById(id);
      if (!data) {
        return c.json({
          success: false,
          error: 'Contacto no encontrado',
          message: `No se encontró un contacto con el ID: ${id}`,
        }, 404);
      }
    } else {
      // Obtener todos los contactos
      data = await googleSheetsService.getAllContacts();
      
      // Aplicar filtros si se proporcionan
      if (query.identification) {
        data = data.filter(contact => 
          contact.identification.toLowerCase().includes(query.identification.toLowerCase())
        );
      }
      
      // Paginación
      const page = query.page ? Number(query.page) : 1;
      const itemsPerPage = query.itemsPerPage ? Number(query.itemsPerPage) : 10;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      data = data.slice(startIndex, endIndex);
    }

    return c.json({
      success: true,
      data,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Error al obtener contactos',
      message: String(error),
    }, 500);
  }
};
