import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Colors } from '../../constants/colors';
import { HOSPITALES, Hospital } from '../../data/hospitals';

// Fórmula de Haversine para calcular distancia en kilómetros
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

const demoraColor = (demora: Hospital['demora']) => {
  if (demora === 'Alta') return Colors.danger;
  if (demora === 'Media') return Colors.warning;
  return Colors.success;
};

// Extendemos el tipo Hospital para agregarle la distancia calculada
type HospitalConDistancia = Hospital & { distanciaKm?: number };

export default function HomePaciente() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [hospitalesOrdenados, setHospitalesOrdenados] = useState<HospitalConDistancia[]>(HOSPITALES);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Pedimos permiso de GPS al usuario
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Aviso', 'Sin tu ubicación, verás la lista sin ordenar por distancia.');
        setCargandoUbicacion(false);
        return;
      }

      try {
        // 2. Obtenemos las coordenadas del celular
        const ubicacion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const latUsuario = ubicacion.coords.latitude;
        const lonUsuario = ubicacion.coords.longitude;

        // 3. Calculamos la distancia para cada hospital
        const hospitalesConDistancia = HOSPITALES.map(hospital => {
          if (!hospital.lat || !hospital.lon) return { ...hospital, distanciaKm: 999 };
          const distancia = calcularDistancia(latUsuario, lonUsuario, hospital.lat, hospital.lon);
          return { ...hospital, distanciaKm: distancia };
        });

        // 4. Ordenamos de menor a mayor distancia
        const ordenados = hospitalesConDistancia.sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0));
        setHospitalesOrdenados(ordenados);

      } catch (error) {
        console.error("Error al obtener ubicación:", error);
      } finally {
        setCargandoUbicacion(false);
      }
    })();
  }, []);

  const hospitalesFiltrados = hospitalesOrdenados.filter((h) =>
    h.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const renderItem = ({ item }: { item: HospitalConDistancia }) => (
  <Pressable
    style={styles.card}
    onPress={() => router.push(`/detalleHospital?id=${item.id}`)}
  >
    {item.imagen && (
  <Image source={item.imagen} style={styles.cardImage} />
  )}

    <View style={styles.cardContent}>
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
        <Text style={styles.cardInfo}>
          📍 {item.distanciaKm ? `${item.distanciaKm.toFixed(1)} km` : item.distanciaTiempo}
        </Text>
        <Text style={styles.cardInfo}>👥 {item.enEspera} en espera</Text>
      </View>
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

      <Text style={styles.seccion}>Guardias más cercanas a vos</Text>

      {cargandoUbicacion ? (
        <View style={styles.loaderContainer}>
           <ActivityIndicator size="large" color={Colors.primary} />
           <Text style={styles.loaderText}>Calculando distancias...</Text>
        </View>
      ) : (
        <FlatList
          data={hospitalesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: Colors.textLight, fontSize: 14 },
  card: {
  backgroundColor: Colors.background,
  borderRadius: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: Colors.border,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  overflow: 'hidden', // Importante para que la imagen no se salga de los bordes redondeados
},
cardImage: {
  width: '100%',
  height: 140, // Podés jugar con esta altura
  backgroundColor: '#EEEEEE',
},
cardContent: {
  padding: 16,
},
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitulo: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardDireccion: { fontSize: 13, color: Colors.textLight, marginTop: 6, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: Colors.surface, paddingTop: 12 },
  cardInfo: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
});