import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { Colors } from "../../../constants/colors";

const PROFESIONAL = {
  nombre: "Dra. Valeria Méndez",
  dni: "30.456.789",
  email: "vmendez@same.gob.ar",
  telefono: "+54 9 11 4567 8910",
};

const Fila = ({
  icono,
  label,
  valor,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  valor: string;
}) => (
  <View style={styles.fila}>
    <Ionicons name={icono} size={18} color={Colors.emergencia} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValor}>{valor}</Text>
    </View>
  </View>
);

export default function PerfilAmbulancia() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.emergencia} />
          </View>
          <Text style={styles.nombre}>{PROFESIONAL.nombre}</Text>
        </View>

        <View style={styles.body}>
        
          <Text style={styles.seccion}>Datos personales</Text>
          <View style={styles.card}>
            <Fila
              icono="person-outline"
              label="Nombre"
              valor={PROFESIONAL.nombre}
            />
            <Fila icono="card-outline" label="DNI" valor={PROFESIONAL.dni} />
          </View>

          <Text style={styles.seccion}>Contacto</Text>
          <View style={styles.card}>
            <Fila
              icono="mail-outline"
              label="Email"
              valor={PROFESIONAL.email}
            />
            
          </View>


          <Pressable
            style={styles.logoutBtn}
            onPress={() => router.replace("/")}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={Colors.emergencia}
            />
            <Text style={styles.logoutTexto}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: Colors.emergencia,
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 28,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  nombre: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  body: { paddingHorizontal: 24 },
  seccion: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.emergenciaLight,
  },
  filaLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  filaValor: { fontSize: 15, fontWeight: "500", color: Colors.text },
  editarBtn: {
    borderWidth: 1.5,
    borderColor: Colors.emergencia,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  editarTexto: { color: Colors.emergencia, fontWeight: "bold", fontSize: 15 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  logoutTexto: { color: Colors.emergencia, fontSize: 16, fontWeight: "bold" },
});
