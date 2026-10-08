import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

export default function DetallePaciente() {
  const router = useRouter();

  const { nombre, motivo, nivel, edad, presion } = useLocalSearchParams<{
    nombre: string;
    motivo: string;
    nivel: string;
    edad?: string;
    presion?: string;
  }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.tituloPrincipal}>Ficha Médica</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
           <Text style={styles.label}>Paciente</Text>
           <Text style={styles.valor}>{nombre}</Text>
           
           <Text style={styles.label}>Motivo de Consulta</Text>
           <Text style={styles.valor}>{motivo}</Text>
           
           <Text style={styles.label}>Prioridad Asignada</Text>
           <Text style={styles.valor}>{nivel}</Text>
           
           <Text style={styles.label}>Edad</Text>
           <Text style={styles.valor}>{edad || 'No especificada'} años</Text>

           <Text style={styles.label}>Presión Arterial (Último control)</Text>
           <Text style={styles.valor}>{presion || 'Sin registrar'}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, marginBottom: 20 },
  backButton: { marginRight: 16 },
  tituloPrincipal: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  content: { paddingHorizontal: 24 },
  infoCard: { backgroundColor: Colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  label: { fontSize: 13, color: Colors.textLight, marginBottom: 4, fontWeight: '500', marginTop: 16 },
  valor: { fontSize: 16, color: Colors.text, fontWeight: 'bold' }
});