import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { NIVELES } from '../../constants/niveles';
import { avisar } from '../../utils/alertas';

type Turno = {
  id: number;
  pacienteNombre: string;
  pacienteDni: string;
  motivo: string;
  nivel: string;
};

export default function FichaEditable() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [turno, setTurno] = useState<Turno | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [motivo, setMotivo] = useState('');
  const [nivelActivo, setNivelActivo] = useState('Moderado');
  

  const volver = () => router.navigate('/secretaria/turnos');

  // Se recarga cada vez que se abre la ficha (por si es otro paciente)
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        if (!id) return;
        setCargando(true);
        try {
          const res = await fetch(`${API_URL}/turnos/${id}`);
          if (!res.ok) throw new Error();
          const t: Turno = await res.json();
          if (cancelado) return;
          setTurno(t);
          setMotivo(t.motivo ?? '');
          setNivelActivo(t.nivel ?? 'Moderado');
        
        } catch {
          if (!cancelado) avisar('Error', 'No se pudo cargar la ficha.');
        } finally {
          if (!cancelado) setCargando(false);
        }
      })();
      return () => {
        cancelado = true;
      };
    }, [id])
  );

  const handleGuardarCambios = async () => {
    if (!turno) return;
    if (!motivo.trim()) {
      avisar('Falta el motivo', 'El motivo de consulta no puede quedar vacío.');
      return;
    }
    

    const nivel = NIVELES.find((n) => n.nombre === nivelActivo);

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/turnos/${turno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo: motivo.trim(),
          nivel: nivelActivo,
          color: nivel?.color ?? null,
          
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        avisar('Error', data?.error ?? 'No se pudo guardar la ficha.');
        return;
      }
      avisar('Ficha actualizada', 'Los cambios se guardaron correctamente.');
      volver();
    } catch {
      avisar('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={volver} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.tituloPrincipal}>Ficha en Espera</Text>
      </View>

      {cargando || !turno ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.infoCard}>
              <Text style={styles.label}>Paciente</Text>
              <Text style={styles.valorPrincipal}>{turno.pacienteNombre}</Text>
              <Text style={styles.dni}>DNI {turno.pacienteDni}</Text>

              <Text style={styles.label}>Motivo de Consulta</Text>
              <TextInput style={[styles.input, { minHeight: 70 }]} value={motivo} onChangeText={setMotivo} multiline />

              <Text style={styles.label}>Nivel de prioridad (re-evaluación)</Text>
              <View style={styles.nivelesContainer}>
                {NIVELES.map((nivel) => {
                  const activo = nivelActivo === nivel.nombre;
                  return (
                    <Pressable
                      key={nivel.nombre}
                      style={[styles.nivelChip, activo && { backgroundColor: nivel.color, borderColor: nivel.color }]}
                      onPress={() => setNivelActivo(nivel.nombre)}
                    >
                      {!activo && <View style={[styles.dot, { backgroundColor: nivel.color }]} />}
                      <Text style={[styles.nivelTexto, activo && { color: '#fff' }]}>{nivel.nombre}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable
              style={[styles.guardarBtn, guardando && { opacity: 0.7 }]}
              onPress={handleGuardarCambios}
              disabled={guardando}
            >
              {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.guardarTexto}>Guardar Cambios</Text>}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
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
  label: { fontSize: 13, color: Colors.textLight, marginBottom: 8, fontWeight: '500', marginTop: 16 },
  valorPrincipal: { fontSize: 18, color: Colors.text, fontWeight: 'bold' },
  dni: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  input: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Colors.text, textAlignVertical: 'top',
  },
  nivelesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  nivelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nivelTexto: { fontSize: 13, fontWeight: '600', color: Colors.text },
  guardarBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  guardarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});