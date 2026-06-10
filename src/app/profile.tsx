import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../components/common/Header";
import PasswordModal from "../components/profile/PasswordModal";

export default function ProfileScreen() {
  // --- ESTADOS ESTÁTICOS DE USUARIO ---
  const [nombre, setNombre] = useState("Juan Rodríguez");
  const [modalVisible, setModalVisible] = useState(false);

  const [direcciones] = useState([
    {
      id: "1",
      detalle: "Calle Principal #15, Constanza Centro",
      principal: true,
    },
    {
      id: "2",
      detalle: "Av. Antonio Duvergé, Residencial Las Flores",
      principal: false,
    },
  ]);
  const [contactos] = useState({
    whatsapp: "+1 (829) 555-0123",
    fijo: "+1 (809) 530-9876",
  });

  return (
    <View style={styles.container}>
      <Header titulo="Mi Perfil" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* MÓDULO 1: DATOS DE USUARIO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            👤 Información de Usuario
          </Text>
          <View style={styles.divider} />

          <View style={styles.avatarSection}>
            <View style={styles.avatarImagePlaceholder}>
              <Text style={styles.avatarText}>JR</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => alert("Abrir galería")}
            >
              <Text style={styles.avatarButtonText}>
                Cambiar foto de perfil
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inlineRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={nombre}
                onChangeText={setNombre}
              />
              <TouchableOpacity
                style={styles.inlineButton}
                onPress={() => alert("Nombre guardado")}
              >
                <Text style={styles.inlineButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* MÓDULO 2: INFORMACIÓN IMPORTANTE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            📍 Información de Entrega
          </Text>
          <View style={styles.divider} />

          <View style={styles.subBlockHeader}>
            <Text style={styles.labelTitle}>Mis Direcciones de Envío</Text>
            <TouchableOpacity onPress={() => alert("Nueva dirección")}>
              <Text style={styles.addText}>+ Agregar otra</Text>
            </TouchableOpacity>
          </View>

          {direcciones.map((dir) => (
            <View key={dir.id} style={styles.itemBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemBoxText}>{dir.detalle}</Text>
                {dir.principal && (
                  <Text style={styles.badgePrincipal}>Principal</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => alert(`Editar ${dir.id}`)}>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text style={[styles.labelTitle, { marginTop: 20, marginBottom: 8 }]}>
            Números de Contacto
          </Text>

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>🟢 WhatsApp:</Text>
            <Text style={styles.contactValue}>{contactos.whatsapp}</Text>
          </View>

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>📞 Teléfono Fijo:</Text>
            <Text style={styles.contactValue}>
              {contactos.fijo || "No asignado"}
            </Text>
          </View>
        </View>

        {/* MÓDULO 3: SEGURIDAD Y CUENTA */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeaderTitle, { color: "#dc3545" }]}>
            🔒 Seguridad y Cuenta
          </Text>
          <View style={styles.divider} />

          <Text style={[styles.labelTitle, { marginBottom: 12 }]}>
            Modificar Contraseña
          </Text>

          {/* Al presionar, solo cambiamos a true el booleano y el componente se encarga del resto */}
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.passwordButtonText}>
              Cambiar Contraseña por Correo
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { marginVertical: 20 }]} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => alert("Cerrando sesión...")}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión Activa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- EL COMPONENTE INYECTADO DESDE AFUERA --- */}
      <PasswordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8E5",
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#004B32",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8E5",
    marginVertical: 12,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#004B32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  avatarButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F4F7F5",
    borderRadius: 20,
    marginTop: 4,
  },
  avatarButtonText: {
    color: "#00C252",
    fontSize: 14,
    fontWeight: "600",
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
  inlineRow: {
    flexDirection: "row",
    gap: 8,
  },
  inlineButton: {
    backgroundColor: "#004B32",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inlineButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  subBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  labelTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#004B32",
  },
  addText: {
    color: "#00C252",
    fontSize: 13,
    fontWeight: "700",
  },
  itemBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemBoxText: {
    fontSize: 14,
    color: "#333333",
  },
  badgePrincipal: {
    fontSize: 11,
    color: "#004B32",
    fontWeight: "bold",
    marginTop: 4,
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  editText: {
    color: "#004B32",
    fontSize: 13,
    fontWeight: "600",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    marginBottom: 8,
    gap: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6A7C75",
  },
  contactValue: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  editTextTextOnly: {
    color: "#004B32",
    fontSize: 13,
    fontWeight: "600",
  },
  passwordButton: {
    backgroundColor: "#004B32",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  passwordButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#DC3545",
    fontSize: 15,
    fontWeight: "bold",
  },

  /* --- ESTILOS DEL MODAL --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 75, 50, 0.4)", // Fondo oscuro con el color verde de la marca
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
