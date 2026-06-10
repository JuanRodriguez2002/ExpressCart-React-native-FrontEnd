import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HeaderProps {
  titulo?: string;
}

export default function Header({ titulo = "ExpressCart" }: HeaderProps) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      {/* --- BARRA SUPERIOR --- */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuAbierto(!menuAbierto)}
        >
          <View style={styles.burgerLine} />
          <View style={[styles.burgerLine, { width: 16 }]} />
          <View style={styles.burgerLine} />
        </TouchableOpacity>

        <Text style={styles.brandName}>{titulo}</Text>

        <View style={styles.userBadge}>
          <Text style={styles.userBadgeText}>JR</Text>
        </View>
      </View>

      {/* --- MENÚ HAMBURGUESA LATERAL --- */}
      {menuAbierto && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.closeOverlayArea}
            onPress={() => setMenuAbierto(false)}
          />

          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menú</Text>
              <TouchableOpacity onPress={() => setMenuAbierto(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAbierto(false);
                router.push("/home");
              }}
            >
              <Text style={styles.menuItemIcon}>🏠</Text>
              <Text style={styles.menuItemText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAbierto(false);
                router.push("/cart");
              }}
            >
              <Text style={styles.menuItemIcon}>🛒</Text>
              <Text style={styles.menuItemText}>Mi Carrito / Compras</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAbierto(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuAbierto(false);
                router.push("/supermarkets");
              }}
            >
              <Text style={styles.menuItemIcon}>🏢</Text>
              <Text style={styles.menuItemText}>Mis Supermercados</Text>
            </TouchableOpacity>

            <View style={styles.sidebarDivider} />

            <TouchableOpacity
              style={[styles.menuItem, { marginTop: "auto" }]}
              onPress={() => {
                setMenuAbierto(false);
                router.replace("/");
              }}
            >
              <Text style={[styles.menuItemText, { color: "#dc3545" }]}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E2E8E5",
    zIndex: 10,
  },
  menuButton: {
    width: 30,
    height: 24,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  burgerLine: {
    width: 22,
    height: 3,
    backgroundColor: "#004B32",
    borderRadius: 2,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004B32",
  },
  userBadge: {
    backgroundColor: "#00C252",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  userBadgeText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 75, 50, 0.3)",
    flexDirection: "row",
    zIndex: 999,
  },
  closeOverlayArea: {
    flex: 1,
  },
  sidebar: {
    width: 280,
    backgroundColor: "#FFFFFF",
    height: "100%",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#E2E8E5",
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#004B32",
  },
  closeText: {
    fontSize: 22,
    color: "#6A7C75",
    paddingHorizontal: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 24,
    textAlign: "center",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#004B32",
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#E2E8E5",
    marginVertical: 15,
  },
});
