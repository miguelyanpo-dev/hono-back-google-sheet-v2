import { Context } from 'hono';
import { AliadoService } from '../../services/aliado.service';

export const getInvoices = async (c: Context) => {
  try {
    const { page = '1', itemsPerPage = '10' } = c.req.query();
    
    const pageNum = parseInt(page, 10);
    const itemsNum = parseInt(itemsPerPage, 10);
    
    const data = await AliadoService.getInvoices(pageNum, itemsNum);
    
    return c.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Error al obtener facturas', 
      message: String(error) 
    }, 500);
  }
};
