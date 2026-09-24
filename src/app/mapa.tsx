import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { HOSPITALES, Hospital } from '../data/hospitals';

export default function Mapa() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  const resultados = HOSPITALES.filter((h) =>
    h.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderItem = ({ item }: { item: Hospital }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() =>
        router.push({ pathname: '/detalleHospital', params: { id: item.id } })
      }
    >
      <Text style={styles.resultNombre}>{item.nombre}</Text>
      <Text style={styles.resultDireccion}>{item.direccion}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Buscar Hospital</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre o cercanía..."
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderTexto}>
          🗺️ Vista de mapa{'\n'}(pendiente integrar react-native-maps)
        </Text>
      </View>

      <Text style={styles.resultadosCount}>{resultados.length} resultados</Text>

      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 12 }}
      />

      <Pressable style={styles.buscarZonaBtn}>
        <Text style={styles.buscarZonaTexto}>Buscar en esta zona</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60, paddingHorizontal: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 220,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapPlaceholderTexto: { textAlign: 'center', color: Colors.textLight, fontSize: 13 },
  resultadosCount: { fontSize: 13, color: Colors.textLight, marginBottom: 8 },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  resultNombre: { fontSize: 14, fontWeight: '600', color: Colors.text },
  resultDireccion: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  buscarZonaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  buscarZonaTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
});