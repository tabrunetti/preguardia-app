import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors } from '../constants/colors';

export default function OlvideContrasena() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleEnviar = () => {
    const correo = email.toLowerCase().trim();
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!emailValido) {
      setError('Ingresá un correo electrónico válido.');
      return;
    }

    setError('');
    // Mock: acá iría la llamada al backend para enviar el mail de recuperación
    setEnviado(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
          </View>

          {!enviado ? (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={32} color={Colors.primary} />
              </View>

              <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.subtitulo}>
                Ingresá el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
              </Text>

              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError('');
                }}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable style={styles.primaryButton} onPress={handleEnviar}>
                <Text style={styles.primaryButtonText}>Enviar enlace</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="mail-outline" size={32} color={Colors.success} />
              </View>

              <Text style={styles.titulo}>Revisá tu correo</Text>
              <Text style={styles.subtitulo}>
                Si existe una cuenta asociada a{' '}
                <Text style={styles.emailDestacado}>{email.trim()}</Text>, vas a recibir un enlace para restablecer tu contraseña en los próximos minutos.
              </Text>

              <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
                <Text style={styles.primaryButtonText}>Volver al inicio de sesión</Text>
              </Pressable>

              <Pressable style={styles.linkButton} onPress={() => setEnviado(false)}>
                <Text style={styles.linkText}>¿No te llegó? Reenviar</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitulo: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  emailDestacado: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});