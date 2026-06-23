// src/app/products.tsx
import FormAlerts from "@/components/UI/FormAlerts";
import { useCart } from "@/context/CartContext";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useProducts } from "@/hooks/useProducts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/common/Header";

export default function ProductsScreen() {
  const router = useRouter();
  const { categoryId, supermarketId } = useLocalSearchParams<{
    categoryId: string;
    supermarketId: string;
  }>();

  const { cart } = useCart();
  const { userName } = useAuthUser();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const {
    products,
    supermarketName,
    loading,
    errorMessages,
    expandedProductId,
    quantities,
    animValue,
    toggleExpand,
    updateQuantity,
    handleAddToCart,
  } = useProducts(supermarketId, categoryId);

  const cartBackgroundColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F4F7F5", "#00C252"],
  });

  const cartBorderColor = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E2E8E5", "#00C252"],
  });

  const cartScale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1.1],
  });

  return (
    <View style={styles.container}>
      <Header userName={userName} />

      <View style={styles.supermarketBanner}>
        <View style={styles.supermarketInfo}>
          <Text style={styles.bannerLogo}>🏢</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle} numberOfLines={2}>
              {supermarketName}
            </Text>
            <Text style={styles.bannerSubtitle}>Pasillo de Productos</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.cartAnimatedWrapper,
            {
              backgroundColor: cartBackgroundColor,
              borderColor: cartBorderColor,
              transform: [{ scale: cartScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cartInternalButton}
            activeOpacity={0.8}
            onPress={() => router.push("/cart")}
          >
            <Text style={styles.cartBadgeIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badgeCountContainer}>
                <Text style={styles.badgeCountText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.listContainer}>
        <FormAlerts errors={errorMessages} success={null} />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#004B32" />
            <Text style={styles.loaderText}>Abasteciendo estanterías...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.scrollList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCardItem
                item={item}
                isExpanded={expandedProductId === item.id.toString()}
                currentQty={
                  quantities[item.id] || (item.unitType === "lb" ? 0.25 : 1)
                }
                onToggleExpand={() => toggleExpand(item.id.toString())}
                onUpdateQuantity={(type: "increment" | "decrement") => {
                  const maxStock = Number(item.stock) || 0;
                  const nextQty =
                    quantities[item.id] || (item.unitType === "lb" ? 0.25 : 1);

                  // 🛡️ Evitar incrementos si ya igualó o superó el stock real decimal de la API
                  if (type === "increment" && nextQty >= maxStock) {
                    return;
                  }

                  // Delegar cambio adaptativo al hook nativo
                  updateQuantity(item.id, type);
                }}
                onAddToCart={() => handleAddToCart(item)}
              />
            )}
            ListEmptyComponent={
              !loading && errorMessages.length === 0 ? (
                <Text style={styles.emptyText}>
                  No hay productos en este pasillo actualmente.
                </Text>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}

function ProductCardItem({
  item,
  isExpanded,
  currentQty,
  onToggleExpand,
  onUpdateQuantity,
  onAddToCart,
}: any) {
  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  // Leemos de forma estricta la unidad de medida que viene desde la Base de Datos
  const unitType = item.unitType || "ud";

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const contentOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const contentHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 155],
  });

  const numericPrice = Number(item.price) || 0;
  const maxStock = Number(item.stock) || 0;
  const isOutOfStock = maxStock <= 0;
  const hasReachedMax = currentQty >= maxStock;

  // Renderizador dinámico del texto del input (Números enteros para ud, flotantes limpios para lb)
  const renderQtyText = () => {
    if (unitType === "lb") {
      return `${currentQty.toFixed(2)} lb`;
    }
    return `${Math.floor(currentQty)} ud`;
  };

  return (
    <View
      style={[
        styles.productCard,
        isExpanded && styles.productCardExpanded,
        isOutOfStock && styles.productCardDisabled,
      ]}
    >
      <TouchableOpacity
        style={styles.cardHeaderArea}
        activeOpacity={isOutOfStock ? 1 : 0.8}
        onPress={isOutOfStock ? undefined : onToggleExpand}
      >
        <View style={styles.imageWrapper}>
          <Text style={styles.productEmoji}>{item.image || "📦"}</Text>
        </View>
        <View style={styles.basicInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>
            RD$ {numericPrice.toFixed(2)} / {unitType}
          </Text>
        </View>
        {isOutOfStock ? (
          <Text style={styles.stockLabelEmpty}>Agotado ⚠️</Text>
        ) : (
          <Text style={styles.arrowIcon}>{isExpanded ? "▲" : "▼"}</Text>
        )}
      </TouchableOpacity>

      <Animated.View
        style={{
          height: contentHeight,
          opacity: contentOpacity,
          overflow: "hidden",
        }}
      >
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* --- FILA 1: DESCRIPCIÓN COMPLETA --- */}
          <View style={styles.descriptionRow}>
            <Text style={styles.descriptionText}>
              {item.description || "Sin descripción disponible."}
            </Text>
          </View>

          {/* --- FILA 2: STOCK, CONTADOR ADAPTATIVO Y TIPO DE CANTIDAD --- */}
          <View style={styles.controlsRow}>
            <Text style={styles.stockLabelIndicator}>
              Disp:{" "}
              <Text style={{ fontWeight: "700" }}>
                {maxStock} {unitType}
              </Text>
            </Text>

            <View style={styles.controlsRightGroup}>
              {/* Contador de cantidad ergonómico */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => onUpdateQuantity("decrement")}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <View style={styles.qtyInputView}>
                  <Text style={styles.qtyInputText}>{renderQtyText()}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.qtyButton,
                    hasReachedMax && styles.qtyButtonDisabled,
                  ]}
                  onPress={() => onUpdateQuantity("increment")}
                  disabled={hasReachedMax}
                >
                  <Text
                    style={[
                      styles.qtyButtonText,
                      hasReachedMax && styles.qtyButtonTextDisabled,
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Selector de unidad bloqueado de acuerdo al tipo de producto real */}
              <View style={styles.unitToggleContainer}>
                <View
                  style={[
                    styles.unitToggleTab,
                    unitType === "ud" && styles.unitToggleTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitToggleText,
                      unitType === "ud" && styles.unitToggleTextActive,
                    ]}
                  >
                    ud
                  </Text>
                </View>
                <View
                  style={[
                    styles.unitToggleTab,
                    unitType === "lb" && styles.unitToggleTabActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.unitToggleText,
                      unitType === "lb" && styles.unitToggleTextActive,
                    ]}
                  >
                    lb
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* --- FILA 3: BOTÓN DE AGREGAR EN ANCHO COMPLETO --- */}
          <View style={styles.actionButtonGroupVertical}>
            <TouchableOpacity
              style={styles.addToCartButton}
              activeOpacity={0.7}
              onPress={onAddToCart}
            >
              <Text style={styles.addToCartText}>Agregar al Carrito 🛒</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  supermarketBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  supermarketInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 24,
  },
  bannerLogo: { fontSize: 22, marginRight: 12 },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
  },
  bannerSubtitle: { fontSize: 12, color: "#6A7C75", marginTop: 1 },
  cartAnimatedWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartInternalButton: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeIcon: { fontSize: 20 },
  badgeCountContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#dc3545",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeCountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "bold" },
  listContainer: { flex: 1, paddingHorizontal: 16, marginTop: 16 },
  scrollList: { paddingBottom: 24 },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#E2E8E5",
  },
  productCardExpanded: { borderColor: "#00C252" },
  productCardDisabled: {
    opacity: 0.6,
    backgroundColor: "#EFEFEF",
    borderColor: "#D0D0D0",
  },
  cardHeaderArea: { flexDirection: "row", alignItems: "center" },
  imageWrapper: {
    backgroundColor: "#F4F7F5",
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  productEmoji: { fontSize: 24 },
  basicInfo: { flex: 1 },
  productPrice: {
    fontSize: 13,
    color: "#00C252",
    fontWeight: "600",
    marginTop: 2,
  },
  productName: { fontSize: 15, fontWeight: "bold", color: "#004B32" },
  arrowIcon: { fontSize: 12, color: "#6A7C75", paddingLeft: 10 },
  stockLabelEmpty: { fontSize: 12, color: "#dc3545", fontWeight: "700" },
  expandedContent: { paddingTop: 2 },
  divider: { height: 1, backgroundColor: "#E2E8E5", marginBottom: 10 },

  descriptionRow: {
    width: "100%",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  descriptionText: {
    fontSize: 13,
    color: "#6A7C75",
    lineHeight: 17,
  },

  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  stockLabelIndicator: {
    fontSize: 12,
    color: "#6A7C75",
  },
  controlsRightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    height: 38,
  },
  qtyButton: {
    width: 40,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonDisabled: {
    backgroundColor: "#EAEAEA",
  },
  qtyButtonText: { fontSize: 20, fontWeight: "bold", color: "#004B32" },
  qtyButtonTextDisabled: { color: "#A0A0A0" },
  qtyInputView: {
    paddingHorizontal: 6, // Relleno interno menor para arrimar los botones
    minWidth: 54, // Ancho ajustado ideal para albergar "0.00 lb" de forma compacta
    alignItems: "center",
    justifyContent: "center",
  },
  qtyInputText: {
    fontSize: 12.5, // Tipografía ligeramente menor para que quepa bien sin ocupar espacio extra
    fontWeight: "bold",
    color: "#004B32",
  },
  unitToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E8ECE9",
    borderRadius: 8,
    padding: 2,
    marginLeft: 8,
    height: 38,
    alignItems: "center",
  },
  unitToggleTab: {
    paddingHorizontal: 10,
    height: "100%",
    justifyContent: "center",
    borderRadius: 6,
  },
  unitToggleTabActive: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  unitToggleText: {
    fontSize: 12,
    color: "#A0A0A0", // Color tenue para la opción inactiva deshabilitada
    fontWeight: "600",
  },
  unitToggleTextActive: {
    color: "#004B32",
    fontWeight: "bold",
  },

  actionButtonGroupVertical: {
    flexDirection: "row",
    alignItems: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#004B32",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

  loaderContainer: { alignItems: "center", marginTop: 40 },
  loaderText: { marginTop: 10, color: "#6A7C75", fontSize: 14 },
  emptyText: {
    textAlign: "center",
    color: "#6A7C75",
    marginTop: 20,
    fontSize: 14,
  },
});
