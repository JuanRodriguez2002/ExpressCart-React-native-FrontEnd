// src/services/profileService.ts

// Cambia '192.168.X.X' por la IP local de tu PC si pruebas en un dispositivo físico
const API_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/api/profile";

export const profileService = {
  /**
   * Envía la nueva dirección al backend
   * @param token El token JWT de autenticación del usuario
   * @param addressData Objeto con fullAddress, references e isDefault
   */
  createAddress: async (
    token: string,
    addressData: {
      fullAddress: string;
      references: string;
      isDefault: boolean;
    },
  ) => {
    const response = await fetch(`${API_URL}/addresses/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Tu API requiere req.user.id, pasamos el token
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al registrar la dirección");
    }

    return data; // Retorna { message, address } tal como lo envía tu API
  },

  getAddresses: async (token: string) => {
    const response = await fetch(`${API_URL}/addresses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener las direcciones");
    }

    return data; // Retorna el arreglo directo que envía tu Express: [ {id, fullAddress, ...}, ... ]
  },

  /**
   * Actualiza una dirección existente por su ID
   */
  updateAddress: async (
    token: string,
    id: string,
    addressData: {
      fullAddress: string;
      references: string;
      isDefault: boolean;
    },
  ) => {
    const response = await fetch(`${API_URL}/addresses/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al actualizar la dirección");
    }

    return data; // Retorna { message, address }
  },

  deleteAddress: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/addresses/delete/${id}`, {
      method: "DELETE", // 👈 Método HTTP correcto
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al eliminar la dirección");
    }

    return data; // Retorna { message } o el JSON de éxito de tu backend
  },

  // ==========================================
  //          MÉTODOS DE CONTACTO (CRUD)
  // ==========================================

  /** Obtiene todos los contactos del usuario */
  getContacts: async (token: string) => {
    const response = await fetch(`${API_URL}/contacts`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al obtener los contactos");
    return data; // Arreglo de UserContact
  },

  /** Crea un nuevo contacto */
  createContact: async (
    token: string,
    contactData: { phoneNumber: string; type: string },
  ) => {
    const response = await fetch(`${API_URL}/contacts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contactData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al crear el contacto");
    return data; // { message, contact }
  },

  /** Actualiza un contacto existente */
  updateContact: async (
    token: string,
    id: string,
    contactData: { phoneNumber: string; type: string },
  ) => {
    const response = await fetch(`${API_URL}/contacts/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(contactData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al actualizar el contacto");
    return data; // { message, contact }
  },

  /** Elimina un contacto de forma permanente */
  deleteContact: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/contacts/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al eliminar el contacto");
    return data; // { message }
  },

  // ==========================================
  //       MÉTODOS DE PAGO (CRUD)
  // ==========================================

  /** Obtiene todos los métodos de pago vinculados al usuario */
  getPaymentMethods: async (token: string) => {
    const response = await fetch(`${API_URL}/payments`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al obtener métodos de pago");

    return data;
  },

  /** Registra un nuevo método de pago */
  createPaymentMethod: async (
    token: string,
    paymentData: {
      provider: string;
      lastFourDigits?: string;
      paymentToken?: string;
    },
  ) => {
    const response = await fetch(`${API_URL}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al registrar el método de pago");
    return data; // { message, paymentMethod }
  },

  /** Actualiza un método de pago existente */
  updatePaymentMethod: async (
    token: string,
    id: string,
    paymentData: { provider: string; lastFourDigits?: string },
  ) => {
    const response = await fetch(`${API_URL}/payments/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al actualizar el método de pago");
    return data; // { message, method }
  },

  /** Elimina un método de pago de manera permanente */
  deletePaymentMethod: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/payments/delete/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Error al eliminar el método de pago");
    return data;
  },
};
