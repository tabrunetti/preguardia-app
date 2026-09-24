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
import { Colors } from '../../constants/colors';
import { HOSPITALES, Hospital } from '../../data/hospitals';
import { Ionicons } from '@expo/vector-icons';

const demoraColor = (demora: Hospital['demora']) => {
  if (demora === 'Alta') return Colors.danger;
  if (demora === 'Media') return Colors.warning;
  return Colors.success;
};

export default function HomePaciente() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  const hospitalesFiltrados = HOSPITALES.filter((h) =>
    h.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderItem = ({ item }: { item: Hospital }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push(`/detalleHospital?id=${item.id}`)
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitulo}>{item.nombre}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: demoraColor(item.demora) + '22' },
          ]}
        >
          <Text style={[styles.badgeText, { color: demoraColor(item.demora) }]}>
            {item.demora}
          </Text>
        </View>
      </View>
      <Text style={styles.cardDireccion}>{item.direccion}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardInfo}>📍 {item.distanciaTiempo}</Text>
        <Text style={styles.cardInfo}>👥 {item.enEspera} en espera</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.saludo}>Hola, bienvenido/a</Text>
      <Text style={styles.titulo}>Buscar Hospital</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre o cercanía"
          placeholderTextColor={Colors.textLight}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <Text style={styles.seccion}>Guardias cercanas</Text>

      <FlatList
        data={hospitalesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60, paddingHorizontal: 20 },
  saludo: { fontSize: 14, color: Colors.textLight },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  seccion: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardDireccion: { fontSize: 13, color: Colors.textLight, marginTop: 6, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: Colors.surface, paddingTop: 12 },
  cardInfo: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
});