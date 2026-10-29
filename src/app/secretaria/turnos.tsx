import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { colorDeNivel, ordenDeNivel } from '../../constants/niveles';
import { avisar, confirmar } from '../../utils/alertas';
import { obtenerSesion } from '../../utils/sesion';

type Turno = {
  id: number;
  pacienteNombre: string;
  pacienteDni: string;
  motivo: string;
  nivel: string;
  color: string | null;
  fechaCreacion: string;
};

const minutosDesde = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

export default function SecretariaSalaEspera() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const { hospitalId } = await obtenerSesion();
      if (!hospitalId) {
        setError('Tu cuenta no tiene hospital asignado.');
        return;
      }
      const res = await fetch(`${API_URL}/turnos/hospital/${hospitalId}?estados=Activo`);
      if (!res.ok) throw new Error();
      const data: Turno[] = await res.json();
      // Primero por prioridad, después por orden de llegada
      data.sort(
        (a, b) =>
          ordenDeNivel(a.nivel) - ordenDeNivel(b.nivel) ||
          new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
      );
      setPacientes(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(cargar, 20000);
      return () => clearInterval(intervalo);
    }, [cargar])
  );

  const handleAtender = async (t: Turno) => {
    const ok = await confirmar('Paciente atendido', `¿Confirmar que ${t.pacienteNombre} ya ingresó al consultorio?`, 'Sí, confirmar');
    if (!ok) return;

    setProcesando(t.id);
    try {
      const res = await fetch(`${API_URL}/turnos/${t.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Finalizado' }),
      });
      if (!res.ok) throw new Error();
      setPacientes((prev) => prev.filter((p) => p.id !== t.id));
    } catch {
      avisar('Error', 'No se pudo marcar como atendido.');
    } finally {
      setProcesando(null);
    }
  };

  const renderItem = ({ item, index }: { item: Turno; index: number }) => {
    const color = colorDeNivel(item.nivel, item.color);
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <Text style={styles.posicion}>#{index + 1}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.pacienteNombre}>{item.pacienteNombre}</Text>
          <Text style={styles.pacienteMotivo}>{item.motivo}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.badgeText, { color }]}>{item.nivel}</Text>
            </View>
            <Text style={styles.espera}>{minutosDesde(item.fechaCreacion)} min</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {procesando === item.id ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Pressable
                style={styles.infoBtn}
                onPress={() => router.push({ pathname: '/secretaria/fichaEditable', params: { id: String(item.id) } })}
              >
                <Ionicons name="create-outline" size={22} color={Colors.primary} />
              </Pressable>
              <Pressable style={styles.atenderBtn} onPress={() => handleAtender(item)}>
                <Ionicons name="checkmark-circle-outline" size={22} color={Colors.success} />
              </Pressable>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>Sala de Espera</Text>
        <Text style={styles.subtitulo}>{cargando ? 'Cargando...' : `${pacientes.length} pacientes en cola`}</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={error ? 'cloud-offline-outline' : 'checkmark-done-circle-outline'}
                size={60}
                color={Colors.textLight}
              />
              <Text style={styles.emptyText}>{error ?? 'La sala de espera está vacía.'}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20,
  },
  tituloPrincipal: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: Colors.textLight, marginTop: 12, textAlign: 'center' },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  cardLeft: { width: 40, alignItems: 'center', justifyContent: 'center' },
  posicion: { fontSize: 18, fontWeight: 'bold', color: Colors.textLight },
  cardBody: { flex: 1, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: Colors.border, paddingRight: 8 },
  pacienteNombre: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  pacienteMotivo: { fontSize: 13, color: Colors.textLight, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  espera: { fontSize: 12, color: Colors.textLight },
  actionsContainer: { flexDirection: 'column', gap: 8 },
  infoBtn: {
    padding: 8, backgroundColor: Colors.primary + '15', borderRadius: 10, borderWidth: 1,
    borderColor: Colors.primary + '40', alignItems: 'center',
  },
  atenderBtn: {
    padding: 8, backgroundColor: Colors.success + '15', borderRadius: 10, borderWidth: 1,
    borderColor: Colors.success + '40', alignItems: 'center',
  },
});