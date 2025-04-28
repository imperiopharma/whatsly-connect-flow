
import { API_CONFIG } from '@/config/api';

/**
 * Serviço para fazer requisições à API
 */
class ApiService {
  /**
   * Faz uma requisição GET
   */
  async get(endpoint: string, options = {}) {
    try {
      const response = await fetch(`${API_CONFIG.URL_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      throw error;
    }
  }

  /**
   * Faz uma requisição POST
   */
  async post(endpoint: string, data = {}, options = {}) {
    try {
      const response = await fetch(`${API_CONFIG.URL_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      throw error;
    }
  }

  /**
   * Faz uma requisição PUT
   */
  async put(endpoint: string, data = {}, options = {}) {
    try {
      const response = await fetch(`${API_CONFIG.URL_BASE}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição PUT:', error);
      throw error;
    }
  }

  /**
   * Faz uma requisição DELETE
   */
  async delete(endpoint: string, options = {}) {
    try {
      const response = await fetch(`${API_CONFIG.URL_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na requisição DELETE:', error);
      throw error;
    }
  }
}

export const api = new ApiService();
