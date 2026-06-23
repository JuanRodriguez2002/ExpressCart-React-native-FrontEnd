import { tokenStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import { authService, UserProfile } from "../services/authService";
import { ApiCategory, categoryService } from "../services/categoryService";
import {
    Supermarket,
    supermarketService,
} from "../services/supermarketService";

export interface CategoriaUI {
  id: string;
  titulo: string;
  imagenIlustrativa: string;
}

const getCategoryEmoji = (name: string): string => {
  const normalized = name.toLowerCase();
  if (
    normalized.includes("fruta") ||
    normalized.includes("verdura") ||
    normalized.includes("vegetal")
  )
    return "🥦";
  if (
    normalized.includes("lacteo") ||
    normalized.includes("leche") ||
    normalized.includes("huevo")
  )
    return "🥛";
  if (
    normalized.includes("carne") ||
    normalized.includes("pescado") ||
    normalized.includes("pollo")
  )
    return "🥩";
  if (
    normalized.includes("despensa") ||
    normalized.includes("grano") ||
    normalized.includes("arroz")
  )
    return "🌾";
  if (
    normalized.includes("bebida") ||
    normalized.includes("jugo") ||
    normalized.includes("refresco")
  )
    return "🧃";
  if (
    normalized.includes("snack") ||
    normalized.includes("dulce") ||
    normalized.includes("galleta")
  )
    return "🍪";
  if (
    normalized.includes("personal") ||
    normalized.includes("jabon") ||
    normalized.includes("shampoo")
  )
    return "🧼";
  if (normalized.includes("limpieza") || normalized.includes("hogar"))
    return "🧽";
  return "📦";
};

export function useCategories(supermarketId: string | undefined) {
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [categories, setCategories] = useState<CategoriaUI[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const fetchAllData = async () => {
    if (!supermarketId) return;

    try {
      setLoading(true);
      setErrorMessages([]);

      const token = await tokenStorage.getToken();
      if (!token) {
        throw new Error("No se encontró una sesión activa.");
      }

      // Consumimos los servicios de forma limpia utilizando la arquitectura nativa fetch
      const [supermarketData, categoriesData, userData] = await Promise.all([
        supermarketService.getById(supermarketId),
        categoryService.getBySupermarket(supermarketId),
        authService.getUserProfile(token), // Si authService ya maneja su propia firma, perfecto.
      ]);

      setSupermarket(supermarketData);
      setUser(userData);

      const mappedCategories = categoriesData.map((cat: ApiCategory) => ({
        id: cat.id.toString(),
        titulo: cat.name,
        imagenIlustrativa: getCategoryEmoji(cat.name),
      }));

      setCategories(mappedCategories);
    } catch (error: any) {
      console.error("Error en useCategories:", error);
      setErrorMessages([error.message || "Error al conectar con el servidor."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [supermarketId]);

  return {
    supermarket,
    categories,
    user,
    loading,
    errorMessages,
    refetch: fetchAllData,
  };
}
