import { Context } from 'hono';
import { AliadoService } from '../../services/aliado.service';

export const getSellers = async (c: Context) => {
  try {
    const data = await AliadoService.getSellers();
    
    return c.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Error al obtener vendedores', 
      message: String(error) 
    }, 500);
  }
};
