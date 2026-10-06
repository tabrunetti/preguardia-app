import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";
import { HOSPITALES } from "../../data/hospitals";

export default function ConfirmacionTraslado() {
  const router = useRouter();
  const { id, paciente, prioridad, eta, incidente } = useLocalSearchParams<{
    id: string;
    paciente: string;
    prioridad: string;
    eta: string;
    incidente: string;
  }>();
  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  const Fila = ({ label, valor }: { label: string; valor?: string }) => (
    <View style={styles.fila}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValor}>{valor || "No informado"}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icono}>
          <Ionicons name="checkmark" size={56} color={Colors.emergencia} />
        </View>
        <Text style={styles.titulo}>Hospital notificado</Text>
        <Text style={styles.subtitulo}>
          La guardia de {hospital.nombre} ya recibió los datos y se está
          preparando para el ingreso.
        </Text>

        <View style={styles.card}>
          <Fila label="Paciente" valor={paciente} />
          <Fila label="Incidente" valor={incidente} />
          <Fila label="Prioridad" valor={prioridad} />
          <Fila
            label="Llegada estimada"
            valor={eta ? `~${eta} min` : undefined}
          />
        </View>

        <Pressable
          style={styles.finalizarBtn}
          onPress={() => router.replace("/ambulancia/home")}
        >
          <Text style={styles.finalizarTexto}>Finalizar traslado</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.emergencia },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  icono: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  titulo: { fontSize: 26, fontWeight: "bold", color: "#fff" },
  subtitulo: {
    fontSize: 15,
    color: "#FECACA",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.emergenciaLight,
  },
  filaLabel: { fontSize: 14, color: Colors.textLight },
  filaValor: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  finalizarBtn: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  finalizarTexto: {
    color: Colors.emergencia,
    fontWeight: "bold",
    fontSize: 16,
  },
});
