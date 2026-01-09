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
 * Obtiene la lista de contactos (people) desde Aliado
 */
  static async getContacts(params: {
    page?: number;
    itemsPerPage?: number;
    identification?: string;
    kind?: string;
  }) {
    const {
      page = 1,
      itemsPerPage = 10,
      identification,
      kind = 'Person',
    } = params;

    let query = `page=${page}&itemsPerPage=${itemsPerPage}&kind=${kind}`;

    if (identification) {
      query += `&identification=${identification}`;
    }

    const endpoint = `people?${query}`;
    return await this.authenticatedRequest(endpoint);
  }

}
