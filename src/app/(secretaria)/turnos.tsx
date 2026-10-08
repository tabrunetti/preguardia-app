import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

const COLA_INICIAL = [
  { id: '1', nombre: 'Carlos Rodríguez', motivo: 'Dolor de pecho irradiado', nivel: 'Rojo', color: Colors.danger, edad: 45, presion: '140/90' },
  { id: '2', nombre: 'Ana Silva', motivo: 'Corte profundo en brazo', nivel: 'Naranja', color: Colors.warning, edad: 28, presion: '120/80' },
  { id: '3', nombre: 'Roberto Gómez', motivo: 'Fiebre persistente 39°', nivel: 'Amarillo', color: '#EAB308', edad: 52, presion: '130/85' },
  { id: '4', nombre: 'Lucía Fernández', motivo: 'Esguince de tobillo', nivel: 'Verde', color: Colors.success, edad: 19, presion: '110/70' },
];

export default function AdminTurnosCola() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState(COLA_INICIAL);

  const handleAtender = (id: string, nombre: string) => {
    Alert.alert(
      'Paciente atendido',
      `¿Confirmar que ${nombre} ya ingresó al consultorio?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, confirmar', 
          style: 'destructive',
          onPress: () => {
            setPacientes(prev => prev.filter(p => p.id !== id));
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: typeof COLA_INICIAL[0], index: number }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.posicion}>#{index + 1}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.pacienteNombre}>{item.nombre}</Text>
        <Text style={styles.pacienteMotivo}>{item.motivo}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.badgeText, { color: item.color }]}>{item.nivel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
         <Pressable 
            style={styles.infoBtn} 
            // Pasamos los datos del paciente a la nueva pantalla
            onPress={() => router.push({ pathname: '/(secretaria)/detallePaciente', params: { nombre: item.nombre, motivo: item.motivo, nivel: item.nivel, edad: item.edad, presion: item.presion } })}
         >
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
        </Pressable>
        <Pressable style={styles.atenderBtn} onPress={() => handleAtender(item.id, item.nombre)}>
          <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>Sala de Espera</Text>
        <Text style={styles.subtitulo}>{pacientes.length} pacientes en cola</Text>
      </View>

      {pacientes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-done-circle-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyText}>La sala de espera está vacía.</Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
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
  cardLeft: { width: 40, alignItems: 'center', justifyContent: 'center' },
  posicion: { fontSize: 18, fontWeight: 'bold', color: Colors.textLight },
  cardBody: { flex: 1, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: Colors.border, paddingRight: 8 },
  pacienteNombre: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  pacienteMotivo: { fontSize: 13, color: Colors.textLight, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  actionsContainer: { flexDirection: 'column', gap: 8},
  infoBtn: { padding: 8, backgroundColor: Colors.primary + '15', borderRadius: 10, borderWidth: 1, borderColor: Colors.primary + '40', alignItems: 'center' },
  atenderBtn: { padding: 8, backgroundColor: Colors.success + '15', borderRadius: 10, borderWidth: 1, borderColor: Colors.success + '40', alignItems: 'center' }
});