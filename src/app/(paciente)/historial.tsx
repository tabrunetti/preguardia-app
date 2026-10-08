import { Ionicons } from '@expo/vector-icons';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

// 1. Creamos los datos hardcodeados de ejemplo
const HISTORIAL_MOCK = [
  {
    id: '1',
    fecha: '12 Sep 2026',
    hospital: 'Hospital de Clínicas José de San Martín',
    motivo: 'Dolor abdominal agudo',
    nivel: 'Amarillo',
    color: Colors.warning, // Naranja/Amarillo
    estado: 'Atendido',
  },
  {
    id: '2',
    fecha: '05 Ago 2026',
    hospital: 'Hosp. Dr. Cosme Argerich',
    motivo: 'Fiebre persistente y malestar',
    nivel: 'Verde',
    color: Colors.success, // Verde
    estado: 'Atendido',
  },
  {
    id: '3',
    fecha: '18 Mar 2026',
    hospital: 'Hospital General de Agudos',
    motivo: 'Corte profundo en el brazo',
    nivel: 'Rojo',
    color: Colors.danger, // Rojo
    estado: 'Atendido',
  },
];

export default function HistorialScreen() {
  
  // 2. Armamos el diseño de cada tarjetita del historial
  const renderItem = ({ item }: { item: typeof HISTORIAL_MOCK[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.fechaContainer}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textLight} />
          <Text style={styles.fecha}>{item.fecha}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.color + '22' }]}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={[styles.badgeText, { color: item.color }]}>{item.nivel}</Text>
        </View>
      </View>

      <Text style={styles.hospitalNombre}>{item.hospital}</Text>
      
      <View style={styles.motivoContainer}>
        <Ionicons name="medical-outline" size={16} color={Colors.primary} />
        <Text style={styles.motivo}>{item.motivo}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.estadoTexto}>Estado: <Text style={{ fontWeight: 'bold' }}>{item.estado}</Text></Text>
        
      </View>
    </View>
  );

  // 3. Renderizamos la pantalla principal
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.titulo}>Mi Historial</Text>
        <Text style={styles.subtitulo}>Tus últimas consultas y pre-registros</Text>

        <FlatList
          data={HISTORIAL_MOCK}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  titulo: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  subtitulo: { 
    fontSize: 15, 
    color: Colors.textLight, 
    marginTop: 6, 
    marginBottom: 24 
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fecha: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '600',
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  hospitalNombre: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: Colors.text, 
    marginBottom: 8 
  },
  motivoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  motivo: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  estadoTexto: {
    fontSize: 13,
    color: Colors.textLight,
  }
});