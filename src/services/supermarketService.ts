import { tokenStorage } from "../utils/storage";

// Tu IP local real para conectar el emulador/celular físico con tu PC
const API_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/api";

export interface Supermarket {
  id: string;
  name: string;
  logo: string | null;
  address: string;
}

export const supermarketService = {
  /**
   * Obtiene la lista completa de supermercados desde la base de datos
   */
  getAll: async (): Promise<Supermarket[]> => {
    const token = await tokenStorage.getToken();

    if (!token) {
      throw new Error(
        "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
      );
    }

    const response = await fetch(`${API_URL}/supermarkets/getall`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener los supermercados.");
    }

    return data;
  },

  /**
   * Obtiene un supermercado específico por su ID
   */
  getById: async (id: string | number): Promise<Supermarket> => {
    const token = await tokenStorage.getToken();

    if (!token) {
      throw new Error(
        "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
      );
    }

    // Apuntamos al endpoint: /supermarkets/getById/:id
    const response = await fetch(`${API_URL}/supermarkets/getById/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Error al obtener la información del supermercado.",
      );
    }

    return data;
  },
};
