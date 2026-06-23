// src/app/profile.tsx
import Header from "@/components/common/Header";
import AddressModal from "@/components/profile/AddressModal";
import ContactModal from "@/components/profile/ContactModal";
import PasswordModal from "@/components/profile/PasswordModal";
import PaymentMethodModal from "@/components/profile/PaymentMethodModal"; // 👈 Nuevo modal importado
import { useAuthUser } from "@/hooks/useAuthUser";
import { profileService } from "@/services/profileService";
import { tokenStorage } from "@/utils/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
//               INTERFACES
// ==========================================
interface DireccionBD {
  id: string;
  fullAddress: string;
  references: string;
  isDefault: boolean;
}

interface ContactoBD {
  id: string;
  phoneNumber: string;
  type: string;
}

interface MetodoPagoBD {
  id: string;
  provider: string;
  lastFourDigits: string;
}

export default function ProfileScreen() {
  // --- ESTADOS ESTÁTICOS DE USUARIO ---
  const [nombre, setNombre] = useState("Juan Rodríguez");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const { userName } = useAuthUser();

  // ==========================================
  //          ESTADOS - DIRECCIONES
  // ==========================================
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [direcciones, setDirecciones] = useState<DireccionBD[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<DireccionBD | null>(
    null,
  );
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // ==========================================
  //           ESTADOS - CONTACTOS
  // ==========================================
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [contactos, setContactos] = useState<ContactoBD[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactoBD | null>(
    null,
  );
  const [loadingContacts, setLoadingContacts] = useState(true);

  // ==========================================
  //         ESTADOS - MÉTODOS DE PAGO
  // ==========================================
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoBD[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<MetodoPagoBD | null>(
    null,
  );
  const [loadingPayments, setLoadingPayments] = useState(true);

  // ==========================================
  //         EFECTO: CARGA INICIAL
  // ==========================================
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const token = await tokenStorage.getToken();
        if (!token) return;

        // Carga simultánea de Direcciones y Contactos de la API
        const [addressesData, contactsData, paymentsData] = await Promise.all([
          profileService.getAddresses(token),
          profileService.getContacts(token),
          profileService.getPaymentMethods(token),
        ]);

        // Mapear Direcciones
        setDirecciones(
          addressesData.map((addr: any) => ({
            id: addr.id.toString(),
            fullAddress: addr.fullAddress,
            references: addr.references || "",
            isDefault: addr.isDefault,
          })),
        );

        // Mapear Contactos
        setContactos(
          contactsData.map((cont: any) => ({
            id: cont.id.toString(),
            phoneNumber: cont.phoneNumber,
            type: cont.type,
          })),
        );

        // Sincronizar Métodos de Pago
        if (paymentsData && Array.isArray(paymentsData)) {
          setMetodosPago(
            paymentsData.map((pm: any) => ({
              id: pm.id.toString(),
              provider: pm.provider,
              lastFourDigits: pm.lastFourDigits || "",
            })),
          );
        } else {
          console.warn(
            "⚠️ Los métodos de pago recibidos no son un array válido.",
          );
        }
      } catch (error) {
        console.error("Error al cargar datos de perfil:", error);
        alert("Ocurrió un error al sincronizar tu información.");
      } finally {
        setLoadingAddresses(false);
        setLoadingContacts(false);
        setLoadingPayments(false);
      }
    };

    loadProfileData();
  }, []);

  // ==========================================
  //         LÓGICA - DIRECCIONES (CRUD)
  // ==========================================
  const handleSaveOrUpdateAddress = async (data: {
    fullAddress: string;
    references: string;
    isDefault: boolean;
  }) => {
    try {
      const token = await tokenStorage.getToken();
      if (!token) return alert("Tu sesión ha expirado.");

      if (selectedAddress) {
        // Editar dirección
        const res = await profileService.updateAddress(
          token,
          selectedAddress.id,
          data,
        );
        const direccionActualizada = res.address;
        const updatedFormatted: DireccionBD = {
          id: direccionActualizada.id.toString(),
          fullAddress: direccionActualizada.fullAddress,
          references: direccionActualizada.references || "",
          isDefault: direccionActualizada.isDefault,
        };

        setDirecciones((prev) => {
          const mapaCambiado = prev.map((item) =>
            direccionActualizada.isDefault
              ? { ...item, isDefault: false }
              : item,
          );
          return mapaCambiado.map((item) =>
            item.id === updatedFormatted.id ? updatedFormatted : item,
          );
        });
      } else {
        // Crear dirección
        const res = await profileService.createAddress(token, data);
        const nuevaDireccionDb = res.address;
        const newAddressFormatted: DireccionBD = {
          id: nuevaDireccionDb.id.toString(),
          fullAddress: nuevaDireccionDb.fullAddress,
          references: nuevaDireccionDb.references || "",
          isDefault: nuevaDireccionDb.isDefault,
        };

        if (nuevaDireccionDb.isDefault) {
          setDirecciones((prev) =>
            prev
              .map((d) => ({ ...d, isDefault: false }))
              .concat(newAddressFormatted),
          );
        } else {
          setDirecciones((prev) => [...prev, newAddressFormatted]);
        }
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar la dirección.");
      throw error;
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert(
      "⚠️ Eliminar Dirección",
      "¿Estás seguro de que deseas eliminar esta dirección de envío?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await tokenStorage.getToken();
              if (!token) return;
              await profileService.deleteAddress(token, id);
              setDirecciones((prev) => prev.filter((dir) => dir.id !== id));
              alert("Dirección de envío eliminada.");
            } catch (error: any) {
              alert(error.message || "No se pudo eliminar la dirección.");
            }
          },
        },
      ],
    );
  };

  const openCreateAddressModal = () => {
    setSelectedAddress(null);
    setAddressModalVisible(true);
  };

  const openEditAddressModal = (address: DireccionBD) => {
    setSelectedAddress(address);
    setAddressModalVisible(true);
  };

  // ==========================================
  //          LÓGICA - CONTACTOS (CRUD)
  // ==========================================
  const handleSaveOrUpdateContact = async (data: {
    phoneNumber: string;
    type: string;
  }) => {
    try {
      const token = await tokenStorage.getToken();
      if (!token) return alert("Tu sesión ha expirado.");

      if (selectedContact) {
        // Editar Contacto (PUT)
        const res = await profileService.updateContact(
          token,
          selectedContact.id,
          data,
        );
        const contactoActualizado = res.contact;

        setContactos((prev) =>
          prev.map((item) =>
            item.id === contactoActualizado.id.toString()
              ? {
                  ...item,
                  phoneNumber: contactoActualizado.phoneNumber,
                  type: contactoActualizado.type,
                }
              : item,
          ),
        );
        alert("Contacto actualizado con éxito.");
      } else {
        // Crear Contacto (POST)
        const res = await profileService.createContact(token, data);
        const nuevoContactoDb = res.contact;

        setContactos((prev) => [
          ...prev,
          {
            id: nuevoContactoDb.id.toString(),
            phoneNumber: nuevoContactoDb.phoneNumber,
            type: nuevoContactoDb.type,
          },
        ]);
        alert("Contacto agregado con éxito.");
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar el contacto.");
      throw error;
    }
  };

  const handleDeleteContact = async (id: string) => {
    Alert.alert(
      "⚠️ Eliminar Contacto",
      "¿Estás seguro de que deseas eliminar este número de contacto de tu perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await tokenStorage.getToken();
              if (!token) return;
              await profileService.deleteContact(token, id);
              setContactos((prev) => prev.filter((c) => c.id !== id));
              alert("Contacto eliminado de tu cuenta.");
            } catch (error: any) {
              alert(error.message || "No se pudo eliminar el contacto.");
            }
          },
        },
      ],
    );
  };

  const openCreateContactModal = () => {
    setSelectedContact(null);
    setContactModalVisible(true);
  };

  const openEditContactModal = (contact: ContactoBD) => {
    setSelectedContact(contact);
    setContactModalVisible(true);
  };

  // ==========================================
  //        LÓGICA - MÉTODOS DE PAGO (CRUD)
  // ==========================================
  const handleSaveOrUpdatePayment = async (data: {
    provider: string;
    lastFourDigits: string;
  }) => {
    try {
      const token = await tokenStorage.getToken();
      if (!token) return alert("Tu sesión ha expirado.");

      if (selectedPayment) {
        // Modo Edición (PUT)
        const res = await profileService.updatePaymentMethod(
          token,
          selectedPayment.id,
          data,
        );
        const pmActualizado = res.method;

        setMetodosPago((prev) =>
          prev.map((item) =>
            item.id === pmActualizado.id.toString()
              ? {
                  ...item,
                  provider: pmActualizado.provider,
                  lastFourDigits: pmActualizado.lastFourDigits || "",
                }
              : item,
          ),
        );
        alert("Método de pago actualizado con éxito.");
      } else {
        // Modo Creación (POST)
        const res = await profileService.createPaymentMethod(token, data);
        const nuevoPmDb = res.paymentMethod;

        setMetodosPago((prev) => [
          ...prev,
          {
            id: nuevoPmDb.id.toString(),
            provider: nuevoPmDb.provider,
            lastFourDigits: nuevoPmDb.lastFourDigits || "",
          },
        ]);
        alert("Método de pago registrado.");
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar el método de pago.");
      throw error;
    }
  };

  const handleDeletePayment = async (id: string) => {
    Alert.alert(
      "⚠️ Eliminar Método de Pago",
      "¿Estás seguro de que deseas desvincular este método de pago?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await tokenStorage.getToken();
              if (!token) return;
              await profileService.deletePaymentMethod(token, id);
              setMetodosPago((prev) => prev.filter((pm) => pm.id !== id));
            } catch (error: any) {
              alert(error.message || "No se pudo eliminar el método de pago.");
            }
          },
        },
      ],
    );
  };

  const openCreatePaymentModal = () => {
    setSelectedPayment(null);
    setPaymentModalVisible(true);
  };
  const openEditPaymentModal = (pm: MetodoPagoBD) => {
    setSelectedPayment(pm);
    setPaymentModalVisible(true);
  };

  // ==========================================
  //               RENDER UI
  // ==========================================
  return (
    <View style={styles.container}>
      <Header titulo="Mi Perfil" userName={userName} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BLOQUE 1: INFORMACIÓN DE USUARIO */}
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
                value={userName}
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

        {/* BLOQUE 2: DIRECCIONES DE ENVÍO */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>
            📍 Información de Entrega
          </Text>
          <View style={styles.divider} />

          <View style={styles.subBlockHeader}>
            <Text style={styles.labelTitle}>Mis Direcciones de Envío</Text>
            <TouchableOpacity onPress={openCreateAddressModal}>
              <Text style={styles.addText}>+ Agregar otra</Text>
            </TouchableOpacity>
          </View>

          {loadingAddresses ? (
            <ActivityIndicator
              size="small"
              color="#004B32"
              style={{ marginVertical: 10 }}
            />
          ) : direcciones.length === 0 ? (
            <Text style={styles.emptyText}>
              No tienes direcciones registradas.
            </Text>
          ) : (
            direcciones.map((dir) => (
              <View key={dir.id} style={styles.itemBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemBoxText}>{dir.fullAddress}</Text>
                  {dir.isDefault && (
                    <Text style={styles.badgePrincipal}>Principal</Text>
                  )}
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity onPress={() => openEditAddressModal(dir)}>
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteAddress(dir.id)}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* BLOQUE 3: NÚMEROS DE CONTACTO DINÁMICOS */}
          <View
            style={[styles.subBlockHeader, { marginTop: 20, marginBottom: 8 }]}
          >
            <Text style={styles.labelTitle}>Números de Contacto</Text>
            <TouchableOpacity onPress={openCreateContactModal}>
              <Text style={styles.addText}>+ Agregar número</Text>
            </TouchableOpacity>
          </View>

          {loadingContacts ? (
            <ActivityIndicator
              size="small"
              color="#004B32"
              style={{ marginVertical: 10 }}
            />
          ) : contactos.length === 0 ? (
            <Text style={styles.emptyText}>
              No tienes números de contacto registrados.
            </Text>
          ) : (
            contactos.map((contact) => (
              <View key={contact.id} style={styles.itemBox}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={styles.contactTypeLabel}>
                    {contact.type.toLowerCase().includes("whatsapp")
                      ? "🟢"
                      : "📞"}{" "}
                    {contact.type}:
                  </Text>
                  <Text style={styles.itemBoxText}>{contact.phoneNumber}</Text>
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => openEditContactModal(contact)}
                  >
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteContact(contact.id)}
                  >
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* ==========================================
              NUEVO SUB-BLOQUE: MÉTODOS DE PAGO UI
             ========================================== */}
          <View
            style={[styles.subBlockHeader, { marginTop: 20, marginBottom: 8 }]}
          >
            <Text style={styles.labelTitle}>Métodos de Pago</Text>
            <TouchableOpacity onPress={openCreatePaymentModal}>
              <Text style={styles.addText}>+ Agregar método</Text>
            </TouchableOpacity>
          </View>

          {loadingPayments ? (
            <ActivityIndicator
              size="small"
              color="#004B32"
              style={{ marginVertical: 10 }}
            />
          ) : metodosPago.length === 0 ? (
            <Text style={styles.emptyText}>
              No tienes formas de pago registradas.
            </Text>
          ) : (
            metodosPago.map((pm) => (
              <View key={pm.id} style={styles.itemBox}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text style={styles.contactTypeLabel}>
                    {pm.provider.toLowerCase().includes("tarjeta")
                      ? "💳"
                      : "💵"}{" "}
                    {pm.provider}
                  </Text>
                  {pm.lastFourDigits && pm.lastFourDigits.trim() !== "" ? (
                    <Text style={styles.itemBoxText}>
                      (•••• {pm.lastFourDigits})
                    </Text>
                  ) : null}
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity onPress={() => openEditPaymentModal(pm)}>
                    <Text style={styles.editText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePayment(pm.id)}>
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* BLOQUE 4: SEGURIDAD Y CUENTA */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeaderTitle, { color: "#dc3545" }]}>
            🔒 Seguridad y Cuenta
          </Text>
          <View style={styles.divider} />

          <Text style={[styles.labelTitle, { marginBottom: 12 }]}>
            Modificar Contraseña
          </Text>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Text style={styles.passwordButtonText}>
              Cambiar Contraseña por Correo
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { marginVertical: 20 }]} />

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await tokenStorage.removeToken();
              alert("Sesión cerrada.");
            }}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión Activa</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- REPOSITORIO DE MODALES --- */}
      <PasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />

      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSave={handleSaveOrUpdateAddress}
        addressToEdit={selectedAddress}
      />

      <ContactModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
        onSave={handleSaveOrUpdateContact}
        contactToEdit={selectedContact}
      />

      <PaymentMethodModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSave={handleSaveOrUpdatePayment}
        paymentToEdit={selectedPayment}
      />
    </View>
  );
}

// ==========================================
//                ESTILOS UI
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F5" },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
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
  divider: { height: 1, backgroundColor: "#E2E8E5", marginVertical: 12 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarImagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#004B32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarText: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  avatarButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F4F7F5",
    borderRadius: 20,
    marginTop: 4,
  },
  avatarButtonText: { color: "#00C252", fontSize: 14, fontWeight: "600" },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#004B32", marginBottom: 6 },
  input: {
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#004B32",
  },
  inlineRow: { flexDirection: "row", gap: 8 },
  inlineButton: {
    backgroundColor: "#004B32",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inlineButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  subBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  labelTitle: { fontSize: 15, fontWeight: "bold", color: "#004B32" },
  addText: { color: "#00C252", fontSize: 13, fontWeight: "700" },
  itemBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8E5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  itemBoxText: { fontSize: 14, color: "#333333" },
  contactTypeLabel: { fontSize: 14, fontWeight: "700", color: "#6A7C75" },
  emptyText: { color: "#6A7C75", fontStyle: "italic", marginVertical: 8 },
  actionButtonsContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    minWidth: 60,
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
  editText: { color: "#004B32", fontSize: 13, fontWeight: "700" },
  deleteText: { color: "#DC3545", fontSize: 13, fontWeight: "600" },
  passwordButton: {
    backgroundColor: "#004B32",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 6,
  },
  passwordButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  logoutButton: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FEB2B2",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  logoutButtonText: { color: "#DC3545", fontSize: 15, fontWeight: "bold" },
});
