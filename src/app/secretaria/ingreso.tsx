import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { NIVELES } from '../../constants/niveles';
import { avisar } from '../../utils/alertas';
import { obtenerSesion } from '../../utils/sesion';

export default function SecretariaIngreso() {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [nivelActivo, setNivelActivo] = useState('Moderado');
  const [guardando, setGuardando] = useState(false);

  const limpiar = () => {
    setDni('');
    setNombre('');
    setEdad('');
    setMotivo('');
    setNivelActivo('Moderado');
  };

  const handleRegistrar = async () => {
    if (!dni.trim() || !nombre.trim() || !motivo.trim()) {
      avisar('Faltan datos', 'Completá DNI, nombre y motivo de consulta.');
      return;
    }
    if (!/^\d{7,8}$/.test(dni.replace(/\D/g, ''))) {
      avisar('DNI inválido', 'El DNI debe tener 7 u 8 números.');
      return;
    }
    if (edad && (Number.isNaN(Number(edad)) || Number(edad) < 0 || Number(edad) > 120)) {
      avisar('Edad inválida', 'Ingresá una edad entre 0 y 120.');
      return;
    }

    const { usuarioId } = await obtenerSesion();
    if (!usuarioId) {
      avisar('Sesión vencida', 'Volvé a iniciar sesión.');
      return;
    }

    const nivel = NIVELES.find((n) => n.nombre === nivelActivo)!;

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/turnos/presencial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretariaId: usuarioId,
          pacienteNombre: nombre.trim(),
          pacienteDni: dni,
          pacienteEdad: edad ? Number(edad) : null,
          motivo: motivo.trim(),
          nivel: nivel.nombre,
          color: nivel.color,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        avisar('Error', data?.error ?? 'No se pudo registrar el ingreso.');
        return;
      }
      avisar('Paciente ingresado', `${nombre.trim()} quedó en la sala de espera con prioridad ${nivel.nombre}.`);
      limpiar();
    } catch {
      avisar('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.tituloPrincipal}>Recepción de Guardia</Text>
            <Text style={styles.subtitulo}>Ingreso de pacientes presenciales</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>DNI del paciente *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color={Colors.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: 12.345.678"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                value={dni}
                onChangeText={setDni}
              />
            </View>

            <Text style={styles.label}>Nombre completo *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: María Gómez"
                placeholderTextColor={Colors.textLight}
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.label}>Edad (opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textLight} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: 45"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                value={edad}
                onChangeText={setEdad}
              />
            </View>

            <Text style={styles.label}>Motivo de consulta principal *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej: Dolor abdominal agudo, fiebre..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              value={motivo}
              onChangeText={setMotivo}
            />

            <Text style={styles.label}>Nivel de prioridad (Triaje)</Text>
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

            <Pressable
              style={[styles.registrarBtn, guardando && { opacity: 0.7 }]}
              onPress={handleRegistrar}
              disabled={guardando}
            >
              {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.registrarTexto}>Ingresar a sala de espera</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  card: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 24 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1,
    borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text },
  textArea: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, textAlignVertical: 'top', minHeight: 100,
  },
  nivelesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  nivelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  nivelTexto: { fontSize: 13, fontWeight: '600', color: Colors.text },
  registrarBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  registrarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  header: {
    backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20,
  },
  tituloPrincipal: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});