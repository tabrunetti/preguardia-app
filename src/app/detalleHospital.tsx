import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';

// La IP de tu compu
const API_URL = 'http://192.168.1.23:3000/api'; 

export default function DetalleHospital() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [hospital, setHospital] = useState<any>(null);
  const [stats, setStats] = useState<any>(null); // <--- NUEVO: Estado para las estadísticas
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        // Buscamos los datos del hospital y las estadísticas al mismo tiempo
        const [resHospital, resStats] = await Promise.all([
          fetch(`${API_URL}/hospitales/${id}`),
          fetch(`${API_URL}/hospitales/${id}/stats`)
        ]);

        if (!resHospital.ok) throw new Error('No se pudo cargar el hospital');
        
        const dataHospital = await resHospital.json();
        setHospital(dataHospital);

        // Guardamos las estadísticas si responde bien, sino ponemos todo en 0
        if (resStats.ok) {
           const dataStats = await resStats.json();
           setStats(dataStats);
        } else {
           setStats({ totalEnEspera: 0, demoraEstimadaMinutos: 0, niveles: {} });
        }

      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    if (id) {
      fetchDatos();
    }
  }, [id]);

  const abrirMapa = () => {
    if (!hospital?.lat || !hospital?.lon) return;
    
    const url = Platform.select({
      ios: `maps:0,0?q=${hospital.nombre}@${hospital.lat},${hospital.lon}`,
      android: `geo:0,0?q=${hospital.lat},${hospital.lon}(${hospital.nombre})`,
    });
    
    if (url) Linking.openURL(url);
  };

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!hospital) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No se encontró el hospital.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} bounces={false}>
      
      <View style={styles.imageContainer}>
        {hospital.imagen ? (
          <Image 
            source={{ uri: hospital.imagen }} 
            style={styles.headerImage} 
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="business" size={60} color={Colors.border} />
          </View>
        )}

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

        {/* --- ESTADÍSTICAS DINÁMICAS --- */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.primary }]}>{stats?.totalEnEspera || 0}</Text>
            <Text style={styles.statLabel}>En espera</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.warning }]}>{stats?.demoraEstimadaMinutos || 0} min</Text>
            <Text style={styles.statLabel}>Est. demora</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValor, { color: Colors.success }]}>
               {stats?.niveles['Resucitación'] > 0 || stats?.niveles['Emergencia'] > 0 ? 'Alta' : 'Baja'}
            </Text>
            <Text style={styles.statLabel}>Gravedad</Text>
          </View>
        </View>

        <Text style={styles.seccion}>Estado actual de la Guardia (por nivel)</Text>

        <View style={styles.nivelesContainer}>
            {stats && stats.niveles && Object.entries(stats.niveles).map(([nivelNombre, cantidad], index, array) => {
                let colorPunto = Colors.success;
                if (nivelNombre === 'Resucitación') colorPunto = Colors.danger;
                if (nivelNombre === 'Emergencia') colorPunto = '#FF5722'; 
                if (nivelNombre === 'Urgencia') colorPunto = Colors.warning;
                if (nivelNombre === 'Menos Urgente') colorPunto = '#CDDC39'; 

                return (
                    <View key={nivelNombre} style={[styles.nivelRow, index === array.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.nivelLeft}>
                        <View style={[styles.dot, { backgroundColor: colorPunto }]} />
                        <Text style={styles.nivelNombre}>{nivelNombre}</Text>
                    </View>
                    <Text style={styles.nivelInfo}>{String(cantidad)} pac.</Text>
                    </View>
                );
            })}
            
            {(!stats || !stats.niveles || Object.keys(stats.niveles).length === 0) && (
              <View style={[styles.nivelRow, { borderBottomWidth: 0, justifyContent: 'center' }]}>
                <Text style={styles.nivelInfo}>Sin pacientes en espera</Text>
              </View>
            )}
        </View>
      </View>

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
    resizeMode: 'cover', 
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
    fontSize: 18, 
    fontWeight: 'bold',
    textAlign: 'center' 
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