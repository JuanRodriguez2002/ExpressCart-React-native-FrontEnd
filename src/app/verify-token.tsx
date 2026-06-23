import FormAlerts from "@/components/UI/FormAlerts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

export default function VerifyTokenScreen() {
  const router = useRouter();

  // --- CAPTURAMOS EL TIPO DE FLUJO (?type=register o ?type=forgot) ---
  const { type } = useLocalSearchParams();

  // --- ESTADOS LOCALES ---
  const [token, setToken] = useState<string[]>(Array(6).fill(""));
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (errorMessages.length > 0 || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessages([]);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessages, successMessage]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newToken = [...token];
    newToken[index] = cleanText.slice(-1);
    setToken(newToken);

    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !token[index] && index > 0) {
      const newToken = [...token];
      newToken[index - 1] = "";
      setToken(newToken);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- COMPORTAMIENTO DINÁMICO AL VALIDAR ---
  const handleVerifyToken = async () => {
    if (loading) return;

    setErrorMessages([]);
    setSuccessMessage(null);

    const tokenCompleto = token.join("");

    if (tokenCompleto.length < 6) {
      setErrorMessages([
        "Por favor, ingresa los 6 dígitos del código de verificación.",
      ]);
      return;
    }

    setLoading(true);

    try {
      if (type === "forgot") {
        // 🚨 AQUÍ: Al estar dentro del bloque try, el "Invalid token" lanzado por el servicio
        // será capturado inmediatamente por el bloque catch de abajo.
        await authService.validateForgotPasswordToken(tokenCompleto);

        setSuccessMessage(
          "¡Código validado! Redireccionando para cambiar tu contraseña...",
        );
        setTimeout(() => {
          router.push({
            pathname: "/reset-password",
            params: { token: tokenCompleto },
          });
        }, 2000);
      } else {
        // Flujo de confirmación de cuenta
        await authService.confirmAccount(tokenCompleto);

        setSuccessMessage(
          "¡Cuenta verificada con éxito! Redireccionando al inicio de sesión...",
        );
        setTimeout(() => {
          router.replace("/");
        }, 2000);
      }
    } catch (error: any) {
      // 🎯 Aquí cae el "Invalid token" y se guarda en el estado para el FormAlerts
      setErrorMessages([
        error.message || "Código inválido o error de red local.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setErrorMessages([]);
    setSuccessMessage(
      "Se ha reenviado un nuevo código a tu correo electrónico.",
    );
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
        {/* Encabezado Dinámico */}
        <View style={styles.logoSection}>
          <Image
            source={require("../../assets/images/logo_sinF.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>
            {type === "forgot" ? "Recuperar Contraseña" : "Verifica tu Cuenta"}
          </Text>
          <Text style={styles.appSubtitle}>
            {type === "forgot"
              ? "Ingresa el código de 6 dígitos enviado a tu correo para autorizar el cambio de contraseña."
              : "Hemos enviado un código de seguridad de 6 dígitos a tu correo electrónico para confirmar tu cuenta."}
          </Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.formContainer}>
          <FormAlerts errors={errorMessages} success={successMessage} />

          <Text style={styles.labelCenter}>Código de Verificación</Text>
          <View style={styles.tokenInputsContainer}>
            {token.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el as TextInput)}
                style={[
                  styles.tokenInput,
                  digit ? styles.tokenInputActive : null,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                placeholder="0"
                placeholderTextColor="#A0AAB2"
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleVerifyToken}
          >
            <Text style={styles.primaryButtonText}>Validar Código</Text>
          </TouchableOpacity>

          <View style={styles.resendSection}>
            <Text style={styles.resendText}>¿No recibiste el código? </Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>Reenviar código</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  scrollContent: { padding: 24, justifyContent: "center", minHeight: "100%" },
  logoSection: { alignItems: "center", marginBottom: 24, marginTop: 20 },
  logoImage: { width: 120, height: 120, marginBottom: 12 },
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
    paddingHorizontal: 20,
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
  labelCenter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#004B32",
    textAlign: "center",
    marginBottom: 16,
  },
  tokenInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  tokenInput: {
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 10,
    width: 42,
    height: 50,
    fontSize: 20,
    fontWeight: "bold",
    color: "#004B32",
    ...Platform.select({
      ios: { paddingVertical: 10 },
      android: { paddingVertical: 0 },
    }),
  },
  tokenInputActive: { borderColor: "#00C252", backgroundColor: "#FFFFFF" },
  primaryButton: {
    backgroundColor: "#00C252",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  resendSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  resendText: { fontSize: 13, color: "#6A7C75" },
  resendLink: { fontSize: 13, fontWeight: "bold", color: "#004B32" },
  footerSection: { alignItems: "center", marginTop: 24, marginBottom: 10 },
  backLink: { fontSize: 14, fontWeight: "bold", color: "#004B32" },
});
