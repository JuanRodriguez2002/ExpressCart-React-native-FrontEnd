// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity: number; // Cantidad seleccionada
}

interface CartContextType {
  cart: CartItem[];
  addToCartGlobal: (product: any, qty: number) => void;
  updateCartQuantityGlobal: (productId: string, newQty: number) => void;
  removeFromCartGlobal: (productId: string) => void;
  getCartCount: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Añadir o acumular productos desde la pantalla de pasillos
  const addToCartGlobal = (product: any, qty: number) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id,
      );
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += qty;
        return newCart;
      }
      return [...prevCart, { ...product, quantity: qty }];
    });
  };

  // Reemplazar o editar la cantidad exacta (útil para la pantalla de Carrito)
  const updateCartQuantityGlobal = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCartGlobal(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item,
      ),
    );
  };

  // Eliminar por completo un artículo si llega a 0
  const removeFromCartGlobal = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCartGlobal,
        updateCartQuantityGlobal,
        removeFromCartGlobal,
        getCartCount,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
}
