import { Ionicons } from "@expo/vector-icons";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../constants/colors";

type Traslado = {
  id: string;
  fecha: string;
  hora: string;
  hospital: string;
  paciente: string;
  incidente: string;
  prioridad: "Rojo" | "Naranja" | "Amarillo" | "Verde";
  estado: "Entregado" | "Cancelado";
  duracion: string;
};

const COLOR_PRIORIDAD: Record<Traslado["prioridad"], string> = {
  Rojo: "#DC2626",
  Naranja: "#F97316",
  Amarillo: "#F59E0B",
  Verde: "#16A34A",
};

const TRASLADOS_MOCK: Traslado[] = [
  {
    id: "1",
    fecha: "Hoy",
    hora: "14:32",
    hospital: "Hosp. Dr. Cosme Argerich",
    paciente: "NN (no identificado)",
    incidente: "Trauma - Accidente de tránsito",
    prioridad: "Rojo",
    estado: "Entregado",
    duracion: "12 min",
  },
  {
    id: "2",
    fecha: "Hoy",
    hora: "11:05",
    hospital: "Hospital General de Agudos",
    paciente: "Marta G., 78 años",
    incidente: "Trauma - Caída de propia altura",
    prioridad: "Amarillo",
    estado: "Entregado",
    duracion: "18 min",
  },
  {
    id: "3",
    fecha: "Hoy",
    hora: "08:47",
    hospital: "Hospital de Clínicas José de San Martín",
    paciente: "Carlos R., 56 años",
    incidente: "Cardiovascular - Dolor torácico",
    prioridad: "Naranja",
    estado: "Entregado",
    duracion: "15 min",
  },
  {
    id: "4",
    fecha: "Ayer",
    hora: "22:14",
    hospital: "Hosp. Dr. Cosme Argerich",
    paciente: "Lucía P., 24 años",
    incidente: "Neurológico - Convulsión",
    prioridad: "Naranja",
    estado: "Entregado",
    duracion: "10 min",
  },
  {
    id: "5",
    fecha: "Ayer",
    hora: "19:30",
    hospital: "Hospital General de Agudos",
    paciente: "Sin datos de identidad",
    incidente: "Trauma - Choque de baja energía",
    prioridad: "Verde",
    estado: "Cancelado",
    duracion: "—",
  },
];

export default function Traslados() {
  const deHoy = TRASLADOS_MOCK.filter((t) => t.fecha === "Hoy");
  const criticosHoy = deHoy.filter((t) => t.prioridad === "Rojo").length;

  const renderItem = ({ item }: { item: Traslado }) => {
    const color = COLOR_PRIORIDAD[item.prioridad];
    const cancelado = item.estado === "Cancelado";

    return (
      <View
        style={[
          styles.card,
          { borderLeftColor: color },
          cancelado && styles.cardCancelado,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.fechaContainer}>
            <Ionicons name="time-outline" size={15} color={Colors.textLight} />
            <Text style={styles.fecha}>
              {item.fecha} · {item.hora}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + "22" }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{item.prioridad}</Text>
          </View>
        </View>

        <Text style={styles.hospital}>{item.hospital}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color={Colors.emergencia} />
          <Text style={styles.infoTexto}>{item.paciente}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="medkit-outline" size={15} color={Colors.emergencia} />
          <Text style={styles.infoTexto}>{item.incidente}</Text>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.estado,
              cancelado ? styles.estadoCancelado : styles.estadoEntregado,
            ]}
          >
            {item.estado}
          </Text>
          <Text style={styles.duracion}>Duración: {item.duracion}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Traslados</Text>
        <Text style={styles.subtitulo}>Historial de la unidad</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{deHoy.length}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{criticosHoy}</Text>
            <Text style={styles.statLabel}>Críticos hoy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValor}>{TRASLADOS_MOCK.length}</Text>
            <Text style={styles.statLabel}>Esta semana</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={TRASLADOS_MOCK}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: Colors.emergencia,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  subtitulo: { fontSize: 14, color: "#FECACA", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statValor: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  statLabel: {
    fontSize: 11,
    color: "#FECACA",
    marginTop: 2,
    fontWeight: "500",
  },
  lista: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 5,
  },
  cardCancelado: { opacity: 0.6 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fechaContainer: { flexDirection: "row", alignItems: "center", gap: 5 },
  fecha: { fontSize: 13, color: Colors.textLight, fontWeight: "600" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  hospital: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoTexto: { fontSize: 14, color: Colors.text, flex: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.emergenciaLight,
    paddingTop: 10,
    marginTop: 6,
  },
  estado: { fontSize: 13, fontWeight: "bold" },
  estadoEntregado: { color: Colors.success },
  estadoCancelado: { color: Colors.textLight },
  duracion: { fontSize: 13, color: Colors.textLight },
});
