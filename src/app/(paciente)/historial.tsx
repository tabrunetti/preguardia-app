import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

const API_URL = 'http://172.28.96.1:3000/api';

type TurnoHistorial = {
  id: number;
  motivo: string;
  nivel: string;
  color: string | null;
  estado: string;
  fechaCreacion: string;
  fechaAtencion: string | null;
  hospital: { id: string; nombre: string; direccion: string };
};

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function HistorialScreen() {
  const [turnos, setTurnos] = useState<TurnoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    try {
      setError(null);
      const id = await AsyncStorage.getItem('usuarioId');
      if (!id) {
        setError('No se encontró la sesión. Volvé a iniciar sesión.');
        setTurnos([]);
        return;
      }
      const res = await fetch(`${API_URL}/turnos/paciente/${id}/historial`);
      if (!res.ok) throw new Error();
      setTurnos(await res.json());
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  const renderItem = ({ item }: { item: TurnoHistorial }) => {
    const color = item.color ?? Colors.textLight;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.fechaContainer}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
            <Text style={styles.fecha}>{formatearFecha(item.fechaAtencion ?? item.fechaCreacion)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{item.nivel}</Text>
          </View>
        </View>

        <Text style={styles.hospitalNombre}>{item.hospital.nombre}</Text>

        <View style={styles.motivoContainer}>
          <Ionicons name="medical-outline" size={16} color={Colors.primary} />
          <Text style={styles.motivo}>{item.motivo}</Text>
        </View>

          <View style={styles.footer}>
            <View style={styles.estadoRow}>
              <Ionicons
                name={item.estado === 'Cancelado' ? 'close-circle' : 'checkmark-circle'}
                size={16}
                color={item.estado === 'Cancelado' ? Colors.danger : Colors.success}
              />
              <Text
                style={[
                  styles.estadoTexto,
                  { fontWeight: 'bold', color: item.estado === 'Cancelado' ? Colors.danger : Colors.success },
                ]}
              >
                {item.estado}
              </Text>
            </View>
        </View>
      </View>
    );
  };

  const renderVacio = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={error ? 'cloud-offline-outline' : 'document-text-outline'}
        size={56}
        color={Colors.textLight}
      />
      <Text style={styles.emptyTitulo}>{error ? 'Algo salió mal' : 'Sin historial todavía'}</Text>
      <Text style={styles.emptySubtitulo}>
        {error ?? 'Acá vas a ver tus consultas una vez que sean finalizadas.'}
      </Text>
      {error && (
        <Pressable
          style={styles.reintentarBtn}
          onPress={() => {
            setCargando(true);
            cargarHistorial();
          }}
        >
          <Text style={styles.reintentarTexto}>Reintentar</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipalHeader}>Mi Historial</Text>
        <Text style={styles.subtituloHeader}>Tus últimas consultas y pre-registros</Text>
      </View>

      <View style={styles.content}>
        {cargando ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={turnos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={renderVacio}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargarHistorial();
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 24 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fechaContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fecha: { fontSize: 13, color: Colors.textLight, fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  hospitalNombre: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  motivoContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', padding: 10,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  motivo: { fontSize: 14, color: Colors.text, fontWeight: '500', flex: 1 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12,
  },
  estadoTexto: { fontSize: 13, color: Colors.textLight },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitulo: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitulo: { fontSize: 14, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  reintentarBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 20 },
  reintentarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  header: {
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20,
  },
  tituloPrincipalHeader: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  subtituloHeader: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  estadoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});