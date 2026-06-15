import { tokenStorage } from "@/utils/storage";
import { encryptPayload } from "../utils/crypto";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  // Añade otros campos que devuelva tu req.user si es necesario
}
// Cambia 'localhost' por la IP de tu computadora o 10.0.2.2 si falla en Android
const API_URL = "http://192.168.50.11:4000/api";

export const authService = {
  /**
   * Realiza la petición de login enviando los datos cifrados a la API
   */
  login: async (credentials: object) => {
    // 1. Ciframos el cuerpo de la petición
    const secureBody = encryptPayload(credentials);

    // 2. Realizamos la llamada HTTP nativa
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(secureBody),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lanzamos el mensaje enviado por el backend o uno por defecto
      throw new Error(data.message || data.error || "Error al iniciar sesión.");
    }

    await tokenStorage.saveToken(data.token);
    return data.token;
    // Se asume que retorna la estructura del usuario y su token, por ejemplo:
    // { token: "...", user: { id: 1, name: "...", role: "client" } }
  },

  /**
   * 2. Petición GET para obtener los datos del usuario usando el token
   * Ajusta la ruta '/auth/profile' por el nombre exacto de tu endpoint (ej: '/auth/me', '/users/profile')
   */
  getUserProfile: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Enviamos el JWT de forma segura
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "No se pudo obtener el perfil del usuario.",
      );
    }

    return data; // Retorna: { id, name, email, role }
  },

  /**
   * Registrar una cuenta de cliente
   */
  createAccount: async (accountData: object): Promise<void> => {
    // 1. Ciframos los datos del nuevo usuario (name, email, password)
    const secureBody = encryptPayload(accountData);

    // 2. Enviamos la petición al endpoint de creación
    const response = await fetch(`${API_URL}/auth/create-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secureBody),
    });

    const data = await response.json();

    // 3. Si el backend responde con un error (ej: correo ya registrado), lo lanzamos
    if (!response.ok) {
      throw new Error(data.message || data.error);
    }
  },

  /**
   * Confirmar cuenta mediante el token de 6 dígitos
   */
  confirmAccount: async (token: string): Promise<void> => {
    // 1. Ciframos el cuerpo estructurado tal como lo espera tu API: { token: "123456" }
    const secureBody = encryptPayload({ token });

    // 2. Realizamos la petición POST al endpoint de confirmación
    const response = await fetch(`${API_URL}/auth/confirm-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secureBody),
    });

    const data = await response.json();

    // 3. Si el token expiró, es incorrecto o está corrupto, lanzamos el error devuelto
    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Código de verificación inválido.",
      );
    }
  },

  /**
   * Solicitar código de recuperación de contraseña
   */
  forgotPassword: async (email: string): Promise<void> => {
    // 1. Estructuramos y ciframos el payload esperado por tu backend
    const secureBody = encryptPayload({ email });

    // 2. Ejecutamos la petición POST al endpoint de recuperación
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secureBody),
    });

    const data = await response.json();

    // 3. Si el correo no existe o hay algún bloqueo, lanzamos el error devuelto
    if (!response.ok) {
      throw new Error(
        data.message || data.error || "No se pudo procesar la solicitud.",
      );
    }
  },

  /**
   * (MOCK/STUB): Validar token para recuperar contraseña
   * Cuando implementes este endpoint en tu backend, solo debes actualizar esta sección.
   */
  validateForgotPasswordToken: async (token: string): Promise<void> => {
    const secureBody = encryptPayload({ token });

    // Simulación del endpoint de recuperación (Ajusta la URL cuando la crees en el backend)
    const response = await fetch(`${API_URL}/auth/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secureBody),
    });

    // 1. Si la respuesta falla (Status 404 de token inválido)
    if (!response.ok) {
      const data = await response.json(); // Leemos el JSON { error: "Invalid token" }
      throw new Error(data.error || "El código ingresado es inválido.");
    }

    await response.text();
  },

  /**
   * Restablecer la contraseña usando el token dinámico
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    // 1. Ciframos el payload estructurado tal como lo espera recibir tu controlador
    const secureBody = encryptPayload({ password });

    // 2. Ejecutamos el fetch concatenando el token en la URL dinámica
    const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(secureBody),
    });

    // 3. Si es un string plano como el endpoint anterior o un JSON, manejamos la respuesta de error
    if (!response.ok) {
      const data = await response
        .json()
        .catch(() => ({ error: "Error al actualizar la contraseña." }));
      throw new Error(data.error || "No se pudo actualizar la contraseña.");
    }

    // Consumimos el cuerpo de la respuesta limpia por si devuelve texto plano o un JSON de éxito
    await response.text();
  },
};
