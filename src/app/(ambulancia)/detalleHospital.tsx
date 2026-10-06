import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { HOSPITALES } from "../../data/hospitals";

export default function AmbulanciaDetalleHospital() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  const criticos =
    hospital.niveles.find((n) => n.nivel === "Emergencia")?.pacientes ?? 0;
  const urgentes =
    hospital.niveles.find((n) => n.nivel === "Urgente")?.pacientes ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.emergencia} />
          </Pressable>
          <Text style={styles.nombre}>{hospital.nombre}</Text>
          <Text style={styles.direccion}>📍 {hospital.direccion}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValor}>{criticos}</Text>
              <Text style={styles.statLabel}>Críticos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValor}>{urgentes}</Text>
              <Text style={styles.statLabel}>Urgentes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValor}>{hospital.enEspera}</Text>
              <Text style={styles.statLabel}>Total en guardia</Text>
            </View>
          </View>

          <Text style={styles.seccion}>Ocupación por nivel</Text>
          <View style={styles.nivelesContainer}>
            {hospital.niveles.map((n, index) => (
              <View
                key={n.nivel}
                style={[
                  styles.nivelRow,
                  index === hospital.niveles.length - 1 && {
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <View style={styles.nivelLeft}>
                  <View style={[styles.dot, { backgroundColor: n.color }]} />
                  <Text style={styles.nivelNombre}>{n.nivel}</Text>
                </View>
                <Text style={styles.nivelInfo}>{n.pacientes} pac.</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.ingresoBtn}
          onPress={() =>
            router.push({
              pathname: "/ambulancia/ingresoPaciente",
              params: { id: hospital.id },
            })
          }
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.ingresoTexto}>Cargar paciente y notificar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: Colors.emergencia,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  nombre: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  direccion: { fontSize: 14, color: "#FECACA", marginTop: 6 },
  body: { paddingHorizontal: 24, marginTop: 24 },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.emergenciaLight,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  statValor: { fontSize: 24, fontWeight: "bold", color: Colors.emergencia },
  statLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  seccion: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 28,
    marginBottom: 12,
  },
  nivelesContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nivelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nivelLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  nivelNombre: { fontSize: 15, fontWeight: "600", color: Colors.text },
  nivelInfo: { fontSize: 13, color: Colors.textLight },
  ingresoBtn: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.emergencia,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 24,
    marginTop: 32,
  },
  ingresoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
