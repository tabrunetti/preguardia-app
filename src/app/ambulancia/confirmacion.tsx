import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { infoNivel } from '../../constants/niveles';

type Turno = {
  id: number;
  pacienteNombre: string;
  tipoIncidente: string | null;
  nivel: string;
  
  hospital: { nombre: string };
};

export default function ConfirmacionTraslado() {
  const router = useRouter();
  const { turnoId } = useLocalSearchParams<{ turnoId: string }>();
  const [turno, setTurno] = useState<Turno | null>(null);

  useEffect(() => {
    if (!turnoId) return;
    fetch(`${API_URL}/turnos/${turnoId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setTurno)
      .catch(() => {});
  }, [turnoId]);

  const Fila = ({ label, valor }: { label: string; valor?: string | null }) => (
    <View style={styles.fila}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValor}>{valor || 'No informado'}</Text>
    </View>
  );

  const nivel = infoNivel(turno?.nivel);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icono}>
          <Ionicons name="checkmark" size={56} color={Colors.emergencia} />
        </View>
        <Text style={styles.titulo}>Hospital notificado</Text>

        {!turno ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
        ) : (
          <>
            <Text style={styles.subtitulo}>
              La guardia de {turno.hospital.nombre} ya recibió los datos y se está preparando para el ingreso.
            </Text>

            <View style={styles.card}>
              <Fila label="Paciente" valor={turno.pacienteNombre} />
              <Fila label="Incidente" valor={turno.tipoIncidente} />
              <Fila label="Prioridad" valor={nivel ? `${nivel.colorNombre} (${nivel.nombre})` : turno.nivel} />
              <Fila label="Estado" valor="En camino al hospital" />
            </View>
          </>
        )}

        <Pressable style={styles.finalizarBtn} onPress={() => router.replace('/ambulancia/traslados')}>
          <Text style={styles.finalizarTexto}>Ver mis traslados</Text>
        </Pressable>
        <Pressable style={styles.secundarioBtn} onPress={() => router.replace('/ambulancia/home')}>
          <Text style={styles.secundarioTexto}>Volver a hospitales</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.emergencia },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  icono: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitulo: { fontSize: 15, color: '#FECACA', textAlign: 'center', marginTop: 10, lineHeight: 22 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 32 },
  fila: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.emergenciaLight,
  },
  filaLabel: { fontSize: 14, color: Colors.textLight },
  filaValor: { fontSize: 14, fontWeight: 'bold', color: Colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  finalizarBtn: {
    width: '100%', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32,
  },
  finalizarTexto: { color: Colors.emergencia, fontWeight: 'bold', fontSize: 16 },
  secundarioBtn: { paddingVertical: 14, alignItems: 'center' },
  secundarioTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
