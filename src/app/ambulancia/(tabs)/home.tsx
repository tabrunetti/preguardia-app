import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../../constants/api';
import { Colors } from '../../../constants/colors';

type Stats = { totalEnEspera: number; niveles: Record<string, number> };
type Hospital = {
  id: string;
  nombre: string;
  direccion: string;
  lat: number | null;
  lon: number | null;
  stats: Stats;
};

const STATS_VACIAS: Stats = { totalEnEspera: 0, niveles: {} };

const estadoGuardia = (s: Stats) => {
  const graves = (s.niveles['Emergencia'] ?? 0) + (s.niveles['Urgente'] ?? 0);
  if (graves >= 3 || s.totalEnEspera >= 10) return { texto: 'Saturada', color: Colors.emergencia };
  if (graves > 0 || s.totalEnEspera >= 4) return { texto: 'Moderada', color: Colors.warning };
  return { texto: 'Disponible', color: Colors.success };
};

const distanciaKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function AmbulanciaHome() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [hospitales, setHospitales] = useState<Hospital[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        setUbicacion({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        // Sin ubicación: se muestran sin distancia
      }
    })();
  }, []);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/hospitales`);
      if (!res.ok) throw new Error();
      const lista: Omit<Hospital, 'stats'>[] = await res.json();

      const conStats = await Promise.all(
        lista.map(async (h) => {
          try {
            const r = await fetch(`${API_URL}/hospitales/${h.id}/stats`);
            return { ...h, stats: r.ok ? await r.json() : STATS_VACIAS };
          } catch {
            return { ...h, stats: STATS_VACIAS };
          }
        })
      );
      setHospitales(conStats);
    } catch {
      setError('No se pudieron cargar los hospitales.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(cargar, 30000);
      return () => clearInterval(intervalo);
    }, [cargar])
  );

  const distanciaDe = (h: Hospital) =>
    ubicacion && h.lat != null && h.lon != null
      ? distanciaKm(ubicacion.latitude, ubicacion.longitude, h.lat, h.lon)
      : null;

  const filtrados = hospitales
    .filter((h) => h.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => (distanciaDe(a) ?? Infinity) - (distanciaDe(b) ?? Infinity));

  const renderItem = ({ item }: { item: Hospital }) => {
    const criticos = item.stats.niveles['Emergencia'] ?? 0;
    const urgentes = item.stats.niveles['Urgente'] ?? 0;
    const estado = estadoGuardia(item.stats);
    const km = distanciaDe(item);

    return (
      <Pressable
        style={[styles.card, { borderLeftColor: estado.color }]}
        onPress={() => router.push({ pathname: '/ambulancia/detalleHospital', params: { id: item.id } })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitulo}>{item.nombre}</Text>
          <View style={[styles.badge, { backgroundColor: estado.color + '22' }]}>
            <Text style={[styles.badgeText, { color: estado.color }]}>{estado.texto}</Text>
          </View>
        </View>
        <Text style={styles.cardDireccion}>{item.direccion}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoItem}>
            <Ionicons name="navigate-outline" size={16} color={Colors.emergencia} />
            <Text style={styles.infoTexto}>{km != null ? `${km.toFixed(1)} km` : '—'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="pulse-outline" size={16} color={Colors.emergencia} />
            <Text style={styles.infoTexto}>{criticos} críticos</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="alert-circle-outline" size={16} color={Colors.emergencia} />
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
        <Text style={styles.headerTitulo}>Seleccioná el hospital de destino</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Buscar hospital"
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={Colors.emergencia} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
          ListHeaderComponent={
            <Text style={styles.seccion}>{ubicacion ? 'Guardias más cercanas' : 'Guardias disponibles'}</Text>
          }
          ListEmptyComponent={
            <Text style={styles.vacio}>{error ?? 'No se encontraron hospitales.'}</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: Colors.emergencia, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerUnidad: { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitulo: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },
  lista: { paddingHorizontal: 20, paddingBottom: 20 },
  seccion: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 20, marginBottom: 12 },
  vacio: { textAlign: 'center', color: Colors.textLight, marginTop: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1,
    borderColor: Colors.border, borderLeftWidth: 5, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardDireccion: { fontSize: 13, color: Colors.textLight, marginTop: 6, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1,
    borderTopColor: Colors.emergenciaLight, paddingTop: 12,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoTexto: { fontSize: 13, color: Colors.text, fontWeight: '500' },
});