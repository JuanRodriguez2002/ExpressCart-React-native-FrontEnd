const BASE_URL = "http://192.168.1.10:5000/api";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Configuración por defecto (Headers estándar para JSON)
  const defaultHeaders = {
    "Content-Type": "application/json",
    // Aquí podremos agregar el token de autenticación más adelante
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error en la petición: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en la API (${endpoint}):`, error);

    throw error;
  }
};
