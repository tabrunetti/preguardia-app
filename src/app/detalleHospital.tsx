import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_URL } from '../constants/api';
import { Colors } from '../constants/colors';
import { colorDeNivel, ordenDeNivel } from '../constants/niveles';

type Stats = {
  totalEnEspera: number;
  enSala: number;
  enCamino: number;
  demoraEstimadaMinutos: number;
  niveles: Record<string, number>;
};

const STATS_VACIAS: Stats = { totalEnEspera: 0, enSala: 0, enCamino: 0, demoraEstimadaMinutos: 0, niveles: {} };

export default function DetalleHospital() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [hospital, setHospital] = useState<any>(null);
  const [stats, setStats] = useState<Stats>(STATS_VACIAS);
  const [cargando, setCargando] = useState(true);

  const cargarStats = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/hospitales/${id}/stats`);
      setStats(res.ok ? await res.json() : STATS_VACIAS);
    } catch {
      setStats(STATS_VACIAS);
    }
  }, [id]);

  // Al entrar: hospital + stats. Mientras está abierta: stats cada 20 s
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        if (!id) return;
        try {
          const res = await fetch(`${API_URL}/hospitales/${id}`);
          if (!res.ok) throw new Error('No se pudo cargar el hospital');
          const data = await res.json();
          if (!cancelado) setHospital(data);
          await cargarStats();
        } catch (error) {
          console.error(error);
        } finally {
          if (!cancelado) setCargando(false);
        }
      })();

      const intervalo = setInterval(cargarStats, 20000);
      return () => {
        cancelado = true;
        clearInterval(intervalo);
      };
    }, [id, cargarStats])
  );

  const abrirMapa = () => {
    if (!hospital?.lat || !hospital?.lon) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${hospital.nombre}@${hospital.lat},${hospital.lon}`,
      android: `geo:0,0?q=${hospital.lat},${hospital.lon}(${hospital.nombre})`,
      default: `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`,
    });
    if (url) Linking.openURL(url);
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No se encontró el hospital.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const casosGraves = (stats.niveles['Emergencia'] ?? 0) + (stats.niveles['Urgente'] ?? 0);
  const gravedad = casosGraves > 0 ? 'Alta' : stats.totalEnEspera > 0 ? 'Media' : 'Baja';
  const colorGravedad = gravedad === 'Alta' ? Colors.danger : gravedad === 'Media' ? Colors.warning : Colors.success;

  const nivelesOrdenados = Object.entries(stats.niveles).sort(([a], [b]) => ordenDeNivel(a) - ordenDeNivel(b));

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.imageContainer}>
        {hospital.imagen ? (
          <Image source={{ uri: hospital.imagen }} style={styles.headerImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="business" size={60} color={Colors.border} />
          </View>
        )}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.nombre}>{hospital.nombre}</Text>
        <Text style={styles.direccion}>📍 {hospital.direccion}</Text>

        <Pressable onPress={abrirMapa} style={styles.mapaLink}>
          <Ionicons name="map" size={16} color={Colors.primary} />
          <Text style={styles.mapaTexto}>Ir a mapas</Text>
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.primary }]}>{stats.totalEnEspera}</Text>
            <Text style={styles.statLabel}>En espera</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.warning }]}>{stats.demoraEstimadaMinutos} min</Text>
            <Text style={styles.statLabel}>Est. demora</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: colorGravedad }]}>{gravedad}</Text>
            <Text style={styles.statLabel}>Gravedad</Text>
          </View>
        </View>

        {stats.enCamino > 0 && (
          <Text style={styles.detalleEspera}>
            + {stats.enCamino} {stats.enCamino === 1 ? 'paciente en camino' : 'pacientes en camino'}
          </Text>
        )}

        <Text style={styles.seccion}>Estado actual de la Guardia (por nivel)</Text>

        <View style={styles.nivelesContainer}>
          {nivelesOrdenados.map(([nivelNombre, cantidad], index, array) => (
            <View key={nivelNombre} style={[styles.nivelRow, index === array.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.nivelLeft}>
                <View style={[styles.dot, { backgroundColor: colorDeNivel(nivelNombre) }]} />
                <Text style={styles.nivelNombre}>{nivelNombre}</Text>
              </View>
              <Text style={styles.nivelInfo}>{cantidad} pac.</Text>
            </View>
          ))}

          {nivelesOrdenados.length === 0 && (
            <View style={[styles.nivelRow, { borderBottomWidth: 0, justifyContent: 'center' }]}>
              <Text style={styles.nivelInfo}>Sin pacientes en espera</Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        style={styles.preRegistroBtn}
        onPress={() => router.push({ pathname: '/preRegistro', params: { id: hospital.id } })}
      >
        <Text style={styles.preRegistroTexto}>Pre-registrarme en este hospital</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageContainer: { height: 220, width: '100%', position: 'relative' },
  headerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  backButton: {
    position: 'absolute', top: 50, left: 20, width: 40, height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  body: { paddingHorizontal: 24, marginTop: 20 },
  nombre: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  direccion: { fontSize: 14, color: Colors.textLight, marginTop: 6 },
  mapaLink: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  mapaTexto: { fontSize: 14, color: Colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  statBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface,
    paddingVertical: 14, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  statValor: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  statLabel: { fontSize: 11, color: Colors.textLight, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  detalleEspera: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 10 },
  seccion: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 32, marginBottom: 16 },
  nivelesContainer: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border,
  },
  nivelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  nivelLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  nivelNombre: { fontSize: 15, fontWeight: '600', color: Colors.text },
  nivelInfo: { fontSize: 13, color: Colors.textLight },
  preRegistroBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    marginHorizontal: 24, marginTop: 32, marginBottom: 40,
  },
  preRegistroTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});