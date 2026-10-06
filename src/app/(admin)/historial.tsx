import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../../constants/colors';

const HISTORIAL_ATENDIDOS = [
  { id: '101', nombre: 'Martín Pérez', motivo: 'Cefalea intensa', nivel: 'Verde', hora: '14:30' },
  { id: '102', nombre: 'Sofía Castro', motivo: 'Traumatismo de rodilla', nivel: 'Amarillo', hora: '13:15' },
  { id: '103', nombre: 'Juan Ignacio Ruiz', motivo: 'Dolor abdominal agudo', nivel: 'Naranja', hora: '12:00' },
  { id: '104', nombre: 'Lucas Medina', motivo: 'Corte superficial', nivel: 'Verde', hora: '11:45' },
];

export default function AdminHistorial() {
  const [busqueda, setBusqueda] = useState('');

  // Filtramos solo por nombre de paciente
  const pacientesFiltrados = HISTORIAL_ATENDIDOS.filter((item) => 
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof HISTORIAL_ATENDIDOS[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pacienteNombre}>{item.nombre}</Text>
        <Text style={styles.hora}>{item.hora}</Text>
      </View>
      <Text style={styles.pacienteMotivo}>{item.motivo}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Prioridad: {item.nivel}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>Historial Guardia</Text>
        <Text style={styles.subtitulo}>Pacientes atendidos en el día</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Buscar por paciente..."
            placeholderTextColor={Colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      <FlatList
        data={pacientesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noResultText}>No se encontraron resultados.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 16 },
  tituloPrincipal: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 15, color: Colors.textLight, marginTop: 4, marginBottom: 20 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14 },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },

  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  noResultText: { textAlign: 'center', color: Colors.textLight, marginTop: 20, fontSize: 15 },
  
  card: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  pacienteNombre: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  hora: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
  pacienteMotivo: { fontSize: 14, color: Colors.text, marginBottom: 12 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  
  badge: { backgroundColor: '#FAFAFA', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: Colors.textLight }
});