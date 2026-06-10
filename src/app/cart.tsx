import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/common/Header";

// Tipos de estados disponibles
type EstadoCompra = "activas" | "entrega" | "canceladas" | "completadas";

const COMPRAS_PROTOTIPO = [
  {
    id: "1",
    supermercado: "Supermercado Central",
    fecha: "10 de Junio, 2026",
    hora: "4:30 PM",
    estado: "activas",
    colorDot: "#00C252", // Verde
    textoEstado: "Activa",
  },
  {
    id: "2",
    supermercado: "Hipermercado Nacional",
    fecha: "09 de Junio, 2026",
    hora: "11:15 AM",
    estado: "entrega",
    colorDot: "#FFC107", // Amarillo
    textoEstado: "En proceso de entrega",
  },
  {
    id: "3",
    supermercado: "Gran Agro Feria",
    fecha: "05 de Junio, 2026",
    hora: "9:00 AM",
    estado: "canceladas",
    colorDot: "#DC3545", // Rojo
    textoEstado: "Cancelada",
  },
  {
    id: "4",
    supermercado: "Supermercado Central",
    fecha: "01 de Junio, 2026",
    hora: "6:45 PM",
    estado: "completadas",
    colorDot: "#007BFF", // Azul
    textoEstado: "Completada",
  },
];

export default function CartScreen() {
  // Filtro activo por defecto: 'activas'
  const [filtro, setFiltro] = useState<EstadoCompra>("activas");

  // Filtramos la lista según el chip seleccionado
  const comprasFiltradas = COMPRAS_PROTOTIPO.filter(
    (compra) => compra.estado === filtro,
  );

  const renderCompraCard = ({
    item,
  }: {
    item: (typeof COMPRAS_PROTOTIPO)[0];
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => alert(`Clickeaste la compra en ${item.supermercado}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.supermercadoText}>{item.supermercado}</Text>
        {/* Punto de estado dinámico */}
        <View style={styles.estadoContainer}>
          <View style={[styles.dot, { backgroundColor: item.colorDot }]} />
          <Text style={[styles.estadoText, { color: item.colorDot }]}>
            {item.textoEstado}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.infoText}>📅 Fecha: {item.fecha}</Text>
        <Text style={styles.infoText}>⏰ Hora: {item.hora}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.verDetalleText}>Ver lista de compras →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Componente Global Reutilizable */}
      <Header titulo="Mis Compras" />

      {/* --- SECCIÓN DE FILTROS (CHIPS/RADIO BUTTONS MÓVILES) --- */}
      <View style={styles.filterContainer}>
        {(
          ["activas", "entrega", "canceladas", "completadas"] as EstadoCompra[]
        ).map((tipo) => (
          <TouchableOpacity
            key={tipo}
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
              {tipo === "activas" && "Activas"}
              {tipo === "entrega" && "En Entrega"}
              {tipo === "canceladas" && "Canceladas"}
              {tipo === "completadas" && "Completadas"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- LISTADO DE TARJETAS --- */}
      <FlatList
        data={comprasFiltradas}
        renderItem={renderCompraCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes compras en esta categoría.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
    justifyContent: "center",
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
    backgroundColor: "#004B32", // Se activa con el verde oscuro corporativo
    borderColor: "#004B32",
  },
  filterChipText: {
    fontSize: 13,
    color: "#6A7C75",
    fontWeight: "500",
    textTransform: "capitalize",
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
  cardFooter: {
    alignItems: "flex-end",
  },
  verDetalleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00C252", // Verde brillante de acción
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#6A7C75",
    fontSize: 15,
  },
});
