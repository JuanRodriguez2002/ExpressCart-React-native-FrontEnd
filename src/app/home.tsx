import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/common/Header";

// Datos estáticos de prueba para las tarjetas de supermercados
const SUPERMERCADOS_RECIENTES = [
  {
    id: "1",
    nombre: "Supermercado Central",
    sucursal: "Constanza Centro",
    fecha: "Ayer",
  },
  {
    id: "2",
    nombre: "Hipermercado Nacional",
    sucursal: "Plaza Bella Vista",
    fecha: "Hace 3 días",
  },
  {
    id: "3",
    nombre: "Gran Agro Feria",
    sucursal: "Salida de la Ciudad",
    fecha: "Hace 1 semana",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Render para cada tarjeta de supermercado
  const renderItem = ({
    item,
  }: {
    item: (typeof SUPERMERCADOS_RECIENTES)[0];
  }) => (
    <View style={styles.card}>
      <View style={styles.cardIconContainer}>
        <Text style={styles.cardIcon}>🛒</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardNombre}>{item.nombre}</Text>
        <Text style={styles.cardSucursal}>{item.sucursal}</Text>
        <Text style={styles.cardFecha}>Última visita: {item.fecha}</Text>
      </View>
      <TouchableOpacity style={styles.cardButton}>
        <Text style={styles.cardButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Hola, Juan Rodríguez!</Text>
          <Text style={styles.welcomeSubtitle}>
            ¿Qué supermercado visitaremos hoy?
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Últimos supermercados visitados</Text>

        {/* Usamos FlatList de manera estática para renderizar las tarjetas de forma óptima */}
        <FlatList
          data={SUPERMERCADOS_RECIENTES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Desactivado porque el scroll general lo maneja el ScrollView
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 40, // Espaciado para la notch/barra de estado del celular
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E2E8E5",
  },
  menuButton: {
    width: 30,
    height: 24,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  burgerLine: {
    width: 22,
    height: 3,
    backgroundColor: "#004B32", // Verde oscuro corporativo
    borderRadius: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004B32",
  },
  userBadge: {
    backgroundColor: "#00C252", // Verde brillante del logo
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  userBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  mainContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004B32",
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#6A7C75",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#004B32",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconContainer: {
    backgroundColor: "#F4F7F5",
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 24,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
  },
  cardSucursal: {
    fontSize: 13,
    color: "#6A7C75",
    marginTop: 2,
  },
  cardFecha: {
    fontSize: 11,
    color: "#A0AAB2",
    marginTop: 4,
  },
  cardButton: {
    backgroundColor: "#004B32",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cardButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  /* --- ESTILOS DEL MENÚ LATERAL (MENU HAMBURGUESA UI) --- */
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 75, 50, 0.3)", // Fondo oscuro con verde transparente
    flexDirection: "row",
    zIndex: 999,
  },
  closeOverlayArea: {
    flex: 1,
  },
  sidebar: {
    width: 280,
    backgroundColor: "#FFFFFF",
    height: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#E2E8E5",
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004B32",
  },
  closeText: {
    fontSize: 22,
    color: "#6A7C75",
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 24,
    textAlign: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#004B32",
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#E2E8E5",
    marginVertical: 15,
  },
});
