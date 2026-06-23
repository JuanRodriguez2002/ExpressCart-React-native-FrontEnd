import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            {/* Login */}
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="verify-token" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="home" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="profile" />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </>
  );
}
