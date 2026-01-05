import { config } from '../config/config';

export class AliadoService {
  private static baseUrl = config.aliado.apiUrl;
  private static token = config.aliado.bearerToken;

  /**
   * Realiza una petición autenticada a la API de Aliado
   */
  static async authenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/${endpoint}`;
    
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en petición a Aliado: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Obtiene la lista de facturas con paginación
   * @param page - Número de página (default: 1)
   * @param personId - ID de la persona (opcional)
   */
  static async getInvoices(page: number = 1, personId?: string) {
    // Parámetros fijos
    const itemsPerPage = 10;
    const status = 'Vigente';
    
    // Construir query params
    let queryParams = `page=${page}&itemsPerPage=${itemsPerPage}&status=${status}`;
    
    // Agregar personId solo si está presente
    if (personId) {
      queryParams += `&personId=${personId}`;
    }
    
    const endpoint = `invoices?${queryParams}`;
    return await this.authenticatedRequest(endpoint);
  }

  /**
   * Obtiene las facturas actuales (vigentes)
   * @param page - Número de página (default: 1)
   * @param personIdSeller - ID del vendedor (opcional)
   */
  static async getInvoicesCurrent(page: number = 1, personIdSeller?: string) {
    // Parámetros fijos
    const itemsPerPage = 10;
    const status = 'Vigente';
    
    // Construir query params
    let queryParams = `page=${page}&itemsPerPage=${itemsPerPage}&status=${status}`;
    
    // Agregar personIdSeller solo si está presente
    if (personIdSeller) {
      queryParams += `&personIdSeller=${personIdSeller}`;
    }
    
    const endpoint = `invoices?${queryParams}`;
    return await this.authenticatedRequest(endpoint);
  }

  /**
   * Obtiene las facturas con pago parcial
   * @param page - Número de página (default: 1)
   * @param personIdSeller - ID del vendedor (opcional)
   */
  static async getInvoicesPartialPayment(page: number = 1, personIdSeller?: string) {
    // Parámetros fijos
    const itemsPerPage = 10;
    const status = 'PagoParcial';
    
    // Construir query params
    let queryParams = `page=${page}&itemsPerPage=${itemsPerPage}&status=${status}`;
    
    // Agregar personIdSeller solo si está presente
    if (personIdSeller) {
      queryParams += `&personIdSeller=${personIdSeller}`;
    }
    
    const endpoint = `invoices?${queryParams}`;
    return await this.authenticatedRequest(endpoint);
  }

  /**
   * Obtiene la lista de vendedores
   */
  static async getSellers() {
    const endpoint = 'people/sellers';
    return await this.authenticatedRequest(endpoint);
  }

  /**
 * Obtiene la lista de contactos (people) desde Aliado
 */
  static async getContacts(params: {
    page?: number;
    itemsPerPage?: number;
    identification?: string;
  }) {
    const {
      page = 1,
      itemsPerPage = 10,
      identification,
    } = params;

    let query = `page=${page}&itemsPerPage=${itemsPerPage}&kind=Person`;

    if (identification) {
      query += `&identification=${identification}`;
    }

    const endpoint = `people?${query}`;
    return await this.authenticatedRequest(endpoint);
  }

}
