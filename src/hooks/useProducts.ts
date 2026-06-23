// src/hooks/useProducts.ts
import { useCart } from "@/context/CartContext";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { ApiProduct, productService } from "../services/productService";
import { supermarketService } from "../services/supermarketService";

export function useProducts(
  supermarketId: string | undefined,
  categoryId: string | undefined,
) {
  const { addToCartGlobal } = useCart();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [supermarketName, setSupermarketName] =
    useState<string>("Supermercado");
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const animValue = useRef(new Animated.Value(0)).current;

  const loadProductsData = async () => {
    if (!supermarketId || !categoryId) return;

    try {
      setLoading(true);
      setErrorMessages([]);

      const [supermarketData, productsData] = await Promise.all([
        supermarketService.getById(supermarketId),
        productService.getBySupermarketAndCategory(supermarketId, categoryId),
      ]);

      setSupermarketName(supermarketData.name);
      setProducts(productsData);
    } catch (error: any) {
      console.error("Error en useProducts:", error);
      setErrorMessages([error.message || "Error al cargar la estantería."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductsData();
  }, [supermarketId, categoryId]);

  const toggleExpand = (id: string) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const updateQuantity = (id: number, type: "increment" | "decrement") => {
    // 1. Encontrar el producto para saber su unitType
    const product = products.find((p) => p.id === id);
    const isLibra = product?.unitType === "lb";

    // 2. Definir el paso y el mínimo según corresponda
    const step = isLibra ? 0.25 : 1;
    const minQty = isLibra ? 0.25 : 1;

    // Valor inicial por defecto si aún no se ha tocado el contador
    const currentQty = quantities[id] !== undefined ? quantities[id] : minQty;

    if (type === "increment") {
      const nextQty = Number((currentQty + step).toFixed(2));
      setQuantities({ ...quantities, [id]: nextQty });
    } else if (type === "decrement" && currentQty > minQty) {
      const nextQty = Number((currentQty - step).toFixed(2));
      setQuantities({ ...quantities, [id]: nextQty });
    }
  };

  const handleAddToCart = (producto: any) => {
    const isLibra = producto.unitType === "lb";
    const defaultQty = isLibra ? 0.25 : 1;
    const qty =
      quantities[producto.id] !== undefined
        ? quantities[producto.id]
        : defaultQty;

    // Inyectamos el producto estructurado al Contexto Global con su cantidad exacta (int o float)
    addToCartGlobal(producto, qty);

    // Reseteamos el contador local al valor mínimo inicial que le corresponde por su tipo
    setQuantities({ ...quantities, [producto.id]: defaultQty });

    // Lanzamos la animación secuencial del carrito
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  };

  return {
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
    refetch: loadProductsData,
  };
}
