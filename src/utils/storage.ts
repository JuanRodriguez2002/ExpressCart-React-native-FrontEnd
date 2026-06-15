// src/utils/storage.ts
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_user_token";

export const tokenStorage = {
  /**
   * Guarda el token JWT de forma segura al iniciar sesión
   */
  saveToken: async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  /**
   * Obtiene el token guardado para inyectarlo en las peticiones HTTP
   */
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  /**
   * Elimina el token (Útil para el Cerrar Sesión / Logout)
   */
  removeToken: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
