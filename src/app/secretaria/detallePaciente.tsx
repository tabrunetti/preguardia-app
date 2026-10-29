import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { colorDeNivel } from '../../constants/niveles';

type Triaje = {
  dificultadRespiratoria: boolean;
  dolorPechoConSintomas: boolean;
  signosACV: boolean;
  perdidaConciencia: boolean;
  sangradoIncontrolable: boolean;
  embarazoConAlarma: boolean;
  convulsionReciente: boolean;
  escalaDolor: number | null;
  tiempoSintomas: string | null;
  evolucion: string | null;
  temperatura: number | null;
  frecuenciaCardiaca: number | null;
  enfermedadCronica: boolean;
  embarazo: boolean;
};

type Turno = {
  id: number;
  pacienteNombre: string;
  pacienteDni: string;
  pacienteTelefono: string | null;
  pacienteEdad: number | null;
  pacientePresion: string | null;
  motivo: string;
  nivel: string;
  color: string | null;
  estado: string;
  fechaCreacion: string;
  fechaAtencion: string | null;
  triaje: Triaje | null;
};

const BANDERAS: { campo: keyof Triaje; texto: string }[] = [
  { campo: 'dificultadRespiratoria', texto: 'Dificultad respiratoria' },
  { campo: 'dolorPechoConSintomas', texto: 'Dolor de pecho con síntomas' },
  { campo: 'signosACV', texto: 'Signos de ACV' },
  { campo: 'perdidaConciencia', texto: 'Pérdida de conciencia' },
  { campo: 'sangradoIncontrolable', texto: 'Sangrado incontrolable' },
  { campo: 'embarazoConAlarma', texto: 'Embarazo con signos de alarma' },
  { campo: 'convulsionReciente', texto: 'Convulsión reciente' },
];

const fechaHora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const Fila = ({ label, valor }: { label: string; valor: string }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.valor}>{valor}</Text>
  </>
);

export default function DetallePaciente() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [turno, setTurno] = useState<Turno | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        if (!id) return;
        setTurno(null);
        setError(null);
        try {
          const res = await fetch(`${API_URL}/turnos/${id}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          if (!cancelado) setTurno(data);
        } catch {
          if (!cancelado) setError('No se pudo cargar la ficha.');
        }
      })();
      return () => {
        cancelado = true;
      };
    }, [id])
  );

  const banderasActivas = turno?.triaje ? BANDERAS.filter((b) => turno.triaje![b.campo]) : [];
  const color = turno ? colorDeNivel(turno.nivel, turno.color) : Colors.textLight;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/secretaria/historial')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.tituloPrincipal}>Ficha Médica</Text>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !turno ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Fila label="Paciente" valor={turno.pacienteNombre} />
            <Fila label="DNI" valor={turno.pacienteDni} />
            <Text style={styles.label}>Teléfono de contacto</Text>
            {turno.pacienteTelefono ? (
              <Pressable
                style={styles.telefonoRow}
                onPress={() => Linking.openURL(`tel:${turno.pacienteTelefono!.replace(/[^\d+]/g, '')}`)}
              >
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
                <Text style={[styles.valor, { color: Colors.primary }]}>{turno.pacienteTelefono}</Text>
              </Pressable>
            ) : (
              <Text style={styles.valor}>Sin registrar</Text>
            )}
            <Fila label="Motivo de consulta" valor={turno.motivo} />

            <Text style={styles.label}>Prioridad asignada</Text>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.badgeText, { color }]}>{turno.nivel}</Text>
            </View>

            <Fila label="Edad" valor={turno.pacienteEdad != null ? `${turno.pacienteEdad} años` : 'No especificada'} />
            <Fila label="Presión arterial" valor={turno.pacientePresion || 'Sin registrar'} />
            <Fila label="Ingreso" valor={fechaHora(turno.fechaCreacion)} />
            <Fila label="Atención" valor={fechaHora(turno.fechaAtencion)} />
          </View>

          {turno.triaje && (
            <View style={[styles.infoCard, { marginTop: 16 }]}>
              <Text style={styles.seccion}>Triaje del paciente (app)</Text>

              <Text style={styles.label}>Signos de alarma</Text>
              {banderasActivas.length ? (
                banderasActivas.map((b) => (
                  <View key={b.campo} style={styles.banderaRow}>
                    <Ionicons name="warning" size={16} color={Colors.danger} />
                    <Text style={styles.banderaTexto}>{b.texto}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.valor}>Ninguno</Text>
              )}

              {turno.triaje.escalaDolor != null && <Fila label="Escala de dolor" valor={`${turno.triaje.escalaDolor}/10`} />}
              {turno.triaje.tiempoSintomas && <Fila label="Tiempo de síntomas" valor={turno.triaje.tiempoSintomas} />}
              {turno.triaje.evolucion && <Fila label="Evolución" valor={turno.triaje.evolucion} />}
              {turno.triaje.temperatura != null && <Fila label="Temperatura" valor={`${turno.triaje.temperatura} °C`} />}
              {turno.triaje.frecuenciaCardiaca != null && (
                <Fila label="Frecuencia cardíaca" valor={`${turno.triaje.frecuenciaCardiaca} lpm`} />
              )}
              <Fila
                label="Factores de riesgo"
                valor={
                  [turno.triaje.enfermedadCronica && 'Enfermedad crónica', turno.triaje.embarazo && 'Embarazo']
                    .filter(Boolean)
                    .join(', ') || 'Ninguno'
                }
              />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, marginBottom: 20 },
  backButton: { marginRight: 16 },
  tituloPrincipal: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  infoCard: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  seccion: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  label: { fontSize: 13, color: Colors.textLight, marginBottom: 4, fontWeight: '500', marginTop: 16 },
  valor: { fontSize: 16, color: Colors.text, fontWeight: 'bold' },
  badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: 'bold' },
  banderaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  banderaTexto: { fontSize: 15, color: Colors.danger, fontWeight: '600' },
  error: { textAlign: 'center', color: Colors.textLight, marginTop: 40, fontSize: 15 },
    telefonoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});