import FormAlerts from "@/components/UI/FormAlerts";
import { favoriteService } from "@/services/favoriteService"; // 👈 Importamos el servicio de favoritos
import { tokenStorage } from "@/utils/storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/common/Header";
import { authService, UserProfile } from "../services/authService";
import {
  Supermarket,
  supermarketService,
} from "../services/supermarketService";

export default function HomeScreen() {
  const router = useRouter();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favoritesIds, setFavoritesIds] = useState<string[]>([]); // Estado para rastrear los IDs favoritos
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessages([]);
      const token = await tokenStorage.getToken();

      if (!token) {
        throw new Error(
          "No se encontró una sesión activa. Por favor, inicia sesión.",
        );
      }

      const [supermarketData, userData, favoritesData] = await Promise.all([
        supermarketService.getAll(),
        authService.getUserProfile(token),
        favoriteService.getFavorites(token).catch(() => []),
      ]);

      setSupermarkets(supermarketData);
      setUser(userData);

      if (Array.isArray(favoritesData)) {
        setFavoritesIds(favoritesData.map((fav: any) => fav.id.toString()));
      }
    } catch (error: any) {
      setErrorMessages([
        error.message || "No se pudieron cargar los datos del dashboard.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const toggleFavorite = async (supermarketId: string) => {
    try {
      const token = await tokenStorage.getToken();
      if (!token) return Alert.alert("Error", "Tu sesión ha expirado.");

      const isFav = favoritesIds.includes(supermarketId);

      if (isFav) {
        setFavoritesIds((prev) => prev.filter((id) => id !== supermarketId));
        await favoriteService.deleteFavorite(token, supermarketId);
      } else {
        setFavoritesIds((prev) => [...prev, supermarketId]);
        await favoriteService.addFavorite(token, supermarketId);
      }
    } catch (error: any) {
      console.error("Error al modificar favoritos:", error);
      Alert.alert("Error", "No se pudo actualizar tu lista de favoritos.");
      loadDashboardData();
    }
  };

  // Render para cada tarjeta de supermercado
  const renderItem = ({ item }: { item: Supermarket }) => {
    const isFavorite = favoritesIds.includes(item.id.toString());

    return (
      <View style={styles.supermarketHeader}>
        {/* Columna 1: Icono del establecimiento */}
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>🏢</Text>
        </View>

        {/* Columna 2: Contenedor con la información textual */}
        <View style={styles.cardContent}>
          <Text style={styles.cardNombre} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardSucursal} numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        {/* Columna 3: Botón interactivo de Guardados (Centrado y al mismo alto que "Entrar") */}
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id.toString())}
          hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
          style={[
            styles.bookmarkButton,
            isFavorite ? styles.bookmarkFilled : styles.bookmarkEmpty,
          ]}
        >
          <Text style={styles.bookmarkText}>🔖</Text>
        </TouchableOpacity>

        {/* Columna 4: Botón de acción principal */}
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() =>
            router.push({
              pathname: "/categories",
              params: { id: item.id },
            })
          }
        >
          <Text style={styles.cardButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const nombreCompleto = user ? `${user.name}`.trim() : "Usuario";

  return (
    <View style={styles.container}>
      <Header userName={nombreCompleto} />

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Hola, {nombreCompleto}!</Text>
          <Text style={styles.welcomeSubtitle}>
            ¿Qué supermercado visitaremos hoy?
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Nuestros SuperMercados</Text>
        <FormAlerts errors={errorMessages} success={null} />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#004B32" />
            <Text style={styles.loaderText}>Buscando establecimientos...</Text>
          </View>
        ) : (
          <FlatList
            data={supermarkets}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              errorMessages.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay supermercados registrados en este momento.
                </Text>
              ) : null
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
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
  supermarketHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 0,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#00C252", // El verde brillante distintivo de ExpressCart
  },
  cardIconContainer: {
    backgroundColor: "#F4F7F5",
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
    justifyContent: "center",
  },
  cardNombre: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#004B32",
    marginBottom: 2,
  },
  cardSucursal: {
    fontSize: 12,
    color: "#6A7C75",
  },
  // 📌 NUEVO BOTÓN DE GUARDADOS EQUILIBRADO Y ALINEADO CON EL BOTÓN "ENTRAR"
  bookmarkButton: {
    height: 34, // Altura idéntica calculada sumando paddings + texto del botón "Entrar"
    width: 34, // Cuadrado perfecto para equilibrar la simetría lateral
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#004B32",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8, // Separación ordenada respecto al botón de "Entrar"
  },
  bookmarkEmpty: {
    backgroundColor: "#FFFFFF",
  },
  bookmarkFilled: {
    backgroundColor: "#004B32",
  },
  bookmarkText: {
    fontSize: 14,
    textAlign: "center",
  },
  cardButton: {
    backgroundColor: "#004B32",
    height: 34, // Forzamos altura explícita para garantizar la simetría perfecta con el Bookmark
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  loaderContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  loaderText: {
    marginTop: 10,
    color: "#6A7C75",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#6A7C75",
    marginTop: 20,
    fontSize: 14,
  },
});
