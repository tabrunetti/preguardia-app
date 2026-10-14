import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function FichaEditable() {
  const router = useRouter();

  // Recibimos los parámetros por URL
  const params = useLocalSearchParams<{
    nombre: string;
    motivo: string;
    nivel: string;
    edad?: string;
    presion?: string;
  }>();

  // Estados editables (inicializados con los datos recibidos)
  const [motivoEditable, setMotivoEditable] = useState(params.motivo || '');
  const [nivelActivo, setNivelActivo] = useState(params.nivel || 'Verde');
  const [edadEditable, setEdadEditable] = useState(params.edad || '');
  const [presionEditable, setPresionEditable] = useState(params.presion || '');

  const handleGuardarCambios = () => {
    // Acá iría la lógica para enviar los datos actualizados al servidor/estado global
    Alert.alert('Éxito', 'Ficha del paciente actualizada correctamente.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/(secretaria)/turnos')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.tituloPrincipal}>Ficha en Espera</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
           <Text style={styles.label}>Paciente</Text>
           <Text style={styles.valorPrincipal}>{params.nombre}</Text>
           
           <Text style={styles.label}>Motivo de Consulta</Text>
           <TextInput
              style={styles.input}
              value={motivoEditable}
              onChangeText={setMotivoEditable}
              multiline
           />
           
           <Text style={styles.label}>Nivel de Emergencia (Re-evaluación)</Text>
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
           
           <Text style={styles.label}>Edad</Text>
           <TextInput
              style={styles.input}
              value={edadEditable}
              onChangeText={setEdadEditable}
              keyboardType="numeric"
           />

           <Text style={styles.label}>Presión Arterial</Text>
           <TextInput
              style={styles.input}
              value={presionEditable}
              onChangeText={setPresionEditable}
              placeholder="Ej. 120/80"
           />
        </View>

        <Pressable style={styles.guardarBtn} onPress={handleGuardarCambios}>
          <Text style={styles.guardarTexto}>Guardar Cambios</Text>
        </Pressable>
      </ScrollView>
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
  valorPrincipal: { fontSize: 18, color: Colors.text, fontWeight: 'bold', marginBottom: 8 },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Colors.text },
  
  nivelesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  nivelChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA' },
  nivelTexto: { fontSize: 13, fontWeight: '600', color: Colors.text },
  
  guardarBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  guardarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});