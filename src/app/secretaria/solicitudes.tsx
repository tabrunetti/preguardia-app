import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
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
  estado: string;
  fechaCreacion: string;
  tipoIncidente: string | null;
};

const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

export default function SolicitudesPendientes() {
  const [solicitudes, setSolicitudes] = useState<Turno[]>([]);
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
      const res = await fetch(`${API_URL}/turnos/hospital/${hospitalId}?estados=Pendiente`);
      if (!res.ok) throw new Error();
      const data: Turno[] = await res.json();
      data.sort(
        (a, b) =>
          ordenDeNivel(a.nivel) - ordenDeNivel(b.nivel) ||
          new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
      );
      setSolicitudes(data);
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Carga al entrar y se actualiza cada 20 s mientras la pestaña está abierta
  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(cargar, 20000);
      return () => clearInterval(intervalo);
    }, [cargar])
  );

  const cambiarEstado = async (t: Turno, estado: 'Activo' | 'Cancelado') => {
    const ok =
      estado === 'Activo'
        ? await confirmar('Confirmar llegada', `¿${t.pacienteNombre} ya está en la guardia? Pasará a la sala de espera.`, 'Confirmar')
        : await confirmar('Marcar como ausente', `¿Cancelar el pre-registro de ${t.pacienteNombre}?`, 'Sí, cancelar', true);
    if (!ok) return;

    setProcesando(t.id);
    try {
      const res = await fetch(`${API_URL}/turnos/${t.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      setSolicitudes((prev) => prev.filter((x) => x.id !== t.id));
    } catch {
      avisar('Error', 'No se pudo actualizar la solicitud.');
    } finally {
      setProcesando(null);
    }
  };

  const renderItem = ({ item }: { item: Turno }) => {
    const color = colorDeNivel(item.nivel, item.color);
    const ocupado = procesando === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <Text style={styles.pacienteNombre}>{item.pacienteNombre}</Text>
            {item.tipoIncidente && (
              <View style={styles.ambulanciaTag}>
                <Ionicons name="medkit" size={12} color={Colors.danger} />
                <Text style={styles.ambulanciaTexto}>Ambulancia en camino</Text>
              </View>
            )}
          <Text style={styles.dni}>DNI {item.pacienteDni}</Text>
          <Text style={styles.pacienteMotivo}>{item.motivo}</Text>
          <Text style={styles.tiempo}>Pre-registro: {hora(item.fechaCreacion)}</Text>

          <View style={[styles.badge, { backgroundColor: color + '20' }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{item.nivel}</Text>
          </View>
        </View>

        <View style={styles.acciones}>
          {ocupado ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <>
              <Pressable style={styles.btnLlegada} onPress={() => cambiarEstado(item, 'Activo')}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.btnLlegadaTexto}>Llegó</Text>
              </Pressable>
              <Pressable style={styles.btnAusente} onPress={() => cambiarEstado(item, 'Cancelado')}>
                <Text style={styles.btnAusenteTexto}>Ausente</Text>
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
        <Text style={styles.tituloPrincipal}>Solicitudes Pendientes</Text>
        <Text style={styles.subtitulo}>
          {cargando ? 'Cargando...' : `${solicitudes.length} pacientes en camino`}
        </Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={solicitudes}
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
              <Text style={styles.emptyText}>{error ?? 'No hay solicitudes pendientes.'}</Text>
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
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12, gap: 12,
  },
  cardBody: { flex: 1 },
  pacienteNombre: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  dni: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
  pacienteMotivo: { fontSize: 13, color: Colors.text, marginBottom: 4 },
  tiempo: { fontSize: 12, color: Colors.textLight, marginBottom: 10 },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },

  acciones: { gap: 8, alignItems: 'stretch', minWidth: 90 },
  btnLlegada: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: Colors.success, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10,
  },
  btnLlegadaTexto: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnAusente: { alignItems: 'center', paddingVertical: 6 },
  btnAusenteTexto: { color: Colors.danger, fontWeight: '600', fontSize: 12 },
  ambulanciaTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: Colors.danger + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 4,
  },
  ambulanciaTexto: { fontSize: 11, fontWeight: 'bold', color: Colors.danger },
});