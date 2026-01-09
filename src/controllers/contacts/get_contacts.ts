import { Context } from 'hono';
import { AliadoService } from '../../services/aliado.service';

export const getContacts = async (c: Context) => {
  try {
    const query = c.req.query();

    const data = await AliadoService.getContacts({
      page: query.page ? Number(query.page) : undefined,
      itemsPerPage: query.itemsPerPage ? Number(query.itemsPerPage) : undefined,
      identification: query.identification,
      kind: query.kind,
    });

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
