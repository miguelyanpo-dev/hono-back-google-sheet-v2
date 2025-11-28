import { Context } from 'hono';
import { AliadoService } from '../../services/aliado.service';

export const getInvoicesCurrent = async (c: Context) => {
  try {
    const { page = '1', personIdSeller } = c.req.query();
    
    const pageNum = parseInt(page, 10);
    
    const data = await AliadoService.getInvoicesCurrent(pageNum, personIdSeller);
    
    return c.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Error al obtener facturas actuales', 
      message: String(error) 
    }, 500);
  }
};
