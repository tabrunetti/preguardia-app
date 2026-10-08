import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/colors';

export default function AdminHome() {
  const router = useRouter();
  const [rolSeleccionado, setRolSeleccionado] = useState<'Secretaria' | 'Ambulancia'>('Secretaria');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCrearUsuario = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completá todos los campos.');
      return;
    }
    Alert.alert('¡Éxito!', `Se creó la cuenta de ${rolSeleccionado} para ${email}.`);
    setEmail('');
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>Panel Gerencial</Text>
            <Text style={styles.titulo}>Gestión de Personal</Text>
          </View>
          <Pressable onPress={() => router.replace('/')}>
            <Ionicons name="log-out-outline" size={28} color={Colors.danger} />
          </Pressable>
        </View>

        <Text style={styles.subtitulo}>Crear nueva cuenta de acceso</Text>

        {/* Selección de Rol */}
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

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo institucional</Text>
          <TextInput
            style={styles.input}
            placeholder="ej: secretaria@hospital"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña temporal</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.primaryButton} onPress={handleCrearUsuario}>
            <Text style={styles.primaryButtonText}>Crear Usuario</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  saludo: { fontSize: 14, color: Colors.textLight },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 16 },
  
  rolesContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  rolBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA' },
  rolBtnActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rolTexto: { fontSize: 14, fontWeight: '600', color: Colors.textLight },
  rolTextoActivo: { color: '#fff' },

  form: { marginTop: 8 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: '#FAFAFA', marginBottom: 16 },
  
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});