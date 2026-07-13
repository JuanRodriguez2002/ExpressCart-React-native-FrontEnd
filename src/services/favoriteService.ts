// src/services/favoriteService.ts

const API_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/api";

export const favoriteService = {
  // Obtener la lista de supermercados favoritos
  getFavorites: async (token: string) => {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Error al obtener los favoritos");
    return await response.json();
  },

  // Eliminar un supermercado de favoritos
  deleteFavorite: async (token: string, supermarketId: string) => {
    const response = await fetch(`${API_URL}/favorites/${supermarketId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok)
      throw new Error("Error al eliminar el supermercado de favoritos");
    return await response.json();
  },

  addFavorite: async (token: string, supermarketId: string) => {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ supermarketId }),
    });
    if (!response.ok) throw new Error("Error al agregar a favoritos");
    return await response.json();
  },
};
