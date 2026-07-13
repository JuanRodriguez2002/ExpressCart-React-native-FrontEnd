// src/app/supermarkets.tsx
import Header from "@/components/common/Header";
import { useAuthUser } from "@/hooks/useAuthUser";
import { favoriteService } from "@/services/favoriteService";
import { tokenStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
//                 INTERFACES
// ==========================================
interface SupermercadoBD {
  id: string;
  name: string;
  address: string;
  logo?: string;
}

export default function SupermarketsScreen() {
  const { userName } = useAuthUser();
  const [supermercados, setSupermercados] = useState<SupermercadoBD[]>([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  //          EFECTO: CARGA INICIAL
  // ==========================================
  useEffect(() => {
    const loadFavoritesData = async () => {
      try {
        const token = await tokenStorage.getToken();
        if (!token) return;

        const favoritesData = await favoriteService.getFavorites(token);

        // Mapear la estructura exacta que retorna el modelo de Sequelize
        if (favoritesData && Array.isArray(favoritesData)) {
          setSupermercados(
            favoritesData.map((tienda: any) => ({
              id: tienda.id.toString(),
              name: tienda.name,
              address: tienda.address || "Dirección no disponible",
              logo: tienda.logo,
            })),
          );
        }
      } catch (error) {
        console.error("Error al cargar supermercados favoritos:", error);
        Alert.alert(
          "Error",
          "Ocurrió un error al sincronizar tus tiendas favoritas.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavoritesData();
  }, []);

  // ==========================================
  //          LÓGICA - ELIMINAR FAVORITO
  // ==========================================
  const handleDeleteFavorite = async (id: string, name: string) => {
    Alert.alert(
      "⚠️ Quitar de Favoritos",
      `¿Estás seguro de que deseas eliminar a "${name}" de tus tiendas favoritas?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await tokenStorage.getToken();
              if (!token) return Alert.alert("Error", "Tu sesión ha expirado.");

              await favoriteService.deleteFavorite(token, id);

              // Actualización optimista del estado local
              setSupermercados((prev) =>
                prev.filter((tienda) => tienda.id !== id),
              );
              Alert.alert("Éxito", "Tienda eliminada de tus favoritos.");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "No se pudo eliminar de favoritos.",
              );
            }
          },
        },
      ],
    );
  };

  // ==========================================
  //                RENDER UI
  // ==========================================
  return (
    <View style={styles.container}>
      {/* Sincronizado con tu hook useAuthUser */}
      <Header titulo="Mis Tiendas" userName={userName} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>⭐ Tus Favoritos Guardados</Text>
          <Text style={styles.sectionSubtitle}>
            Accede rápidamente a los comercios donde realizas tus compras
            frecuentes.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#004B32"
            style={{ marginTop: 40 }}
          />
        ) : supermercados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No tienes supermercados guardados en tus favoritos.
            </Text>
          </View>
        ) : (
          supermercados.map((tienda) => (
            <TouchableOpacity
              key={tienda.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert("Catálogo", `Abriendo catálogo de: ${tienda.name}`)
              }
            >
              {/* Contenedor del Logo con fallback */}
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>{tienda.logo ? "🛒" : "🏢"}</Text>
              </View>

              {/* Información del Supermercado */}
              <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.superName} numberOfLines={1}>
                    {tienda.name}
                  </Text>

                  {/* Icono de estrella aislado e interactivo para remover */}
                  <TouchableOpacity
                    onPress={() => handleDeleteFavorite(tienda.id, tienda.name)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.starIcon}>⭐</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.superAddress} numberOfLines={1}>
                  📍 {tienda.address}
                </Text>

                <Text style={styles.superVisit}>
                  🕒 Estado:{" "}
                  <Text style={styles.visitHighlight}>Tienda Vinculada</Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ==========================================
//                ESTILOS UI
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
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
    color: "#004B32",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6A7C75",
    marginTop: 4,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#6A7C75",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8E5",
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
    fontSize: 18,
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
