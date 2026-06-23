// src/hooks/useClientOrders.ts
import {
  OrderBackendResponse,
  orderService,
  OrderStatus,
} from "@/services/orderService";
import { tokenStorage } from "@/utils/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// URL base de tu ecosistema de sockets (Misma IP de tu backend)
const SOCKET_URL =
  "https://expresscart-nodejs-express-backend-production.up.railway.app/";

export interface RealTimeNotification {
  orderId: number;
  status: OrderStatus;
  message: string;
}

export const useClientOrders = () => {
  const [orders, setOrders] = useState<OrderBackendResponse[]>([]);
  const [filtro, setFiltro] = useState<OrderStatus>("activa");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar la barra de notificación pequeña en tiempo real
  const [notification, setNotification] = useState<RealTimeNotification | null>(
    null,
  );
  const socketRef = useRef<Socket | null>(null);

  // 🔄 Guardamos el filtro en una referencia para que el socket siempre acceda
  // al filtro seleccionado actualmente sin necesidad de reiniciar el efecto de escucha
  const filtroRef = useRef<OrderStatus>(filtro);

  useEffect(() => {
    filtroRef.current = filtro;
  }, [filtro]);

  // Petición HTTP inicial por filtro
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await tokenStorage.getToken();
      if (!token) {
        setError("No se encontró una sesión activa.");
        return;
      }

      const data = await orderService.getClientHistory(token, filtro);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  // Manejo del ciclo de vida del WebSocket
  useEffect(() => {
    const initWebSocketRealTime = async () => {
      const token = await tokenStorage.getToken();
      if (!token) return;

      // Extraemos el payload del JWT
      const parsedToken = JSON.parse(atob(token.split(".")[1]));
      const userId = parsedToken.id;

      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          forceNew: true, // Forzar una nueva instancia limpia de la conexión
          upgrade: false,
        });

        socketRef.current.on("connect", () => {
          console.log("🔌 Conectado al sistema de WebSockets desde la App");
          // Unirse al cuarto privado del usuario
          socketRef.current?.emit("join_room", userId.toString());
        });

        // Escuchar la mutación de estatus enviada por tus controladores del backend
        socketRef.current.on(
          "order_status_updated",
          (data: RealTimeNotification) => {
            // 1. Disparar la alerta visual en la parte superior
            setNotification(data);

            // 2. Filtrar dinámicamente el listado en tiempo real 🚀
            setOrders((currentOrders) => {
              // Si el nuevo estado que mandó el backend NO coincide con el chip actual,
              // removemos la orden del listado visual inmediatamente.
              if (filtroRef.current !== data.status) {
                return currentOrders.filter(
                  (order) => order.id !== data.orderId,
                );
              }

              // Si coincide, actualizamos el registro de forma reactiva
              return currentOrders.map((order) => {
                if (order.id === data.orderId) {
                  return { ...order, status: data.status };
                }
                return order;
              });
            });
          },
        );
      }
    };

    initWebSocketRealTime();

    // Cleanup: Desconectar el socket cuando el componente se desmonte
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Limpiar notificación manualmente o por temporizador
  const clearNotification = () => setNotification(null);

  return {
    orders,
    filtro,
    setFiltro,
    loading,
    error,
    notification,
    clearNotification,
    refetch: fetchOrders,
  };
};
