import FormAlerts from "@/components/UI/FormAlerts";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../services/authService";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // --- ESTADOS LOCALES (SOLO VISUAL) ---
  const [email, setEmail] = useState("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- EFECTO PARA LIMPIAR ALERTAS ---
  useEffect(() => {
    if (errorMessages.length > 0 || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessages([]);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessages, successMessage]);

  // --- INTERACCIÓN VISUAL AL ENVIAR ---
  const handleForgotPassword = async () => {
    if (loading) return;

    setErrorMessages([]);
    setSuccessMessage(null);

    // Validación básica en el cliente
    if (!email.trim()) {
      setErrorMessages(["Ingresa tu correo electrónico."]);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessages(["Ingresa un correo electrónico válido."]);
      return;
    }

    setLoading(true);
    // Flujo visual de éxito
    try {
      // Consumimos el servicio enviando el correo limpio
      await authService.forgotPassword(email.trim().toLowerCase());

      setSuccessMessage(
        "Código de recuperación enviado. Revisa tu bandeja de entrada.",
      );

      // Navegación automática a la pantalla compartida de verificación con el parámetro correcto
      setTimeout(() => {
        router.push({
          pathname: "/verify-token",
          params: { type: "forgot" },
        });
      }, 2000);
    } catch (error: any) {
      // Capturamos si el correo no está registrado en tu base de datos o fallos de red
      setErrorMessages([
        error.message || "Ocurrió un problema en el servidor local.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.logoSection}>
          <Image
            source={require("../../assets/images/logo_sinF.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.appSubtitle}>
            Introduce el correo electrónico asociado a tu cuenta y te enviaremos
            las instrucciones para restablecerla.
          </Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.formContainer}>
          {/* Alertas Reutilizables */}
          <FormAlerts errors={errorMessages} success={successMessage} />

          {/* Campo de Texto: Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#A0AAB2"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Botón de Enviar */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleForgotPassword}
          >
            <Text style={styles.primaryButtonText}>Enviar Instrucciones</Text>
          </TouchableOpacity>
        </View>

        {/* Enlace para regresar al Login */}
        <View style={styles.footerSection}>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.backLink}>Volver al Inicio de Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  scrollContent: {
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#004B32",
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 13,
    color: "#6A7C75",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 15,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    shadowColor: "#004B32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#004B32",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#004B32",
  },
  primaryButton: {
    backgroundColor: "#00C252",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  footerSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  backLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#004B32",
  },
});
