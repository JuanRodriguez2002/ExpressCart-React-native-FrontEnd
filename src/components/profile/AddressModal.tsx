// src/components/profile/AddressModal.tsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    fullAddress: string;
    references: string;
    isDefault: boolean;
  }) => Promise<void>;
  addressToEdit?: {
    id: string;
    fullAddress: string;
    references: string;
    isDefault: boolean;
  } | null; // 👈 Prop nueva
}

export default function AddressModal({
  visible,
  onClose,
  onSave,
  addressToEdit,
}: AddressModalProps) {
  const [fullAddress, setFullAddress] = useState("");
  const [references, setReferences] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (addressToEdit) {
        setFullAddress(addressToEdit.fullAddress);
        setReferences(addressToEdit.references || "");
        setIsDefault(addressToEdit.isDefault);
      } else {
        // Modo creación: Limpiamos los inputs
        setFullAddress("");
        setReferences("");
        setIsDefault(false);
      }
    }
  }, [visible, addressToEdit]);

  const handleSubmit = async () => {
    if (!fullAddress.trim()) {
      alert("La dirección no puede estar vacía");
      return;
    }

    setLoading(true);
    try {
      await onSave({ fullAddress, references, isDefault });
      onClose();
    } catch (error) {
      // El error ya se maneja en la pantalla principal
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {addressToEdit
              ? "✏️ Editar Dirección"
              : "📍 Agregar Nueva Dirección"}
          </Text>

          <Text style={styles.label}>Dirección Completa</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Calle Principal #15, Constanza"
            value={fullAddress}
            onChangeText={setFullAddress}
          />

          <Text style={styles.label}>Referencias (Opcional)</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Ej. Frente al parque, puerta verde"
            multiline
            value={references}
            onChangeText={setReferences}
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Establecer como predeterminada</Text>
            <Switch value={isDefault} onValueChange={setIsDefault} />
          </View>

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
                  {addressToEdit ? "Actualizar" : "Guardar"}
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
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
