// src/services/supermarketService.ts
import { tokenStorage } from "../utils/storage";

// Tu IP local real para conectar el emulador/celular físico con tu PC
const API_URL = "http://192.168.50.11:4000/api";

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
    // 1. Recuperamos el token persistido de forma segura
    const token = await tokenStorage.getToken();

    if (!token) {
      throw new Error(
        "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
      );
    }

    // 2. Realizamos el GET apuntando al endpoint de tu router (api/supermarkets/getall)
    const response = await fetch(`${API_URL}/supermarkets/getall`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 🛡️ Inyectamos el Bearer token que tu middleware "authenticate" espera validar
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener los supermercados.");
    }

    // Devuelve el arreglo completo de supermercados [{id, name, logo, address}, ...]
    return data;
  },
};
