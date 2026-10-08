import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import { HOSPITALES } from '../data/hospitals';

export default function DetalleHospital() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  const abrirMapa = () => {
    if (!hospital.lat || !hospital.lon) return;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${hospital.nombre}@${hospital.lat},${hospital.lon}`,
      android: `geo:0,0?q=${hospital.lat},${hospital.lon}(${hospital.nombre})`,
    });
    
    if (url) Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      
      {/* Contenedor de la Imagen y el Header */}
      <View style={styles.imageContainer}>
        {/* Si el hospital tiene imagen, la mostramos. Si no, va el gris con el ícono. */}
        {hospital.imagen ? (
  <Image 
    source={hospital.imagen} 
    style={styles.headerImage} 
  />
) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="business" size={60} color={Colors.border} />
          </View>
        )}

        {/* Botón flotante para volver atrás */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.nombre}>{hospital.nombre}</Text>
        <Text style={styles.direccion}>📍 {hospital.direccion}</Text>


        <Pressable onPress={abrirMapa} style={styles.mapaLink}>
          <Ionicons name="map" size={16} color={Colors.primary} />
          <Text style={styles.mapaTexto}>Ir a mapas</Text>
        </Pressable>

        {/* Cajas de Estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.primary }]}>{hospital.enEspera}</Text>
            <Text style={styles.statLabel}>En espera</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.warning }]}>{hospital.distanciaTiempo}</Text>
            <Text style={styles.statLabel}>Est. demora</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.success }]}>{hospital.gravedad}</Text>
            <Text style={styles.statLabel}>Gravedad</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Estado actual de la Guardia (por nivel)</Text>

        {/* Lista de niveles de triaje */}
        <View style={styles.nivelesContainer}>
          {hospital.niveles.map((n, index) => (
            <View 
              key={n.nivel} 
              style={[
                styles.nivelRow, 
                index === hospital.niveles.length - 1 && { borderBottomWidth: 0 } // Saca la línea al último
              ]}
            >
              <View style={styles.nivelLeft}>
                <View style={[styles.dot, { backgroundColor: n.color }]} />
                <Text style={styles.nivelNombre}>{n.nivel}</Text>
              </View>
              <Text style={styles.nivelInfo}>
                {n.pacientes} pac. ({n.detalle})
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Botón de acción principal */}
      <Pressable
        style={styles.preRegistroBtn}
        onPress={() =>
          router.push({ pathname: '/preRegistro', params: { id: hospital.id } })
        }
      >
        <Text style={styles.preRegistroTexto}>Pre-registrarme en este hospital</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Para que la imagen llene todo el espacio y no se deforme
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  nombre: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: Colors.text 
  },
  direccion: { 
    fontSize: 14, 
    color: Colors.textLight, 
    marginTop: 6 
  },
  mapaLink: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8, 
    gap: 6 
  },
  mapaTexto: { 
    fontSize: 14, 
    color: Colors.primary, 
    fontWeight: '600', 
    textDecorationLine: 'underline' 
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 24,
    gap: 12,
  },
  statBox: { 
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValor: { 
    fontSize: 18, // Lo bajamos de 20 a 18 para que entre mejor
    fontWeight: 'bold',
    textAlign: 'center' // Esto fuerza a que si se divide en dos líneas, quede al medio
  },
  statLabel: { 
    fontSize: 11, 
    color: Colors.textLight, 
    marginTop: 4, 
    textAlign: 'center',
    fontWeight: '500'
  },
  seccion: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: Colors.text, 
    marginTop: 32, 
    marginBottom: 16 
  },
  nivelesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nivelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nivelLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6 
  },
  nivelNombre: { 
    fontSize: 15, 
    fontWeight: '600',
    color: Colors.text 
  },
  nivelInfo: { 
    fontSize: 13, 
    color: Colors.textLight 
  },
  preRegistroBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
  },
  preRegistroTexto: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});