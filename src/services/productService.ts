// src/services/productService.ts
import { tokenStorage } from "../utils/storage";

const API_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/api";

export interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  unitType: "ud" | "lb";
}

export const productService = {
  /**
   * Obtiene la lista plana de productos de una categoría y supermercado específicos
   */
  getBySupermarketAndCategory: async (
    supermarketId: string | number,
    categoryId: string | number,
  ): Promise<ApiProduct[]> => {
    const token = await tokenStorage.getToken();

    if (!token) {
      throw new Error(
        "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
      );
    }

    // Endpoint corregido: /products/supermarket/:supermarketId/category/:categoryId
    const response = await fetch(
      `${API_URL}/products/supermarket/${supermarketId}/category/${categoryId}`,
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
      throw new Error(data.error || "Error al obtener los productos.");
    }

    return data;
  },
};
