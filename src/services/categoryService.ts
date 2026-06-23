// src/services/categoryService.ts
import { tokenStorage } from "../utils/storage";

const API_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/api";

export interface ApiCategory {
  id: number;
  name: string;
}

export const categoryService = {
  /**
   * Obtiene las categorías vinculadas a un supermercado específico
   */
  getBySupermarket: async (
    supermarketId: string | number,
  ): Promise<ApiCategory[]> => {
    const token = await tokenStorage.getToken();

    if (!token) {
      throw new Error(
        "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
      );
    }

    // Apuntamos al endpoint: /categories/supermarket/:supermarketId
    const response = await fetch(
      `${API_URL}/categories/supermarket/${supermarketId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener las categorías.");
    }

    return data;
  },
};
