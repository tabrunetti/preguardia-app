import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { colorDeNivel } from '../../constants/niveles';
import { obtenerSesion } from '../../utils/sesion';

type Turno = {
  id: number;
  pacienteNombre: string;
  pacienteDni: string;
  motivo: string;
  nivel: string;
  color: string | null;
  fechaAtencion: string | null;
  fechaCreacion: string;
};

const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

export default function SecretariaHistorial() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const { hospitalId } = await obtenerSesion();
      if (!hospitalId) {
        setError('Tu cuenta no tiene hospital asignado.');
        return;
      }
      const res = await fetch(`${API_URL}/turnos/hospital/${hospitalId}?estados=Finalizado`);
      if (!res.ok) throw new Error();
      const data: Turno[] = await res.json();
      // Los atendidos más recientes primero
      data.sort(
        (a, b) =>
          new Date(b.fechaAtencion ?? b.fechaCreacion).getTime() -
          new Date(a.fechaAtencion ?? a.fechaCreacion).getTime()
      );
      setTurnos(data);
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
    }, [cargar])
  );

  const texto = busqueda.trim().toLowerCase();
  const filtrados = turnos.filter(
    (t) => t.pacienteNombre.toLowerCase().includes(texto) || t.pacienteDni.includes(texto.replace(/\D/g, '') || '§')
  );
  const lista = texto ? filtrados : turnos;

  const renderItem = ({ item }: { item: Turno }) => {
    const color = colorDeNivel(item.nivel, item.color);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.pacienteNombre}>{item.pacienteNombre}</Text>
          <Text style={styles.hora}>{hora(item.fechaAtencion ?? item.fechaCreacion)}</Text>
        </View>
        <Text style={styles.pacienteMotivo}>{item.motivo}</Text>

        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '50' }]}>
            <Text style={[styles.badgeText, { color }]}>{item.nivel}</Text>
          </View>

          <Pressable
            style={styles.infoBtn}
            onPress={() => router.push({ pathname: '/secretaria/detallePaciente', params: { id: String(item.id) } })}
          >
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoTexto}>Ver ficha</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>Historial Guardia</Text>
        <Text style={styles.subtitulo}>Pacientes atendidos hoy</Text>

        <View style={[styles.searchContainer, { marginTop: 16 }]}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre o DNI..."
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
          ListEmptyComponent={
            <Text style={styles.noResultText}>
              {error ?? (texto ? 'No se encontraron resultados.' : 'Todavía no hay pacientes atendidos hoy.')}
            </Text>
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

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1,
    borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },

  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  noResultText: { textAlign: 'center', color: Colors.textLight, marginTop: 20, fontSize: 15 },

  card: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pacienteNombre: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1 },
  hora: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
  pacienteMotivo: { fontSize: 14, color: Colors.text, marginBottom: 12 },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },

  infoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.primary + '15', borderRadius: 8, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  infoTexto: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
});