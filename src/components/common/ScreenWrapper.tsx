import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { useTema } from "../../context/ThemeContext";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean; // Permite decidir si la pantalla lleva scroll o es fija
  style?: ViewStyle; // Por si necesitas pasarle algún estilo extra desde fuera
}

export default function ScreenWrapper({
  children,
  scrollable = false,
  style,
}: ScreenWrapperProps) {
  const { colores } = useTema();

  // Estilo base con el fondo dinámico automático
  const containerStyle = [
    styles.container,
    { backgroundColor: colores.fondo },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40, // Espacio limpio al final del scroll
  },
});
