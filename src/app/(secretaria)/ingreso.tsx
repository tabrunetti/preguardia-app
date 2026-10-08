import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/colors';

const NIVELES = [
  { nombre: 'Rojo', color: Colors.danger },
  { nombre: 'Naranja', color: Colors.warning },
  { nombre: 'Amarillo', color: '#EAB308' },
  { nombre: 'Verde', color: Colors.success },
  { nombre: 'Azul', color: '#3B82F6' }
];

export default function AdminNuevoIngreso() {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState('');
  const [nivelActivo, setNivelActivo] = useState('Amarillo');

  const handleRegistrar = () => {
    if (!dni || !nombre || !motivo) {
      Alert.alert('Error', 'Por favor completá todos los campos.');
      return;
    }
    Alert.alert('Éxito', `Paciente ${nombre} registrado en cola con prioridad ${nivelActivo}.`);
    // Limpiamos los campos
    setDni(''); setNombre(''); setMotivo(''); setNivelActivo('Amarillo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.tituloPrincipal}>Recepción de Guardia</Text>
          <Text style={styles.subtitulo}>Ingreso de pacientes presenciales</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DNI del paciente</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color={Colors.textLight} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: 12.345.678"
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
            />
          </View>

          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.textLight} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: María Gómez"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <Text style={styles.label}>Motivo de consulta principal</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Dolor abdominal agudo, fiebre..."
            multiline
            numberOfLines={3}
            value={motivo}
            onChangeText={setMotivo}
          />

          <Text style={styles.label}>Nivel de Emergencia (Triaje)</Text>
          <View style={styles.nivelesContainer}>
            {NIVELES.map(nivel => (
              <Pressable 
                key={nivel.nombre} 
                style={[
                  styles.nivelChip, 
                  nivelActivo === nivel.nombre && { backgroundColor: nivel.color, borderColor: nivel.color }
                ]} 
                onPress={() => setNivelActivo(nivel.nombre)}
              >
                <Text style={[
                  styles.nivelTexto, 
                  nivelActivo === nivel.nombre && { color: '#fff' }
                ]}>
                  {nivel.nombre}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.registrarBtn} onPress={handleRegistrar}>
            <Text style={styles.registrarTexto}>Ingresar a sala de espera</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  header: { marginBottom: 32 },
  tituloPrincipal: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 15, color: Colors.textLight, marginTop: 4 },
  card: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14 },
  icon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text },
  textArea: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, textAlignVertical: 'top', minHeight: 100 },
  nivelesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  nivelChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA' },
  nivelTexto: { fontSize: 13, fontWeight: '600', color: Colors.text },
  registrarBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  registrarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});