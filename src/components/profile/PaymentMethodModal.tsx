// src/components/profile/PaymentMethodModal.tsx
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { provider: string; lastFourDigits: string }) => Promise<void>;
  paymentToEdit?: {
    id: string;
    provider: string;
    lastFourDigits: string;
  } | null;
}

export default function PaymentMethodModal({
  visible,
  onClose,
  onSave,
  paymentToEdit,
}: PaymentMethodModalProps) {
  const [provider, setProvider] = useState("");
  const [lastFourDigits, setLastFourDigits] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (paymentToEdit) {
        setProvider(paymentToEdit.provider);
        setLastFourDigits(paymentToEdit.lastFourDigits || "");
      } else {
        setProvider("");
        setLastFourDigits("");
      }
    }
  }, [visible, paymentToEdit]);

  const handleSubmit = async () => {
    if (!provider.trim()) {
      alert("El proveedor de pago es obligatorio.");
      return;
    }

    if (lastFourDigits.trim() && lastFourDigits.trim().length !== 4) {
      alert("Los últimos dígitos deben ser exactamente 4 números.");
      return;
    }

    setLoading(true);
    try {
      await onSave({ provider, lastFourDigits });
      onClose();
    } catch (error) {
      // Controlado por la vista superior
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {paymentToEdit
              ? "✏️ Editar Método de Pago"
              : "💳 Agregar Método de Pago"}
          </Text>

          <Text style={styles.label}>Método / Proveedor</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Efectivo, Tarjeta de Crédito, Transferencia"
            value={provider}
            onChangeText={setProvider}
          />

          {provider.toLowerCase().includes("tarjeta") && (
            <>
              <Text style={styles.label}>Últimos 4 dígitos (Opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 4321"
                keyboardType="numeric"
                maxLength={4}
                value={lastFourDigits}
                onChangeText={setLastFourDigits}
              />
            </>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {paymentToEdit ? "Actualizar" : "Guardar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: { backgroundColor: "#FFF", borderRadius: 16, padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#004B32",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#004B32",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F4F7F5",
  },
  cancelButtonText: { color: "#6A7C75", fontWeight: "bold" },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#004B32",
  },
  saveButtonText: { color: "#FFF", fontWeight: "bold" },
});
