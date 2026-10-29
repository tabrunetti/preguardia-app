import { Ionicons } from '@expo/vector-icons';
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

export default function OlvideContrasena() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [verPassword, setVerPassword] = useState(false);

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);

  const limpiarError = () => error && setError('');

  const handleRestablecer = async () => {
    const correo = email.toLowerCase().trim();
    const dniLimpio = dni.replace(/\D/g, '');

    if (!correo || !dniLimpio || !password || !confirmacion) {
      setError('Completá todos los campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('Ingresá un correo electrónico válido.');
      return;
    }
    if (!/^\d{7,8}$/.test(dniLimpio)) {
      setError('El DNI debe tener 7 u 8 números.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError('');
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/auth/restablecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, dni: dniLimpio, nuevaPassword: password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? 'No se pudo restablecer la contraseña.');
        return;
      }
      setListo(true);
    } catch {
      setError('No se pudo conectar con el servidor.');
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

          {!listo ? (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={32} color={Colors.primary} />
              </View>

              <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.subtitulo}>
                Ingresá el correo con el que te registraste y tu DNI para crear una contraseña nueva.
              </Text>

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  limpiarError();
                }}
              />

              <Text style={styles.label}>DNI</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 12345678"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={10}
                value={dni}
                onChangeText={(t) => {
                  setDni(t);
                  limpiarError();
                }}
              />

              <Text style={styles.label}>Contraseña nueva</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!verPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    limpiarError();
                  }}
                />
                <Pressable onPress={() => setVerPassword(!verPassword)} hitSlop={10}>
                  <Ionicons name={verPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.textLight} />
                </Pressable>
              </View>

              <Text style={styles.label}>Repetí la contraseña nueva</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!verPassword}
                autoCapitalize="none"
                value={confirmacion}
                onChangeText={(t) => {
                  setConfirmacion(t);
                  limpiarError();
                }}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                style={[styles.primaryButton, guardando && { opacity: 0.7 }]}
                onPress={handleRestablecer}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Cambiar contraseña</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color={Colors.success} />
              </View>

              <Text style={styles.titulo}>¡Contraseña actualizada!</Text>
              <Text style={styles.subtitulo}>
                Ya podés iniciar sesión con tu contraseña nueva.
              </Text>

              <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
                <Text style={styles.primaryButtonText}>Ir a iniciar sesión</Text>
              </Pressable>
            </>
          )}
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
  iconCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  titulo: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 14, color: Colors.textLight, marginTop: 8, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, backgroundColor: '#FAFAFA',
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, backgroundColor: '#FAFAFA',
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text },
  errorText: { color: Colors.danger, fontSize: 13, marginTop: 16 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});