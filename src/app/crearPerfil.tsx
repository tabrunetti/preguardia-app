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
import { API_URL } from '../constants/api';
import { Colors } from '../constants/colors';
import { avisar } from '../utils/alertas';

export default function CrearPerfil() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleRegistrarse = async () => {
    if (!nombre.trim() || !dni.trim() || !email.trim() || !password) {
      avisar('Faltan datos', 'Por favor completá todos los campos.');
      return;
    }
    if (!/^\d{7,8}$/.test(dni.replace(/\D/g, ''))) {
      avisar('DNI inválido', 'El DNI debe tener 7 u 8 números.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      avisar('Correo inválido', 'Ingresá un correo electrónico válido.');
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          dni: dni.replace(/\D/g, ''),
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        avisar('Error', data?.error ?? 'No se pudo crear la cuenta.');
        return;
      }

      const usuario = data?.usuario ?? data;
      if (!usuario?.id) {
        avisar('Cuenta creada', 'Tu cuenta se creó. Iniciá sesión para continuar.');
        router.replace('/');
        return;
      }

      // Guardamos la sesión igual que en el login
      await AsyncStorage.multiRemove(['usuarioId', 'rol', 'hospitalId']);
      await AsyncStorage.setItem('usuarioId', usuario.id.toString());
      await AsyncStorage.setItem('rol', usuario.rol ?? 'Paciente');

      router.replace('/(paciente)/home');
    } catch (error) {
      console.error(error);
      avisar('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <Text style={styles.titulo}>Crear nueva cuenta</Text>
          <Text style={styles.subtitulo}>
            Ingresá tus datos para empezar a usar PreGuardia y evitar esperas.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre y Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor={Colors.textLight}
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />

            <Text style={styles.label}>DNI</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12345678"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
              maxLength={10}
              value={dni}
              onChangeText={setDni}
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={Colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={[styles.primaryButton, guardando && { opacity: 0.7 }]}
            onPress={handleRegistrarse}
            disabled={guardando}
          >
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Registrarme</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },
  header: { marginBottom: 20, marginTop: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  titulo: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 14, color: Colors.textLight, marginTop: 8, marginBottom: 32, lineHeight: 20 },
  form: { width: '100%', flex: 1 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, backgroundColor: '#FAFAFA',
  },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 40 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});