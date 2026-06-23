const BASE_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/api";

export interface CheckoutPayload {
  supermarketId: number;
  addressId: number;
  paymentMethodId: number;
  products: Array<{ id: number; quantity: number }>;
}

export type OrderStatus =
  | "activa"
  | "en proceso"
  | "en camino"
  | "completada"
  | "cancelada";

export interface OrderBackendResponse {
  id: number;
  total: string;
  status: OrderStatus;
  userId: number;
  deliveryId: number | null;
  supermarketId: number;
  addressId: number;
  paymentMethodId: number;
  createdAt: string; // Usaremos esto para extraer la fecha y hora
  updatedAt: string;
  supermarket?: {
    name: string; // Nota: Si no tienes el include de Supermarket, se usará fallback
  };
  products: Array<{
    id: number;
    name: string;
    price: string;
    OrderProduct: {
      quantity: number;
      priceAtPurchase: string;
    };
  }>;
  address: {
    fullAddress: string;
    references: string;
  };
  paymentMethod: {
    provider: string;
  };
}

export const orderService = {
  // ==========================================
  //          MÉTODOS DE PROCESAMIENTO
  // ==========================================

  /**
   * Envía la orden de compra con los productos, método de pago y dirección seleccionada
   * Endpoint real: POST http://192.168.50.11:4000/api/orders/checkout
   */
  checkoutOrder: async (token: string, payload: CheckoutPayload) => {
    const response = await fetch(`${BASE_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Algo salió mal al procesar la orden");
    }

    return data; // Retorna { message, orderId, total, status }
  },

  getClientHistory: async (
    token: string,
    status?: OrderStatus,
  ): Promise<OrderBackendResponse[]> => {
    const url = status
      ? `${BASE_URL}/orders/client/history?status=${status}`
      : `${BASE_URL}/orders/client/history`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al obtener el historial");
    }
    return data;
  },
};
