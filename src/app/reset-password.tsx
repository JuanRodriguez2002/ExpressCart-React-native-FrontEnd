import FormAlerts from "@/components/UI/FormAlerts";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function ResetPasswordScreen() {
  const router = useRouter();

  const { token } = useLocalSearchParams<{ token: string }>();

  // --- ESTADOS LOCALES (SÓLO VISUAL) ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // --- INTERACCIÓN VISUAL AL GUARDAR ---
  const handleResetPassword = async () => {
    if (loading) return;

    setErrorMessages([]);
    setSuccessMessage(null);

    const erroresEncontrados: string[] = [];

    // Validaciones visuales/cliente
    if (!password || !confirmPassword) {
      erroresEncontrados.push("Por favor, completa ambos campos.");
    }

    if (password && password.length < 6) {
      erroresEncontrados.push(
        "La nueva contraseña debe tener al menos 6 caracteres.",
      );
    }

    if (password !== confirmPassword) {
      erroresEncontrados.push("Las contraseñas ingresadas no coinciden.");
    }

    if (!token) {
      erroresEncontrados.push(
        "Token de sesión ausente. Por favor, solicita un nuevo código.",
      );
    }

    if (erroresEncontrados.length > 0) {
      setErrorMessages(erroresEncontrados);
      return;
    }

    setLoading(true);
    // Flujo visual de éxito
    try {
      // Consumimos el endpoint real pasando la url dinámica cifrada
      await authService.resetPassword(token, password);

      setSuccessMessage("¡Contraseña restablecida con éxito!");

      // Redirección definitiva al Login para que el usuario inicie sesión con su nueva clave
      setTimeout(() => {
        router.replace("/");
      }, 2500);
    } catch (error: any) {
      // Capturamos fallos como: El token expiró en base de datos mientras escribía la clave, etc.
      setErrorMessages([
        error.message || "No se pudo actualizar la contraseña en este momento.",
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
          <Text style={styles.appTitle}>Nueva Contraseña</Text>
          <Text style={styles.appSubtitle}>
            Crea una nueva contraseña segura que no utilices en otros sitios
            web.
          </Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.formContainer}>
          {/* Alertas Reutilizables */}
          <FormAlerts errors={errorMessages} success={successMessage} />

          {/* Campo: Nueva Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AAB2"
              secureTextEntry={true}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Campo: Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AAB2"
              secureTextEntry={true}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Botón de Guardar */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleResetPassword}
          >
            <Text style={styles.primaryButtonText}>Restablecer Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Enlace de apoyo */}
        <View style={styles.footerSection}>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.backLink}>Cancelar y volver al Login</Text>
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
    marginBottom: 16,
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
    marginTop: 10,
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
