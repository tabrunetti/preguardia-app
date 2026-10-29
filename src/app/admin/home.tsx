import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/colors';

const API_URL = 'http://172.28.96.1:3000/api';

const avisar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web') window.alert(`${titulo}\n\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
};

export default function AdminHome() {
  const router = useRouter();
  const [rolSeleccionado, setRolSeleccionado] = useState<'Secretaria' | 'Ambulancia'>('Secretaria');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guardando, setGuardando] = useState(false);

  const handleCrearUsuario = async () => {
    if (!nombre.trim() || !dni.trim() || !email.trim() || !password) {
      avisar('Error', 'Por favor completá todos los campos.');
      return;
    }
    if (!/^\d{7,8}$/.test(dni.replace(/\D/g, ''))) {
      avisar('Error', 'El DNI debe tener 7 u 8 números.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      avisar('Error', 'Ingresá un correo válido.');
      return;
    }

    const adminId = await AsyncStorage.getItem('usuarioId');
    if (!adminId) {
      avisar('Sesión vencida', 'Volvé a iniciar sesión.');
      router.replace('/');
      return;
    }

    setGuardando(true);
    try {
      const response = await fetch(`${API_URL}/usuarios/personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: Number(adminId),
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim(),
          password,
          rol: rolSeleccionado,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        avisar('Error', data?.error ?? 'No se pudo crear el usuario.');
        return;
      }

      avisar('¡Éxito!', `Se creó la cuenta de ${rolSeleccionado} para ${nombre.trim()}.`);
      setNombre('');
      setDni('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error(error);
      avisar('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = async () => {
    await AsyncStorage.multiRemove(['usuarioId', 'rol', 'hospitalId']);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerEtiquetaRow}>
          <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
          <Text style={styles.headerEtiquetaTexto}>CREAR USUARIO</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={styles.tituloPrincipal}>Gestión de Personal</Text>
            <Text style={styles.subtitulo}>Panel Gerencial</Text>
          </View>
          <Pressable onPress={handleCerrarSesion} style={{ marginTop: 4 }}>
            <Ionicons name="log-out-outline" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtituloFormulario}>Crear nueva cuenta de acceso</Text>

        <View style={styles.rolesContainer}>
          <Pressable
            style={[styles.rolBtn, rolSeleccionado === 'Secretaria' && styles.rolBtnActivo]}
            onPress={() => setRolSeleccionado('Secretaria')}
          >
            <Ionicons name="desktop-outline" size={20} color={rolSeleccionado === 'Secretaria' ? '#fff' : Colors.textLight} />
            <Text style={[styles.rolTexto, rolSeleccionado === 'Secretaria' && styles.rolTextoActivo]}>Secretaría</Text>
          </Pressable>

          <Pressable
            style={[styles.rolBtn, rolSeleccionado === 'Ambulancia' && styles.rolBtnActivo]}
            onPress={() => setRolSeleccionado('Ambulancia')}
          >
            <Ionicons name="medical-outline" size={20} color={rolSeleccionado === 'Ambulancia' ? '#fff' : Colors.textLight} />
            <Text style={[styles.rolTexto, rolSeleccionado === 'Ambulancia' && styles.rolTextoActivo]}>Ambulancia</Text>
          </Pressable>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="ej: María González"
            placeholderTextColor={Colors.textLight}
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Número de documento (DNI)</Text>
          <TextInput
            style={styles.input}
            placeholder="ej: 28.345.678"
            placeholderTextColor={Colors.textLight}
            keyboardType="numeric"
            value={dni}
            onChangeText={setDni}
          />

          <Text style={styles.label}>Correo institucional</Text>
          <TextInput
            style={styles.input}
            placeholder="ej: secretaria@hospital.com"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Contraseña </Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[styles.primaryButton, guardando && { opacity: 0.7 }]}
            onPress={handleCrearUsuario}
            disabled={guardando}
          >
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Crear Usuario</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  rolesContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  rolBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
  },
  rolBtnActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rolTexto: { fontSize: 14, fontWeight: '600', color: Colors.textLight },
  rolTextoActivo: { color: '#fff' },

  form: { marginTop: 8 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, backgroundColor: '#FAFAFA', marginBottom: 16,
  },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },

  header: {
    backgroundColor: '#1F2937', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20,
  },
  headerEtiquetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  headerEtiquetaTexto: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  tituloPrincipal: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  subtitulo: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  subtituloFormulario: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 16 },
});