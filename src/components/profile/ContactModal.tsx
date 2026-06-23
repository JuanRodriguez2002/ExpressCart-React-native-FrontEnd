// src/components/profile/ContactModal.tsx
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

interface ContactModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { phoneNumber: string; type: string }) => Promise<void>;
  contactToEdit?: { id: string; phoneNumber: string; type: string } | null;
}

export default function ContactModal({
  visible,
  onClose,
  onSave,
  contactToEdit,
}: ContactModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (contactToEdit) {
        setPhoneNumber(contactToEdit.phoneNumber);
        setType(contactToEdit.type);
      } else {
        setPhoneNumber("");
        setType("");
      }
    }
  }, [visible, contactToEdit]);

  const handleSubmit = async () => {
    if (!phoneNumber.trim() || !type.trim()) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    try {
      await onSave({ phoneNumber, type });
      onClose();
    } catch (error) {
      // Manejado en el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {contactToEdit ? "✏️ Editar Contacto" : "📞 Agregar Nuevo Contacto"}
          </Text>

          <Text style={styles.label}>Tipo de Contacto</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. WhatsApp, Teléfono Fijo, Trabajo"
            value={type}
            onChangeText={setType}
          />

          <Text style={styles.label}>Número de Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. +1 (829) 555-0123"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

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
                  {contactToEdit ? "Actualizar" : "Guardar"}
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
