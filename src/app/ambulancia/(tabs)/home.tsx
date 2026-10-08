import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../../../constants/colors";
import { HOSPITALES, Hospital } from "../../../data/hospitals";

const estadoGuardia = (demora: Hospital["demora"]) => {
  if (demora === "Alta") return { texto: "Saturada", color: Colors.emergencia };
  if (demora === "Media") return { texto: "Moderada", color: Colors.warning };
  return { texto: "Disponible", color: Colors.success };
};

const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1) + " km";
};

export default function AmbulanciaHome() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [ubicacionActual, setUbicacionActual] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUbicacionActual({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const hospitales = HOSPITALES.filter((h) =>
    h.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Hospital }) => {
    const criticos =
      item.niveles.find((n) => n.nivel === "Emergencia")?.pacientes ?? 0;
    const urgentes =
      item.niveles.find((n) => n.nivel === "Urgente")?.pacientes ?? 0;
    const estado = estadoGuardia(item.demora);

    const distancia =
      ubicacionActual && item.lat && item.lon
        ? calcularDistancia(ubicacionActual.latitude, ubicacionActual.longitude, item.lat, item.lon)
        : item.distanciaTiempo;

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/ambulancia/detalleHospital",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitulo}>{item.nombre}</Text>
          <View
            style={[styles.badge, { backgroundColor: estado.color + "22" }]}
          >
            <Text style={[styles.badgeText, { color: estado.color }]}>
              {estado.texto}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDireccion}>{item.direccion}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <Ionicons
              name="navigate-outline"
              size={16}
              color={Colors.emergencia}
            />
            <Text style={styles.infoTexto}>{distancia}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="pulse-outline"
              size={16}
              color={Colors.emergencia}
            />
            <Text style={styles.infoTexto}>{criticos} críticos</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="alert-circle-outline"
              size={16}
              color={Colors.emergencia}
            />
            <Text style={styles.infoTexto}>{urgentes} urgentes</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="medkit" size={22} color="#fff" />
          <Text style={styles.headerUnidad}>Unidad de Emergencias</Text>
        </View>
        <Text style={styles.headerTitulo}>
          Seleccioná el hospital de destino
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.textLight}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.input}
            placeholder="Buscar hospital"
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      <FlatList
        data={hospitales}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.seccion}>Guardias cercanas</Text>
        }
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
  headerTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerUnidad: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headerTitulo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },
  lista: { paddingHorizontal: 20, paddingBottom: 20 },
  seccion: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 5,
    borderLeftColor: Colors.emergencia,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  cardDireccion: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 6,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.emergenciaLight,
    paddingTop: 12,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  infoTexto: { fontSize: 13, color: Colors.text, fontWeight: "500" },
});