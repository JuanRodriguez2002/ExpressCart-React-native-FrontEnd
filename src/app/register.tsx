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

export default function RegisterScreen() {
  const router = useRouter();

  // --- ESTADOS DEL FORMULARIO ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ESTADO PARA ALERTAS DINÁMICAS ---
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- EFECTO PARA LIMPIAR ALERTAS A LOS 5 SEGUNDOS ---
  useEffect(() => {
    if (errorMessages || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessages([]);
        setSuccessMessage(null);
      }, 5000); // 5000 milisegundos = 5 segundos

      return () => clearTimeout(timer); // Limpia el timer si el componente se desmonta o cambia el estado
    }
  }, [errorMessages, successMessage]);

  // --- MANEJO DEL REGISTRO (Simulado localmente para Frontend) ---
  const handleRegister = async () => {
    if (loading) return;

    // Resetear alertas previas antes de validar
    setErrorMessages([]);
    setSuccessMessage(null);

    // Arreglo temporal para acumular los mensajes de error hallados
    const erroresEncontrados: string[] = [];

    // Formateamos las entradas a minúsculas y limpiamos espacios para validar correctamente
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.toLowerCase();
    const cleanConfirmPassword = confirmPassword.toLowerCase();

    if (
      !name.trim() ||
      !cleanEmail ||
      !cleanPassword ||
      !cleanConfirmPassword
    ) {
      erroresEncontrados.push("completa todos los campos obligatorios.");
    }

    // Validación básica de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      erroresEncontrados.push("ingresa un correo electrónico válido.");
    }

    if (cleanPassword.length < 6) {
      erroresEncontrados.push(
        "La contraseña debe tener al menos 6 caracteres.",
      );
    }

    if (cleanPassword !== cleanConfirmPassword) {
      erroresEncontrados.push("Las contraseñas ingresadas no coinciden.");
    }

    if (erroresEncontrados.length > 0) {
      // Unimos todos los errores con un salto de línea (\n) para mostrarlos en lista
      setErrorMessages(erroresEncontrados);
      return; // Detiene el flujo si hay inconvenientes
    }

    setLoading(true);
    // Simulación futura de persistencia / API
    try {
      // Consumimos el servicio real enviando los datos limpios y en minúsculas
      await authService.createAccount({
        name: name,
        email: cleanEmail,
        password: cleanPassword,
      });

      // Mensaje de éxito informando sobre el token enviado por tu backend
      setSuccessMessage(
        "¡Cuenta creada! Te hemos enviado un código de 6 dígitos a tu correo.",
      );

      // Redirección síncrona pasando el parámetro de tipo registro
      setTimeout(() => {
        router.push({
          pathname: "/verify-token",
          params: { type: "register" },
        });
      }, 2500);
    } catch (error: any) {
      console.log("entra");
      // Capturamos errores lógicos del servidor (ej: "El correo ya está en uso")
      setErrorMessages([
        error.message || "Ocurrió un problema al conectar con el servidor.",
      ]);
    } finally {
      // Aseguramos restablecer los campos visuales a minúsculas para mantener la consistencia en la UI si falla
      setEmail(cleanEmail);
      setPassword(cleanPassword);
      setConfirmPassword(cleanConfirmPassword);
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
        {/* Contenedor del Logo de la App */}
        <View style={styles.logoSection}>
          <Image
            source={require("../../assets/images/logo_sinF.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Crea tu Cuenta</Text>
          <Text style={styles.appSubtitle}>
            Únete a ExpressCart y gestiona tus compras de manera inteligente.
          </Text>
        </View>

        {/* --- FORMULARIO DE REGISTRO --- */}
        <View style={styles.formContainer}>
          {/* --- RENDERIZADO DE ALERTAS COMO TARJETAS INDIVIDUALES --- */}
          <FormAlerts errors={errorMessages} success={successMessage} />
          {/* Campo: Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Diego"
              placeholderTextColor="#A0AAB2"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Campo: Correo Electrónico */}
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

          {/* Campo: Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
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
            <Text style={styles.label}>Confirmar Contraseña</Text>
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

          {/* Botón Principal de Registro */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleRegister}
          >
            <Text style={styles.primaryButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        {/* --- ENLACE PARA VOLVER AL LOGIN --- */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5", // Gris-verde claro oficial de fondo
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
    color: "#004B32", // Verde oscuro principal
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 13,
    color: "#6A7C75",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    // Sombra sutil idéntica al dashboard y modales
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
    backgroundColor: "#00C252", // Verde brillante de acento
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: "#6A7C75",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#004B32",
  },
});
