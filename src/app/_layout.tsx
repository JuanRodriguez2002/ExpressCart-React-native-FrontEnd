import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Login */}
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="verify-token" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="home" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="profile" />
        </Stack>
      </AuthProvider>
    </>
  );
}
