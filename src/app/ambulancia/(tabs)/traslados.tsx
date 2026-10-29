import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../../constants/api';
import { Colors } from '../../../constants/colors';
import { colorDeNivel, infoNivel } from '../../../constants/niveles';
import { avisar, confirmar } from '../../../utils/alertas';
import { obtenerSesion } from '../../../utils/sesion';

type Traslado = {
  id: number;
  pacienteNombre: string;
  pacienteEdad: number | null;
  motivo: string;
  tipoIncidente: string | null;
  nivel: string;
  color: string | null;
  estado: string;
  
  fechaCreacion: string;
  hospital: { id: string; nombre: string };
};

const ESTADOS: Record<string, { texto: string; color: string }> = {
  Pendiente: { texto: 'En camino', color: Colors.warning },
  Activo: { texto: 'Entregado', color: Colors.success },
  Finalizado: { texto: 'Atendido', color: Colors.success },
  Cancelado: { texto: 'Cancelado', color: Colors.textLight },
};

const inicioDeHoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const fechaCorta = (iso: string) => {
  const f = new Date(iso);
  const hhmm = f.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const hoy = inicioDeHoy();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  if (f >= hoy) return `Hoy · ${hhmm}`;
  if (f >= ayer) return `Ayer · ${hhmm}`;
  return `${f.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} · ${hhmm}`;
};

export default function Traslados() {
  const [traslados, setTraslados] = useState<Traslado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const { usuarioId } = await obtenerSesion();
      if (!usuarioId) {
        setError('No se encontró la sesión.');
        return;
      }
      const res = await fetch(`${API_URL}/turnos/ambulancia/${usuarioId}`);
      if (!res.ok) throw new Error();
      setTraslados(await res.json());
    } catch {
      setError('No se pudieron cargar los traslados.');
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

  const cambiarEstado = async (t: Traslado, estado: 'Activo' | 'Cancelado') => {
    const ok =
      estado === 'Activo'
        ? await confirmar('Paciente entregado', `¿Entregaste a ${t.pacienteNombre} en ${t.hospital.nombre}?`, 'Sí, entregado')
        : await confirmar('Cancelar traslado', `¿Cancelar el traslado de ${t.pacienteNombre}?`, 'Sí, cancelar', true);
    if (!ok) return;

    setProcesando(t.id);
    try {
      const res = await fetch(`${API_URL}/turnos/${t.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error();
      setTraslados((prev) => prev.map((x) => (x.id === t.id ? { ...x, estado } : x)));
    } catch {
      avisar('Error', 'No se pudo actualizar el traslado.');
    } finally {
      setProcesando(null);
    }
  };

  const hoy = inicioDeHoy();
  const deHoy = traslados.filter((t) => new Date(t.fechaCreacion) >= hoy);
  const criticosHoy = deHoy.filter((t) => t.nivel === 'Emergencia').length;
  const enCamino = traslados.filter((t) => t.estado === 'Pendiente').length;

  const renderItem = ({ item }: { item: Traslado }) => {
    const color = colorDeNivel(item.nivel, item.color);
    const estado = ESTADOS[item.estado] ?? { texto: item.estado, color: Colors.textLight };
    const cancelado = item.estado === 'Cancelado';
    const pendiente = item.estado === 'Pendiente';
    const etiqueta = infoNivel(item.nivel)?.colorNombre ?? item.nivel;

    return (
      <View style={[styles.card, { borderLeftColor: color }, cancelado && styles.cardCancelado]}>
        <View style={styles.cardHeader}>
          <View style={styles.fechaContainer}>
            <Ionicons name="time-outline" size={15} color={Colors.textLight} />
            <Text style={styles.fecha}>{fechaCorta(item.fechaCreacion)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '22' }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.badgeText, { color }]}>{etiqueta}</Text>
          </View>
        </View>

        <Text style={styles.hospital}>{item.hospital.nombre}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color={Colors.emergencia} />
          <Text style={styles.infoTexto}>
            {item.pacienteNombre}
            {item.pacienteEdad != null ? `, ${item.pacienteEdad} años` : ''}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="medkit-outline" size={15} color={Colors.emergencia} />
          <Text style={styles.infoTexto}>
            {[item.tipoIncidente, item.motivo].filter((x) => x && x !== 'Sin especificar').join(' - ') || 'Sin especificar'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.estado, { color: estado.color }]}>{estado.texto}</Text>
        </View>

        {pendiente && (
          <View style={styles.acciones}>
            {procesando === item.id ? (
              <ActivityIndicator color={Colors.emergencia} />
            ) : (
              <>
                <Pressable style={styles.btnEntregado} onPress={() => cambiarEstado(item, 'Activo')}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.btnEntregadoTexto}>Entregado</Text>
                </Pressable>
                <Pressable style={styles.btnCancelar} onPress={() => cambiarEstado(item, 'Cancelado')}>
                  <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                </Pressable>
              </>
            )}
          </View>
        )}
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
            <Text style={styles.statValor}>{enCamino}</Text>
            <Text style={styles.statLabel}>En camino</Text>
          </View>
        </View>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={Colors.emergencia} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={traslados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
          ListEmptyComponent={
            <Text style={styles.vacio}>{error ?? 'Todavía no realizaste traslados.'}</Text>
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
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitulo: { fontSize: 14, color: '#FECACA', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  statValor: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 11, color: '#FECACA', marginTop: 2, fontWeight: '500' },
  lista: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  vacio: { textAlign: 'center', color: Colors.textLight, marginTop: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 5,
  },
  cardCancelado: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  fechaContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  fecha: { fontSize: 13, color: Colors.textLight, fontWeight: '600' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  hospital: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoTexto: { fontSize: 14, color: Colors.text, flex: 1 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.emergenciaLight, paddingTop: 10, marginTop: 6,
  },
  estado: { fontSize: 13, fontWeight: 'bold' },
  duracion: { fontSize: 13, color: Colors.textLight },
  acciones: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 12 },
  btnEntregado: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success,
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14,
  },
  btnEntregadoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnCancelar: { paddingVertical: 8 },
  btnCancelarTexto: { color: Colors.emergencia, fontWeight: '600', fontSize: 14 },
});