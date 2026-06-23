import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Definimos las propiedades que puede recibir nuestro componente
interface FormAlertsProps {
  errors?: string[];
  success?: string | null;
}

export default function FormAlerts({
  errors = [],
  success = null,
}: FormAlertsProps) {
  // Si no hay errores ni mensajes de éxito, no renderizamos absolutamente nada
  if (errors.length === 0 && !success) return null;

  return (
    <View style={styles.alertsContainer}>
      {/* Mapeo de errores individuales */}
      {errors.map((error, index) => (
        <View key={index} style={styles.errorCard}>
          <View style={styles.errorLeftBorder} />
          <Feather
            name="x-circle"
            size={20}
            color="#F44336"
            style={styles.alertIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ))}

      {/* Alerta de Éxito */}
      {success && (
        <View style={styles.successCard}>
          <View style={styles.successLeftBorder} />
          <Feather
            name="check-circle"
            size={20}
            color="#00C252"
            style={styles.alertIcon}
          />
          <Text style={styles.successText}>{success}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  alertsContainer: {
    marginBottom: 8,
    width: "100%",
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  errorLeftBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#F44336",
  },
  errorText: {
    fontSize: 13,
    color: "#4A5560",
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E2E8E5",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  successLeftBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#00C252",
  },
  successText: {
    fontSize: 13,
    color: "#004B32",
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  alertIcon: {
    marginRight: 10,
    marginLeft: 4,
  },
});
