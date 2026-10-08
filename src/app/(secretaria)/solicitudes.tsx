import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

const SOLICITUDES_MOCK = [
  { id: '1', nombre: 'Carlos Rodríguez', motivo: 'Dolor de pecho irradiado', nivel: 'Rojo', color: Colors.danger, llegada: '10:05' },
  { id: '2', nombre: 'Ana Silva', motivo: 'Corte profundo en brazo', nivel: 'Naranja', color: Colors.warning, llegada: '10:12' },
];

export default function SolicitudesPendientes() {
  const [solicitudes] = useState(SOLICITUDES_MOCK);

  const renderItem = ({ item }: { item: typeof SOLICITUDES_MOCK[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.pacienteNombre}>{item.nombre}</Text>
        <Text style={styles.pacienteMotivo}>{item.motivo}</Text>
        <Text style={styles.tiempo}>Llegó: {item.llegada}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.badgeText, { color: item.color }]}>{item.nivel}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>Solicitudes</Text>
        <Text style={styles.subtitulo}>{solicitudes.length} pacientes pendientes de validación</Text>
      </View>

      {solicitudes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyText}>No hay solicitudes pendientes.</Text>
        </View>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20 },
  tituloPrincipal: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  subtitulo: { fontSize: 15, color: Colors.textLight, marginTop: 4 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 16, color: Colors.textLight, marginTop: 12 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  cardBody: { flex: 1 },
  pacienteNombre: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  pacienteMotivo: { fontSize: 13, color: Colors.text, marginBottom: 4 },
  tiempo: {fontSize: 12, color: Colors.textLight, marginBottom: 10},
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: 'bold' }
});