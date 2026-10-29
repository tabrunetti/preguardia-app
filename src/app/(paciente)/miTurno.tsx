import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

const API_URL = 'http://172.28.96.1:3000/api';

type Turno = {
  id: number;
  pacienteNombre: string;
  motivo: string;
  nivel: string;
  color: string | null;
  estado: string;
  tiempoEstimado: number | null;
  fechaCreacion: string;
  hospital: { id: string; nombre: string; direccion: string };
};

async function obtenerUsuarioId(): Promise<number | null> {
  const id = await AsyncStorage.getItem('usuarioId');
  return id ? Number(id) : null;
}
const avisar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
};
export default function MiTurnoScreen() {
  const [turno, setTurno] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarTurno = useCallback(async () => {
    try {
      setError(null);
      const usuarioId = await obtenerUsuarioId();
      if (!usuarioId) {
        setError('No se encontró la sesión. Volvé a iniciar sesión.');
        setTurno(null);
        return;
      }
      const res = await fetch(`${API_URL}/turnos/paciente/${usuarioId}/activo`);
      if (!res.ok) throw new Error();
      setTurno(await res.json());
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  // Recarga cada vez que se entra a la pestaña
  useFocusEffect(
    useCallback(() => {
      cargarTurno();
    }, [cargarTurno])
  );

    const cambiarEstado = async (estado: 'Activo' | 'Cancelado') => {
    if (!turno) return;
    try {
      const res = await fetch(`${API_URL}/turnos/${turno.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      const actualizado: Turno = await res.json();

      if (estado === 'Cancelado') {
        setTurno(null);
        avisar('Turno cancelado', 'Tu pre-registro fue cancelado. Lo vas a ver en tu historial.');
      } else {
        setTurno(actualizado);
      }
    } catch {
      avisar('Error', 'No se pudo actualizar el turno.');
    }
  };

   const confirmarCancelar = () => {
    const mensaje = '¿Seguro que querés cancelar tu turno?';

    if (Platform.OS === 'web') {
      if (window.confirm(mensaje)) cambiarEstado('Cancelado');
      return;
    }

    Alert.alert('Cancelar pre-registro', mensaje, [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => cambiarEstado('Cancelado') },
    ]);
  };

  const colorNivel = turno?.color ?? Colors.warning;
  const yaLlego = turno?.estado === 'Activo';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipalHeader}>Mi Turno</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargarTurno();
            }}
          />
        }
      >
        {cargando ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : error ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="cloud-offline-outline" size={60} color={Colors.textLight} />
            <Text style={styles.emptyTitulo}>Algo salió mal</Text>
            <Text style={styles.emptySubtitulo}>{error}</Text>
            <Pressable
              style={styles.llegueBtn}
              onPress={() => {
                setCargando(true);
                cargarTurno();
              }}
            >
              <Text style={styles.llegueTexto}>Reintentar</Text>
            </Pressable>
          </View>
        ) : !turno ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-clear-outline" size={60} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitulo}>No tenés turnos activos</Text>
            <Text style={styles.emptySubtitulo}>
              Actualmente no estás registrado en ninguna fila de espera virtual.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.subtitulo}>Información de tu pre-registro actual</Text>

            <View style={styles.ticketContainer}>
              <View style={styles.ticketHeader}>
                <View style={styles.hospitalInfo}>
                  <Ionicons name="business" size={24} color={Colors.primary} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.hospitalNombre}>{turno.hospital.nombre}</Text>
                    <Text style={styles.hospitalDireccion}>{turno.hospital.direccion}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ticketDivider}>
                <View style={[styles.ticketNotch, styles.notchLeft]} />
                <View style={styles.dashedLine} />
                <View style={[styles.ticketNotch, styles.notchRight]} />
              </View>

              <View style={styles.ticketBody}>
                <View style={styles.avisoBox}>
                  <Ionicons
                    name={yaLlego ? 'checkmark-circle-outline' : 'time-outline'}
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={styles.avisoText}>
                    {yaLlego
                      ? 'Ya avisaste que llegaste. Esperá a ser llamado en la sala.'
                      : 'Al momento de confirmar que llegaste al hospital, se te asignará una posición en la sala.'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.nivelBadge,
                    { backgroundColor: colorNivel + '15', borderColor: colorNivel },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: colorNivel }]} />
                  <Text style={[styles.nivelTexto, { color: colorNivel }]}>
                    Nivel de Triaje: {turno.nivel}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="medical-outline" size={16} color={Colors.textLight} />
                  <Text style={styles.infoText}>
                    Motivo: {turno.motivo}
                    {turno.tiempoEstimado ? `\nEspera estimada: ${turno.tiempoEstimado} min` : ''}
                    {`\nRegistrado: ${new Date(turno.fechaCreacion).toLocaleString('es-AR')}`}
                  </Text>
                </View>
              </View>
            </View>

           {!yaLlego && (
              <Pressable style={styles.llegueBtn} onPress={() => cambiarEstado('Activo')}>
                <Text style={styles.llegueTexto}>📍 Ya llegué al hospital</Text>
              </Pressable>
            )}

            <Pressable style={styles.cancelarBtn} onPress={confirmarCancelar}>
              <Text style={styles.cancelarTexto}>Cancelar pre-registro</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  subtitulo: { fontSize: 15, color: Colors.textLight, marginBottom: 20 },

  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyIconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitulo: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 12, marginTop: 12 },
  emptySubtitulo: {
    fontSize: 14, color: Colors.textLight, textAlign: 'center',
    paddingHorizontal: 20, lineHeight: 20, marginBottom: 32,
  },

  ticketContainer: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  ticketHeader: { padding: 20, backgroundColor: '#FAFAFA', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  hospitalInfo: { flexDirection: 'row', alignItems: 'center' },
  hospitalNombre: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  hospitalDireccion: { fontSize: 13, color: Colors.textLight },

  ticketDivider: { height: 20, flexDirection: 'row', alignItems: 'center', position: 'relative', backgroundColor: '#fff' },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', marginHorizontal: 10 },
  ticketNotch: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background,
    position: 'absolute', zIndex: 1, borderWidth: 1, borderColor: Colors.border,
  },
  notchLeft: { left: -11 },
  notchRight: { right: -11 },

  ticketBody: { padding: 20 },
  avisoBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '10',
    padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.primary + '30', gap: 12,
  },
  avisoText: { flex: 1, fontSize: 13, color: Colors.text, fontWeight: '500', lineHeight: 18 },

  nivelBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  nivelTexto: { fontSize: 14, fontWeight: 'bold' },

  infoBox: { flexDirection: 'row', backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 12, color: Colors.textLight, marginLeft: 8, lineHeight: 18 },

  llegueBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16,
    paddingHorizontal: 24, alignItems: 'center', marginBottom: 12,
  },
  llegueTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelarBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelarTexto: { color: Colors.danger, fontSize: 14, fontWeight: '600' },

  header: {
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20,
  },
  tituloPrincipalHeader: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
});