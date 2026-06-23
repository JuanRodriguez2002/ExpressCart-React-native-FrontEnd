import FormAlerts from "@/components/UI/FormAlerts";
import { CategoriaUI, useCategories } from "@/hooks/useCategories";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/common/Header";

export default function CategoriesScreen() {
  const router = useRouter();

  // 🎯 Capturamos el ID del supermercado enviado desde la pantalla anterior
  const { id: supermarketId } = useLocalSearchParams<{ id: string }>();
  const { supermarket, categories, user, loading, errorMessages } =
    useCategories(supermarketId);

  //   const [supermarketName, setSupermarketName] = useState<string>("Cargando...");
  //   const [supermarketAddress, setSupermarketAddress] = useState<string>("");
  //   const [user, setUser] = useState<UserProfile | null>(null);
  //   const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  //   const [loading, setLoading] = useState<boolean>(true);
  //   const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Render para cada tarjeta de categoría (Botón Completo)
  const renderCategoryCard = ({ item }: { item: CategoriaUI }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      activeOpacity={0.7}
      onPress={() => {
        // Redirige a la pantalla de productos pasando el ID de la categoría y el del supermercado
        router.push({
          pathname: "/products",
          params: { categoryId: item.id, supermarketId: supermarketId },
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Text style={styles.categoryEmoji}>{item.imagenIlustrativa}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.categoryTitle} numberOfLines={2}>
          {item.titulo}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const nombreCompleto = user ? `${user.name}`.trim() : "Usuario";
  const supermarketName = supermarket ? supermarket.name : "Cargando...";
  const supermarketAddress = supermarket?.address || "Sucursal Local";
  return (
    <View style={styles.container}>
      {/* Mantenemos el Header global con el menú lateral */}
      <Header userName={nombreCompleto} />

      {/* --- BANNER SUPERIOR DEL SUPERMERCADO SELECCIONADO --- */}
      <View style={styles.supermarketHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏢</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.supermarketTitle}>{supermarketName}</Text>
          {supermarketAddress ? (
            <Text style={styles.supermarketLocation}>
              📍 {supermarketAddress}
            </Text>
          ) : null}
        </View>
      </View>

      {/* --- SECCIÓN DE CATEGORÍAS (CATÁLOGO) --- */}
      <View style={styles.catalogContainer}>
        <Text style={styles.sectionTitle}>Categorías de Productos</Text>
        <FormAlerts errors={errorMessages} success={null} />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#004B32" />
            <Text style={styles.loaderText}>Cargando pasillos...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            numColumns={2} // Disposición en rejilla de dos columnas como tarjetas completas
            columnWrapperStyle={styles.rowWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              !loading && errorMessages.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay categorías disponibles en este supermercado.
                </Text>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  /* --- ESTILOS DEL BANNER DEL SUPERMERCADO --- */
  supermarketHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#00C252", // El verde brillante distintivo de ExpressCart
  },
  logoContainer: {
    backgroundColor: "#F4F7F5",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  logoIcon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  supermarketTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004B32",
  },
  supermarketLocation: {
    fontSize: 13,
    color: "#6A7C75",
    marginTop: 2,
  },
  /* --- CONTENEDOR DEL CATÁLOGO --- */
  catalogContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#004B32",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 24,
  },
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  /* --- TARJETAS COMPLETAS COMO BOTONES --- */
  categoryCard: {
    backgroundColor: "#FFFFFF",
    width: "48.5%", // Asegura una distribución perfecta con espacio en el centro
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8E5",
  },
  imageContainer: {
    backgroundColor: "#F4F7F5",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 34,
  },
  cardInfo: {
    alignItems: "center",
    width: "100%",
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#004B32",
    textAlign: "center",
  },
  categorySubtitle: {
    fontSize: 11,
    color: "#A0AAB2",
    marginTop: 4,
  },
  /* --- LOADER --- */
  loaderContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  loaderText: {
    marginTop: 10,
    color: "#6A7C75",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6A7C75",
    fontSize: 14,
  },
});
