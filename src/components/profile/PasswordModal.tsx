import { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PasswordModal({
  visible,
  onClose,
}: PasswordModalProps) {
  const [faseModal, setFaseModal] = useState(1); // 1: Correo, 2: Token, 3: Nueva Clave
  const [correo, setCorreo] = useState("");
  const [token, setToken] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  // Limpia el formulario al cerrar o iniciar
  const resetearFormulario = () => {
    setFaseModal(1);
    setCorreo("");
    setToken("");
    setNuevaPassword("");
    setConfirmarPassword("");
    onClose();
  };

  const handleEnviarCorreo = () => {
    if (!correo.trim()) {
      alert("Por favor, ingresa tu correo electrónico.");
      return;
    }
    // API apuntará aquí en el futuro
    alert(`Código de verificación enviado a: ${correo}`);
    setFaseModal(2);
  };

  const handleVerificarToken = () => {
    if (!token.trim()) {
      alert("Por favor, ingresa el token recibido.");
      return;
    }
    // API apuntará aquí en el futuro
    alert("Token verificado correctamente.");
    setFaseModal(3);
  };

  const handleRestablecerPassword = () => {
    if (!nuevaPassword || !confirmarPassword) {
      alert("Completa todos los campos.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    // API apuntará aquí en el futuro
    alert("¡Contraseña actualizada con éxito!");
    resetearFormulario();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={resetearFormulario}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Cabecera del Modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔑 Restablecer Clave</Text>
            <TouchableOpacity onPress={resetearFormulario}>
              <Text style={styles.closeModalText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* FASE 1: Solicitar Correo */}
          {faseModal === 1 && (
            <View>
              <Text style={styles.modalInstruction}>
                Ingresa el correo electrónico asociado a tu cuenta para enviarte
                un token de seguridad.
              </Text>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#A0AAB2"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
              />
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleEnviarCorreo}
              >
                <Text style={styles.modalPrimaryButtonText}>Enviar Token</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FASE 2: Solicitar Token */}
          {faseModal === 2 && (
            <View>
              <Text style={styles.modalInstruction}>
                Hemos enviado un código a{" "}
                <Text style={{ fontWeight: "bold" }}>{correo}</Text>. Ingrésalo
                a continuación.
              </Text>
              <Text style={styles.label}>Token de Seguridad</Text>
              <TextInput
                style={[
                  styles.input,
                  { letterSpacing: 4, textAlign: "center", fontSize: 18 },
                ]}
                placeholder="000000"
                placeholderTextColor="#A0AAB2"
                keyboardType="number-pad"
                maxLength={6}
                value={token}
                onChangeText={setToken}
              />
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleVerificarToken}
              >
                <Text style={styles.modalPrimaryButtonText}>
                  Verificar Código
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginTop: 12, alignItems: "center" }}
                onPress={() => setFaseModal(1)}
              >
                <Text style={{ color: "#6A7C75", fontSize: 13 }}>
                  Atrás / Cambiar correo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FASE 3: Nueva Contraseña */}
          {faseModal === 3 && (
            <View>
              <Text style={styles.modalInstruction}>
                Token validado. Ahora puedes asignar tu nueva contraseña de
                acceso de manera directa.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0AAB2"
                  secureTextEntry={true}
                  value={nuevaPassword}
                  onChangeText={setNuevaPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#A0AAB2"
                  secureTextEntry={true}
                  value={confirmarPassword}
                  onChangeText={setConfirmarPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleRestablecerPassword}
              >
                <Text style={styles.modalPrimaryButtonText}>
                  Guardar Nueva Contraseña
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 75, 50, 0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
  },
  closeModalText: {
    fontSize: 18,
    color: "#6A7C75",
    padding: 4,
  },
  modalInstruction: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 14,
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
  modalPrimaryButton: {
    backgroundColor: "#00C252",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  modalPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
