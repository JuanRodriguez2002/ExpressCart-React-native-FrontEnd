import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Header from "../components/common/Header";

export default function SupermarketsScreen() {
  // --- DATOS ESTÁTICOS DE SUPERMERCADOS FAVORITOS ---
  // El logo se maneja temporalmente con el emoji del carrito 🛒 o la tienda 🏢
  const [supermercados] = useState([
    {
      id: "1",
      nombre: "Supermercado Nacional",
      direccion: "Av. Antonio Duvergé, Constanza",
      ultimaVisita: "Ayer, 4:30 PM",
      logo: "🛒",
    },
    {
      id: "2",
      nombre: "Super Pola",
      direccion: "Calle Principal #45, Centro Ciudad",
      ultimaVisita: "Hace 3 días",
      logo: "🏢",
    },
    {
      id: "3",
      nombre: "Almacenes Iberia",
      direccion: "Carretera San José de Ocoa, Km 2",
      ultimaVisita: "15 May 2026",
      logo: "🛒",
    },
    {
      id: "4",
      nombre: "Supermercado La Fuente",
      direccion: "Residencial Las Flores, Constanza",
      ultimaVisita: "22 Abr 2026",
      logo: "🏢",
    },
  ]);

  return (
    <View style={styles.container}>
      {/* Mantenemos tu Header global intacto */}
      <Header titulo="Mis Tiendas" />

      {/* Contenedor escroleable para las tarjetas */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>⭐ Tus Favoritos Guardados</Text>
          <Text style={styles.sectionSubtitle}>
            Accede rápidamente a los comercios donde realizas tus compras
            frecuentes.
          </Text>
        </View>

        {supermercados.map((tiendo) => (
          <TouchableOpacity
            key={tiendo.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => alert(`Abriendo catálogo de: ${tiendo.nombre}`)}
          >
            {/* Contenedor del Logo / Icono temporal */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>{tiendo.logo}</Text>
            </View>

            {/* Información del Supermercado */}
            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.superName} numberOfLines={1}>
                  {tiendo.nombre}
                </Text>
                {/* Estrella indicadora de Favorito */}
                <Text style={styles.starIcon}>⭐</Text>
              </View>

              <Text style={styles.superAddress} numberOfLines={1}>
                📍 {tiendo.direccion}
              </Text>

              <Text style={styles.superVisit}>
                🕒 Última visita:{" "}
                <Text style={styles.visitHighlight}>{tiendo.ultimaVisita}</Text>
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5", // Gris-verde claro de fondo
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionTitleContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004B32", // Verde oscuro oficial
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6A7C75",
    marginTop: 4,
    lineHeight: 18,
  },
  /* --- ESTILOS DE LAS CARDS (Idénticas al Dashboard) --- */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    // Sombra sutil
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: "#F4F7F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8E5",
  },
  logoText: {
    fontSize: 26,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  superName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
    flex: 1,
    marginRight: 8,
  },
  starIcon: {
    fontSize: 16,
  },
  superAddress: {
    fontSize: 13,
    color: "#6A7C75",
    marginBottom: 6,
  },
  superVisit: {
    fontSize: 12,
    color: "#90A49C",
  },
  visitHighlight: {
    color: "#004B32",
    fontWeight: "500",
  },
});
