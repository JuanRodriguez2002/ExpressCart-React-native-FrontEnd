// src/app/cart.tsx
import { CartItem, useCart } from "@/context/CartContext";
import { useAuthUser } from "@/hooks/useAuthUser";
import { orderService } from "@/services/orderService"; //
import { profileService } from "@/services/profileService";
import { tokenStorage } from "@/utils/storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/common/Header";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ==========================================
//               INTERFACES
// ==========================================
interface BackendAddress {
  id: number;
  fullAddress: string;
  references?: string;
  isDefault: boolean;
}

interface BackendPaymentMethod {
  id: number;
  provider: string;
  lastFourDigits?: string;
}

export default function CartScreen() {
  const router = useRouter();
  const { userName } = useAuthUser();

  // ==========================================
  //           ESTADOS DEL CONTEXTO
  // ==========================================
  const {
    cart,
    updateCartQuantityGlobal,
    getTotalPrice,
    removeFromCartGlobal,
  } = useCart();

  // ==========================================
  //          ESTADOS - ASINCRÓNICOS API
  // ==========================================
  const [addresses, setAddresses] = useState<BackendAddress[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<BackendPaymentMethod[]>(
    [],
  );
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // ==========================================
  //          ESTADOS - SELECCIÓN ACTIVA
  // ==========================================
  const [selectedAddress, setSelectedAddress] = useState<BackendAddress | null>(
    null,
  );
  const [selectedPayment, setSelectedPayment] =
    useState<BackendPaymentMethod | null>(null);

  // ==========================================
  //          ESTADOS - VISIBILIDAD UI
  // ==========================================
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [localQuantities, setLocalQuantities] = useState<{
    [key: string]: number;
  }>({});

  // ==========================================
  //          ESTADOS - ANIMACIÓN PANEL
  // ==========================================
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;

  // ==========================================
  //         EFECTO: CARGA INICIAL OPCIONES
  // ==========================================
  useEffect(() => {
    const fetchUserOptions = async () => {
      try {
        const token = await tokenStorage.getToken();
        if (!token) return;

        // Cargar en paralelo las opciones reales del perfil del usuario
        const [addressesData, paymentsData] = await Promise.all([
          profileService.getAddresses(token).catch(() => []),
          profileService.getPaymentMethods(token).catch(() => []),
        ]);

        setAddresses(addressesData);
        setPaymentMethods(paymentsData);

        // Pre-seleccionar las opciones principales por defecto si existen
        if (addressesData.length > 0) {
          const defaultAddr =
            addressesData.find((a: any) => a.isDefault) || addressesData[0];
          setSelectedAddress(defaultAddr);
        }
        if (paymentsData.length > 0) {
          setSelectedPayment(paymentsData[0]);
        }
      } catch (error) {
        console.error("Error al inicializar opciones de checkout:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserOptions();
  }, []);

  // ==========================================
  //         LÓGICA - INTERFAZ ANIMADA
  // ==========================================
  const togglePanel = (expand: boolean) => {
    setIsPanelExpanded(expand);
    Animated.spring(panelAnimation, {
      toValue: expand ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  };

  const panelHeight = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [90, SCREEN_HEIGHT * 0.65],
  });

  // ==========================================
  //         LÓGICA - GESTIÓN DEL CARRITO
  // ==========================================
  const toggleExpandItem = (item: CartItem) => {
    const idStr = item.id.toString();
    const isOpening = expandedItemId !== idStr;
    setExpandedItemId(isOpening ? idStr : null);

    if (isOpening) {
      setLocalQuantities((prev) => ({ ...prev, [idStr]: item.quantity }));
    }
  };

  const handleUpdateLocalQty = (
    idStr: string,
    maxStock: number,
    unitType: "ud" | "lb",
    type: "increment" | "decrement",
  ) => {
    const isLibra = unitType === "lb";
    const step = isLibra ? 0.25 : 1;
    const minQty = isLibra ? 0.25 : 1;
    const currentQty = localQuantities[idStr] ?? minQty;

    if (type === "increment") {
      if (currentQty >= maxStock) return;
      const nextQty = Number((currentQty + step).toFixed(2));
      setLocalQuantities({ ...localQuantities, [idStr]: nextQty });
    } else if (type === "decrement") {
      if (currentQty <= minQty) return;
      const nextQty = Number((currentQty - step).toFixed(2));
      setLocalQuantities({ ...localQuantities, [idStr]: nextQty });
    }
  };

  const handleConfirmEdit = (item: CartItem) => {
    const idStr = item.id.toString();
    const finalQty = localQuantities[idStr] ?? item.quantity;
    updateCartQuantityGlobal(item.id, finalQty);
    setExpandedItemId(null);
  };

  const handleDeleteItem = (item: CartItem) => {
    if (removeFromCartGlobal) {
      removeFromCartGlobal(item.id);
    } else {
      updateCartQuantityGlobal(item.id, 0);
    }
    setExpandedItemId(null);
  };

  const totalCompra = Number(getTotalPrice()).toFixed(2);

  // ==========================================
  //         LÓGICA - PROCESAR ORDEN API
  // ==========================================
  const handlePressCheckout = async () => {
    if (!isPanelExpanded) {
      togglePanel(true);
      return;
    }

    if (!selectedAddress) {
      return Alert.alert(
        "Falta información",
        "Por favor, selecciona una dirección de entrega.",
      );
    }
    if (!selectedPayment) {
      return Alert.alert(
        "Falta información",
        "Por favor, selecciona un método de pago.",
      );
    }
    if (!cart || cart.length === 0) {
      return Alert.alert("Carrito Vacío", "No hay productos para procesar.");
    }

    setIsSubmittingOrder(true);

    try {
      const token = await tokenStorage.getToken();
      if (!token) return alert("Sesión inválida.");

      // Formatear los productos tal como los espera tu enrutador en Express
      const formattedProducts = cart.map((item) => ({
        id: Number(item.id),
        quantity: item.quantity,
      }));

      const supermarketId = (cart[0] as any).supermarketId || 1;

      const payload = {
        supermarketId: Number(supermarketId),
        addressId: Number(selectedAddress.id),
        paymentMethodId: Number(selectedPayment.id),
        products: formattedProducts,
      };

      // Llamada directa usando nuestra capa limpia descentralizada
      const result = await orderService.checkoutOrder(token, payload);

      Alert.alert("¡Éxito! 🎉", result.message || "Pedido generado con éxito", [
        {
          text: "OK",
          onPress: () => {
            cart.forEach((item) => updateCartQuantityGlobal(item.id, 0));
            togglePanel(false);
            router.replace("/orders"); // O la ruta de historial correspondiente
          },
        },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error en el Pedido",
        error.message || "Hubo un error crítico al procesar tu pedido.",
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ==========================================
  //               RENDER UI
  // ==========================================
  return (
    <View style={styles.container}>
      <Header userName={userName} />

      <View style={styles.titleSection}>
        <Text style={styles.titleText}>Mi Carrito 🛒</Text>
        <Text style={styles.subtitleText}>
          Modifica o confirma tu lista de compras
        </Text>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.scrollList, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const maxStock = Number((item as any).stock) || 999;
            const unitType = (item as any).unitType || "ud";
            return (
              <CartCardItem
                item={item}
                isExpanded={expandedItemId === item.id.toString()}
                localQty={localQuantities[item.id.toString()] ?? item.quantity}
                onToggle={() => toggleExpandItem(item)}
                onUpdateLocalQty={(type: "increment" | "decrement") =>
                  handleUpdateLocalQty(
                    item.id.toString(),
                    maxStock,
                    unitType,
                    type,
                  )
                }
                onConfirm={() => handleConfirmEdit(item)}
                onDelete={() => handleDeleteItem(item)}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Volver al Pasillo</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* --- PANEL DE CHECKOUT INFERIOR --- */}
      {cart && cart.length > 0 && (
        <Animated.View style={[styles.customPanel, { height: panelHeight }]}>
          <TouchableOpacity
            style={styles.panelHandleArea}
            activeOpacity={0.8}
            onPress={() => togglePanel(!isPanelExpanded)}
          >
            <View style={styles.sheetHandle} />
          </TouchableOpacity>

          <View style={styles.sheetContent}>
            {!isPanelExpanded ? (
              // VISTA COLAPSADA
              <View style={styles.footerCollapsed}>
                <View>
                  <Text style={styles.footerLabel}>Total Estimado:</Text>
                  <Text style={styles.footerTotal}>RD$ {totalCompra}</Text>
                </View>
                <TouchableOpacity
                  style={styles.checkoutButton}
                  activeOpacity={0.8}
                  onPress={handlePressCheckout}
                >
                  <Text style={styles.checkoutText}>Enviar Pedido 🚀</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // VISTA EXPANDIDA (FORMULARIO SELECTS)
              <View style={styles.formExpanded}>
                <Text style={styles.formTitle}>Configura tu Pedido ⚙️</Text>
                <View style={styles.formDivider} />

                {loadingUserData ? (
                  <ActivityIndicator
                    size="large"
                    color="#004B32"
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <>
                    {/* Selector: Dirección */}
                    <View style={styles.formField}>
                      <Text style={styles.fieldLabel}>Dirección de Envío</Text>
                      <TouchableOpacity
                        style={styles.fieldSelector}
                        activeOpacity={0.7}
                        onPress={() => setAddressModalVisible(true)}
                      >
                        <Text
                          style={
                            selectedAddress
                              ? styles.selectorTextSelected
                              : styles.selectorTextPlaceholder
                          }
                        >
                          {selectedAddress
                            ? selectedAddress.fullAddress
                            : "Selecciona una dirección..."}
                        </Text>
                        <Text style={styles.selectorArrow}>▼</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Selector: Método de Pago */}
                    <View style={styles.formField}>
                      <Text style={styles.fieldLabel}>Forma de Pago</Text>
                      <TouchableOpacity
                        style={styles.fieldSelector}
                        activeOpacity={0.7}
                        onPress={() => setPaymentModalVisible(true)}
                      >
                        <Text
                          style={
                            selectedPayment
                              ? styles.selectorTextSelected
                              : styles.selectorTextPlaceholder
                          }
                        >
                          {selectedPayment
                            ? `${selectedPayment.provider} ${selectedPayment.lastFourDigits ? `(•••• ${selectedPayment.lastFourDigits})` : ""}`
                            : "Selecciona método de pago..."}
                        </Text>
                        <Text style={styles.selectorArrow}>▼</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                <View style={styles.formCheckoutContainer}>
                  <View style={styles.formTotalRow}>
                    <Text style={styles.formTotalLabel}>Total a Pagar:</Text>
                    <Text style={styles.formTotalAmount}>
                      RD$ {totalCompra}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.confirmCheckoutButton,
                      isSubmittingOrder && { backgroundColor: "#A0A0A0" },
                    ]}
                    activeOpacity={0.8}
                    onPress={handlePressCheckout}
                    disabled={isSubmittingOrder || loadingUserData}
                  >
                    {isSubmittingOrder ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.checkoutText}>
                        Confirmar y Enviar 🚀
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* --- MODAL SELECTOR: DIRECCIONES --- */}
      <Modal visible={addressModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una Dirección</Text>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    selectedAddress?.id === item.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedAddress(item);
                    setAddressModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.fullAddress}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>
                  No tienes direcciones guardadas.
                </Text>
              }
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL SELECTOR: MÉTODOS DE PAGO --- */}
      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona un Método de Pago</Text>
            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    selectedPayment?.id === item.id &&
                      styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedPayment(item);
                    setPaymentModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>
                    💳 {item.provider}{" "}
                    {item.lastFourDigits ? `(•••• ${item.lastFourDigits})` : ""}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmptyText}>
                  No tienes métodos de pago vinculados.
                </Text>
              }
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==========================================
//          COMPONENTE SECUNDARIO CARD
// ==========================================
function CartCardItem({
  item,
  isExpanded,
  localQty,
  onToggle,
  onUpdateLocalQty,
  onConfirm,
  onDelete,
}: any) {
  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

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
    outputRange: [0, 115],
  });

  const numericPrice = Number(item.price) || 0;
  const numericQuantity = Number(item.quantity) || 0;
  const maxStock = Number(item.stock) || 0;
  const unitType = item.unitType || "ud";
  const hasReachedMax = localQty >= maxStock;

  const renderQtyText = (qty: number) => {
    if (unitType === "lb") return `${qty.toFixed(2)} lb`;
    return `${Math.floor(qty)} ud`;
  };

  return (
    <View style={[styles.cartCard, isExpanded && styles.cartCardExpanded]}>
      <TouchableOpacity
        style={styles.cardMainArea}
        activeOpacity={0.8}
        onPress={onToggle}
      >
        <View style={styles.imageWrapper}>
          <Text style={styles.itemEmoji}>{item.image || "📦"}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemPriceSubtotal}>
            RD$ {numericPrice.toFixed(2)} x {renderQtyText(numericQuantity)}
          </Text>
        </View>
        <View style={styles.rightActionArea}>
          <Text style={styles.itemTotalAmount}>
            RD$ {(numericPrice * numericQuantity).toFixed(2)}
          </Text>
          <Text style={styles.editBadge}>✏️ Editar</Text>
        </View>
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
          <View style={styles.editorHeaderRow}>
            <Text style={styles.stockLabelIndicator}>
              Stock disponible:{" "}
              <Text style={{ fontWeight: "700" }}>
                {maxStock} {unitType}
              </Text>
            </Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => onUpdateLocalQty("decrement")}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.qtyInputView}>
                <Text style={styles.qtyInputText}>
                  {renderQtyText(localQty)}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.qtyButton,
                  hasReachedMax && styles.qtyButtonDisabled,
                ]}
                onPress={() => onUpdateLocalQty("increment")}
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
          </View>
          <View style={styles.actionButtonGroupVertical}>
            <TouchableOpacity
              style={styles.deleteActionButton}
              activeOpacity={0.7}
              onPress={onDelete}
            >
              <Text style={styles.deleteButtonText}>🗑 Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.7}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirmar Cambios ✅</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ==========================================
//                ESTILOS UI
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  titleSection: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  titleText: { fontSize: 22, fontWeight: "bold", color: "#004B32" },
  subtitleText: { fontSize: 13, color: "#6A7C75", marginTop: 2 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  scrollList: { paddingBottom: 24 },
  cartCard: {
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
  cartCardExpanded: { borderColor: "#00C252" },
  cardMainArea: { flexDirection: "row", alignItems: "center" },
  imageWrapper: {
    backgroundColor: "#F4F7F5",
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemEmoji: { fontSize: 24 },
  itemInfo: { flex: 1, paddingRight: 12 },
  itemName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#004B32",
    lineHeight: 19,
  },
  itemPriceSubtotal: { fontSize: 12, color: "#6A7C75", marginTop: 2 },
  rightActionArea: {
    alignItems: "flex-end",
    minWidth: 90,
    justifyContent: "center",
  },
  itemTotalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#004B32",
    textAlign: "right",
  },
  editBadge: {
    fontSize: 11,
    color: "#00C252",
    fontWeight: "600",
    marginTop: 4,
  },
  expandedContent: { paddingTop: 2 },
  divider: { height: 1, backgroundColor: "#E2E8E5", marginBottom: 12 },
  editorHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  stockLabelIndicator: { fontSize: 12, color: "#6A7C75" },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8E5",
  },
  qtyButton: {
    width: 36,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonDisabled: { backgroundColor: "#EAEAEA" },
  qtyButtonText: { fontSize: 18, fontWeight: "bold", color: "#004B32" },
  qtyButtonTextDisabled: { color: "#A0A0A0" },
  qtyInputView: {
    paddingHorizontal: 6,
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyInputText: { fontSize: 12.5, fontWeight: "bold", color: "#004B32" },
  actionButtonGroupVertical: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  deleteActionButton: {
    flex: 1,
    backgroundColor: "#FFEBEB",
    borderWidth: 1,
    borderColor: "#FFC1C1",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: { fontSize: 13, color: "#E03B3B", fontWeight: "600" },
  confirmButton: {
    flex: 2,
    backgroundColor: "#004B32",
    paddingVertical: 11,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { color: "#6A7C75", fontSize: 15, marginBottom: 20 },
  backButton: {
    backgroundColor: "#004B32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  customPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  panelHandleArea: {
    width: "100%",
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetHandle: {
    backgroundColor: "#E2E8E5",
    width: 60,
    height: 5,
    borderRadius: 3,
  },
  sheetContent: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
  footerCollapsed: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  footerLabel: { fontSize: 12, color: "#6A7C75", textTransform: "uppercase" },
  footerTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004B32",
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: "#00C252",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: "#00C252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  formExpanded: { flex: 1, paddingTop: 4 },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004B32",
    marginBottom: 10,
    textAlign: "center",
  },
  formDivider: { height: 1, backgroundColor: "#E2E8E5", marginBottom: 20 },
  formField: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6A7C75",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  fieldSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F7F5",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  selectorTextPlaceholder: { fontSize: 14, color: "#A0A0A0" },
  selectorTextSelected: { fontSize: 14, color: "#004B32", fontWeight: "500" },
  selectorArrow: { fontSize: 12, color: "#6A7C75" },
  formCheckoutContainer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderColor: "#E2E8E5",
    paddingTop: 20,
  },
  formTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  formTotalLabel: { fontSize: 14, color: "#6A7C75" },
  formTotalAmount: { fontSize: 20, fontWeight: "bold", color: "#004B32" },
  confirmCheckoutButton: {
    backgroundColor: "#00C252",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00C252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8E5",
  },
  modalOptionSelected: { backgroundColor: "#E6F9EE" },
  modalOptionText: { fontSize: 14, color: "#333" },
  modalEmptyText: { textAlign: "center", color: "#6A7C75", marginVertical: 20 },
  closeModalButton: {
    marginTop: 15,
    backgroundColor: "#004B32",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeModalButtonText: { color: "#FFFFFF", fontWeight: "600" },
});
