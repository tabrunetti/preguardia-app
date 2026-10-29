import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EscanerDni from '../components/escanerDni';
import { Colors } from '../constants/colors';
import { DatosDni, formatearDni } from '../utils/dni';

const API_URL = 'http://172.28.96.1:3000/api';

const PARENTESCOS = ['Hijo/a', 'Madre', 'Padre', 'Pareja', 'Hermano/a', 'Abuelo/a', 'Otro'];

export default function FamiliarNuevo() {
  const router = useRouter();

  const [parentesco, setParentesco] = useState('');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [obraSocial, setObraSocial] = useState('');
  const [celular, setCelular] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');

  const [escanerVisible, setEscanerVisible] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const volver = () => (router.canGoBack() ? router.back() : router.replace('/(paciente)/perfil'));

  const handleDniEscaneado = (d: DatosDni) => {
    setNombre(`${d.nombres} ${d.apellido}`.trim());
    setDni(formatearDni(d.dni));
    setFechaNacimiento(d.fechaNacimiento);
  };

  const handleGuardar = async () => {
    setError('');

    if (!parentesco || !nombre.trim() || !dni.trim() || !fechaNacimiento.trim()) {
      setError('Completá el parentesco y todos los campos obligatorios (*).');
      return;
    }
    if (!/^\d{7,8}$/.test(dni.replace(/\D/g, ''))) {
      setError('El DNI debe tener 7 u 8 números.');
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fechaNacimiento.trim())) {
      setError('La fecha de nacimiento debe tener el formato DD/MM/AAAA.');
      return;
    }

    const usuarioId = await AsyncStorage.getItem('usuarioId');
    if (!usuarioId) {
      setError('No se encontró la sesión. Volvé a iniciar sesión.');
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/${usuarioId}/familiares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentesco,
          nombre: nombre.trim(),
          dni: dni.trim(),
          fechaNacimiento: fechaNacimiento.trim(),
          obraSocial: obraSocial.trim() || null,
          celular: celular.trim() || null,
          contactoEmergencia: contactoEmergencia.trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo guardar el familiar.');
        return;
      }

      volver();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={volver} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <Text style={styles.titulo}>Agregar familiar</Text>
          <Text style={styles.subtitulo}>
            Guardá los datos de alguien a tu cargo para pre-registrarlo rápido en una emergencia.
          </Text>

          <Pressable style={styles.escanearBtn} onPress={() => setEscanerVisible(true)}>
            <Ionicons name="scan-outline" size={22} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.escanearTitulo}>Escanear su DNI</Text>
              <Text style={styles.escanearSub}>Completá los datos automáticamente</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </Pressable>

          <Text style={styles.label}>Parentesco *</Text>
          <View style={styles.chips}>
            {PARENTESCOS.map((p) => (
              <Pressable
                key={p}
                style={[styles.chip, parentesco === p && styles.chipActivo]}
                onPress={() => setParentesco(p)}
              >
                <Text style={[styles.chipTexto, parentesco === p && styles.chipTextoActivo]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput style={styles.input} placeholder="Laura Gómez" placeholderTextColor={Colors.textLight}
            value={nombre} onChangeText={setNombre} autoCapitalize="words" />

          <Text style={styles.label}>DNI / Documento *</Text>
          <TextInput style={styles.input} placeholder="12.345.678" placeholderTextColor={Colors.textLight}
            keyboardType="numeric" value={dni} onChangeText={setDni} />

          <Text style={styles.label}>Fecha de nacimiento *</Text>
          <TextInput style={styles.input} placeholder="DD/MM/AAAA" placeholderTextColor={Colors.textLight}
            value={fechaNacimiento} onChangeText={setFechaNacimiento} />

          <Text style={styles.label}>Obra social / Prepaga (Opcional)</Text>
          <TextInput style={styles.input} placeholder="PAMI, OSDE, IOMA, etc." placeholderTextColor={Colors.textLight}
            value={obraSocial} onChangeText={setObraSocial} />

          <Text style={styles.label}>Teléfono (Opcional)</Text>
          <TextInput style={styles.input} placeholder="+54 9 11 5555 5555" placeholderTextColor={Colors.textLight}
            keyboardType="phone-pad" value={celular} onChangeText={setCelular} />

          <Text style={styles.label}>Contacto de emergencia (Opcional)</Text>
          <TextInput style={styles.input} placeholder="Vos u otra persona - 11 9999 9999" placeholderTextColor={Colors.textLight}
            value={contactoEmergencia} onChangeText={setContactoEmergencia} />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.primaryButton, guardando && { opacity: 0.7 }]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Guardar familiar</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <EscanerDni
        visible={escanerVisible}
        onClose={() => setEscanerVisible(false)}
        onEscaneado={handleDniEscaneado}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },
  header: { marginBottom: 20, marginTop: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 14, color: Colors.textLight, marginTop: 8, marginBottom: 24, lineHeight: 20 },
  escanearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primaryLight, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.primary, padding: 16, marginBottom: 8,
  },
  escanearTitulo: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  escanearSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: '#FAFAFA',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
  },
  chipActivo: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipTexto: { fontSize: 13, color: Colors.text },
  chipTextoActivo: { color: Colors.primary, fontWeight: 'bold' },
  errorText: { color: Colors.danger, fontSize: 13, marginTop: 16 },
  primaryButton: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 32,
  },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});