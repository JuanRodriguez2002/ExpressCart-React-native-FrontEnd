import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type TipoTema = "light" | "dark";

interface ThemeContextType {
  tema: TipoTema;
  esOscuro: boolean;
  toggleTema: () => void;
  colores: typeof coloresClaros;
}

// Tus paletas de colores oficiales (Extendidas para Modo Oscuro)
const coloresClaros = {
  fondo: "#F4F7F5", // Tu gris-verde claro
  tarjeta: "#FFFFFF", // Blanco puro
  textoPrincipal: "#004B32", // Verde oscuro de tu logo
  textoSecundario: "#6A7C75",
  borde: "#E2E8E5",
  accionBrillante: "#00C252", // Verde claro de tu logo
  inputFondo: "#F8FAF9",
};

const coloresOscuros = {
  fondo: "#0B1411", // Negro con un tinte verde muy profundo
  tarjeta: "#14221D", // Gris-verde oscuro para las secciones
  textoPrincipal: "#E2F0EB", // Blanco verdoso suave para no cansar la vista
  textoSecundario: "#90A49C",
  borde: "#233830",
  accionBrillante: "#00C252", // Se mantiene el verde brillante del logo
  inputFondo: "#1B2C26",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sistema = useColorScheme(); // Lee el estado inicial del celular
  const [tema, setTema] = useState<TipoTema>(
    sistema === "dark" ? "dark" : "light",
  );

  // Si el usuario cambia el tema del sistema operativo, la app se adapta automáticamente
  useEffect(() => {
    if (sistema === "light" || sistema === "dark") {
      setTema(sistema);
    }
  }, [sistema]);

  const toggleTema = () => {
    setTema((prev) => (prev === "light" ? "dark" : "light"));
  };

  const esOscuro = tema === "dark";
  const colores = esOscuro ? coloresOscuros : coloresClaros;

  return (
    <ThemeContext.Provider value={{ tema, esOscuro, toggleTema, colores }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useTema debe usarse dentro de un ThemeProvider");
  return context;
}
