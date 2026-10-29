import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { colorDeNivel, ordenDeNivel } from '../../constants/niveles';

type Stats = { totalEnEspera: number; enSala?: number; enCamino?: number; niveles: Record<string, number> };

export default function AmbulanciaDetalleHospital() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hospital, setHospital] = useState<{ id: string; nombre: string; direccion: string } | null>(null);
  const [stats, setStats] = useState<Stats>({ totalEnEspera: 0, niveles: {} });
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!id) return;
    try {
      const [resH, resS] = await Promise.all([
        fetch(`${API_URL}/hospitales/${id}`),
        fetch(`${API_URL}/hospitales/${id}/stats`),
      ]);
      if (resH.ok) setHospital(await resH.json());
      if (resS.ok) setStats(await resS.json());
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(cargar, 20000);
      return () => clearInterval(intervalo);
    }, [cargar])
  );

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.emergencia} />
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No se encontró el hospital.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.emergencia }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  const criticos = stats.niveles['Emergencia'] ?? 0;
  const urgentes = stats.niveles['Urgente'] ?? 0;
  const niveles = Object.entries(stats.niveles).sort(([a], [b]) => ordenDeNivel(a) - ordenDeNivel(b));

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
              <Text style={styles.statValor}>{stats.totalEnEspera}</Text>
              <Text style={styles.statLabel}>Total en guardia</Text>
            </View>
          </View>

          <Text style={styles.seccion}>Ocupación por nivel</Text>
          <View style={styles.nivelesContainer}>
            {niveles.map(([nombre, cantidad], index) => (
              <View key={nombre} style={[styles.nivelRow, index === niveles.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.nivelLeft}>
                  <View style={[styles.dot, { backgroundColor: colorDeNivel(nombre) }]} />
                  <Text style={styles.nivelNombre}>{nombre}</Text>
                </View>
                <Text style={styles.nivelInfo}>{cantidad} pac.</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.ingresoBtn}
          onPress={() => router.push({ pathname: '/ambulancia/ingresoPaciente', params: { id: hospital.id } })}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.ingresoTexto}>Cargar paciente y notificar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: Colors.emergencia, paddingHorizontal: 24, paddingTop: 50, paddingBottom: 28,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  direccion: { fontSize: 14, color: '#FECACA', marginTop: 6 },
  body: { paddingHorizontal: 24, marginTop: 24 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1, alignItems: 'center', backgroundColor: Colors.emergenciaLight, paddingVertical: 14,
    borderRadius: 12, borderWidth: 1, borderColor: '#FECACA',
  },
  statValor: { fontSize: 24, fontWeight: 'bold', color: Colors.emergencia },
  statLabel: { fontSize: 11, color: Colors.textLight, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  seccion: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 28, marginBottom: 12 },
  nivelesContainer: { borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.border },
  nivelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  nivelLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  nivelNombre: { fontSize: 15, fontWeight: '600', color: Colors.text },
  nivelInfo: { fontSize: 13, color: Colors.textLight },
  ingresoBtn: {
    flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.emergencia, borderRadius: 12, paddingVertical: 16, marginHorizontal: 24, marginTop: 32,
  },
  ingresoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});