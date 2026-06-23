import { useAuthUser } from "@/hooks/useAuthUser";
import { useClientOrders } from "@/hooks/useClientOrders";
import { OrderBackendResponse, OrderStatus } from "@/services/orderService";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/common/Header";

const { width } = Dimensions.get("window");

// ==========================================
//        CONFIGURACIÓN DE UI POR ESTADO
// ==========================================
const CONFIG_ESTADOS: Record<OrderStatus, { label: string; color: string }> = {
  activa: { label: "Activa", color: "#00C252" },
  "en proceso": { label: "En Proceso", color: "#FFC107" },
  "en camino": { label: "En Camino", color: "#FD7E14" },
  completada: { label: "Completada", color: "#007BFF" },
  cancelada: { label: "Cancelada", color: "#DC3545" },
};

const FILTROS_DISPONIBLES: OrderStatus[] = [
  "activa",
  "en proceso",
  "en camino",
  "completada",
  "cancelada",
];

export default function OrdersHistoryScreen() {
  const { userName } = useAuthUser();
  // ==========================================
  //            LÓGICA Y WEBSOCKETS
  // ==========================================
  const {
    orders,
    filtro,
    setFiltro,
    loading,
    error,
    notification,
    clearNotification,
    refetch,
  } = useClientOrders();

  // Temporizador para auto-ocultar la barra del websocket tras 6 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const formatBackendDate = (dateString: string) => {
    const fechaObj = new Date(dateString);
    const fecha = fechaObj.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const hora = fechaObj.toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { fecha, hora };
  };

  // ==========================================
  //          RENDERIZADO DE COMPONENTES
  // ==========================================
  const renderCompraCard = ({ item }: { item: OrderBackendResponse }) => {
    const { fecha, hora } = formatBackendDate(item.createdAt);
    const estadoInfo = CONFIG_ESTADOS[item.status] || {
      label: item.status,
      color: "#6A7C75",
    };
    const nombreSupermercado =
      item.supermarket?.name || "Supermercado Vinculado";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          alert(
            `Detalles de la orden #${item.id}\nStatus actual: ${estadoInfo.label}`,
          )
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.supermercadoText}>{nombreSupermercado}</Text>
          <View style={styles.estadoContainer}>
            <View style={[styles.dot, { backgroundColor: estadoInfo.color }]} />
            <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
              {estadoInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.infoText}>📦 Pedido: #{item.id}</Text>
          <Text style={styles.infoText}>📅 Fecha: {fecha}</Text>
          <Text style={styles.infoText}>⏰ Hora: {hora}</Text>
          <Text style={styles.totalText}>
            💰 Total: RD$ {parseFloat(item.total).toFixed(2)}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.verDetalleText}>
            Ver productos ({item.products?.length || 0}) →
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header titulo="Mis Compras" userName={userName} />

      {/* --- BARRA FLOTANTE DE NOTIFICACIÓN EN TIEMPO REAL (WEBSOCKET BANNER) --- */}
      {notification && (
        <TouchableOpacity
          style={[
            styles.websocketToast,
            {
              borderColor:
                CONFIG_ESTADOS[notification.status]?.color || "#004B32",
            },
          ]}
          onPress={clearNotification}
        >
          <View
            style={[
              styles.toastIndicator,
              { backgroundColor: CONFIG_ESTADOS[notification.status]?.color },
            ]}
          />
          <View style={styles.toastBody}>
            <Text style={styles.toastTitle}>
              Pedido #{notification.orderId} • ¡Estado Actualizado!
            </Text>
            <Text style={styles.toastMessage}>{notification.message}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* --- SECCIÓN DE FILTROS MÓVILES --- */}
      <View style={styles.filterWrapper}>
        <FlatList
          data={FILTROS_DISPONIBLES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(tipo) => tipo}
          contentContainerStyle={styles.filterContainer}
          renderItem={({ item: tipo }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filtro === tipo && styles.filterChipActive,
              ]}
              onPress={() => setFiltro(tipo)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filtro === tipo && styles.filterChipTextActive,
                ]}
              >
                {CONFIG_ESTADOS[tipo].label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* --- LISTADO PRINCIPAL --- */}
      {error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && loading && orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#004B32" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderCompraCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={["#004B32"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No tienes compras en este estado actualmente.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  /* ESTILOS DE LA NUEVA BARRA WEBSOCKET */
  websocketToast: {
    position: "absolute",
    top: 90, // Despliega justo debajo del Header
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
    borderWidth: 1,
    overflow: "hidden",
  },
  toastIndicator: {
    width: 6,
    height: "100%",
  },
  toastBody: {
    padding: 12,
    flex: 1,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#004B32",
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 12,
    color: "#4A5A54",
    lineHeight: 16,
  },
  /* ESTILOS PREVIOS MANTENIDOS */
  filterWrapper: {
    maxHeight: 60,
    marginTop: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  filterChipActive: {
    backgroundColor: "#004B32",
    borderColor: "#004B32",
  },
  filterChipText: {
    fontSize: 13,
    color: "#6A7C75",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#F4F7F5",
    paddingBottom: 10,
    marginBottom: 10,
  },
  supermercadoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
    flex: 1,
    marginRight: 8,
  },
  estadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardBody: {
    gap: 4,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#6A7C75",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#004B32",
    marginTop: 2,
  },
  cardFooter: {
    alignItems: "flex-end",
  },
  verDetalleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00C252",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#DC3545",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#004B32",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#6A7C75",
    fontSize: 15,
    textAlign: "center",
  },
});
