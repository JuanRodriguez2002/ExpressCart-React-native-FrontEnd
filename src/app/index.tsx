import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Activa esto para que salte a la nueva pantalla
    router.replace("/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Sección del Logo e Identidad */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo_sinF.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
          <Text style={styles.subtitulo}>Tu supermercado rápido y fresco</Text>
        </View>

        {/* Tarjeta del Formulario */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Iniciar Sesión</Text>
          <Text style={styles.instructionText}>
            Ingresa tus credenciales para continuar.
          </Text>

          {/* Input de Correo */}
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

          {/* Input de Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#A0AAB2"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Olvidé mi contraseña */}
          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón Principal (Verde Claro del Logo) */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          {/* Registro */}
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.registerTextBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Fondo sutilmente verdoso/grisáceo muy limpio
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  subtitulo: {
    fontSize: 15,
    color: "#004B32", // Verde oscuro del logo para jerarquía secundaria
    fontWeight: "500",
    marginTop: -10,
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24, // Bordes más redondeados y modernos
    padding: 24,
    shadowColor: "#004B32", // Sombra usando el tono de la marca para cohesión
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#004B32", // Verde Oscuro principal
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: "#6A7C75",
    marginBottom: 24,
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
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#004B32",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    color: "#004B32",
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#00C252", // Verde Claro/Brillante del logo
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#00C252",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  registerButton: {
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#6A7C75",
    fontSize: 14,
  },
  registerTextBold: {
    color: "#00C252", // Resalta con el verde brillante
    fontWeight: "bold",
  },
});
