import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/colors';

export default function AdminHome() {
  const router = useRouter();
  const [rolSeleccionado, setRolSeleccionado] = useState<'Secretaria' | 'Ambulancia'>('Secretaria');
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCrearUsuario = () => {
    if (!nombre || !dni || !email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos.');
      return;
    }
    Alert.alert('¡Éxito!', `Se creó la cuenta de ${rolSeleccionado} para ${nombre} (DNI: ${dni}).`);
    setNombre('');
    setDni('');
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      {/* Cabecera azul fuera del ScrollView para que se pegue arriba */}
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
          <Pressable onPress={() => router.replace('/')} style={{ marginTop: 4 }}>
            <Ionicons name="log-out-outline" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtituloFormulario}>Crear nueva cuenta de acceso</Text>

        <View style={styles.rolesContainer}>
          {/* ... botones de roles (sin cambios) ... */}
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
           {/* ... el resto de tus inputs (sin cambios) ... */}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  saludo: { fontSize: 14, color: Colors.textLight },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
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
  // Modifica content:
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  // Agrega/Reemplaza estos estilos de cabecera:
  header: { 
    backgroundColor: '#1F2937', 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 24,
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24, 
    marginBottom: 20 
  },
  headerEtiquetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16
  },
  headerEtiquetaTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  tituloPrincipal: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  subtitulo: { 
    fontSize: 15, 
    color: 'rgba(255,255,255,0.8)', 
    marginTop: 4 
  },
  subtituloFormulario: { // Renombramos el viejo "subtitulo" para la seccion de abajo
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.text, 
    marginBottom: 16 
  },
});