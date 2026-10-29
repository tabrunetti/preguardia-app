import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from '../constants/colors';
import { BanderasRojas, hayBanderaRoja } from '../utils/triage';

// Reemplazá con tu IP local
const API_URL = 'http://192.168.1.23:3000/api'; 

const PREGUNTAS: { key: keyof BanderasRojas; texto: string }[] = [
  { key: 'dificultadRespiratoria', texto: '¿Tiene dificultad para respirar en este momento?' },
  { key: 'dolorPechoConSintomas', texto: '¿Tiene dolor de pecho junto con sudoración fría, falta de aire o dolor que baja al brazo?' },
  { key: 'signosACV', texto: '¿Tiene dificultad para hablar, debilidad repentina de un lado del cuerpo o la cara caída?' },
  { key: 'perdidaConciencia', texto: '¿Perdió el conocimiento o está muy confundido/a?' },
  { key: 'sangradoIncontrolable', texto: '¿Tiene un sangrado que no logra detener?' },
  { key: 'embarazoConAlarma', texto: '¿Está embarazada con sangrado o dolor abdominal fuerte?' },
  { key: 'convulsionReciente', texto: '¿Tuvo una convulsión en los últimos 30 minutos?' },
];

export default function BanderasRojasScreen() {
  const router = useRouter();
  
  // Ahora capturamos TODOS los parámetros de la URL, no solo el ID
  const params = useLocalSearchParams(); 

  const [respuestas, setRespuestas] = useState<BanderasRojas>({
    dificultadRespiratoria: false,
    dolorPechoConSintomas: false,
    perdidaConciencia: false,
    sangradoIncontrolable: false,
    signosACV: false,
    embarazoConAlarma: false,
    convulsionReciente: false,
  });

  // Hacemos la función asíncrona para poder usar fetch
  const handleContinuar = async () => {
    const bandera = hayBanderaRoja(respuestas);

    if (bandera.activa) {
      try {
        // LEEMOS EL ID DEL USUARIO GUARDADO EN MEMORIA
        const creadorIdString = await AsyncStorage.getItem('usuarioId');
        const creadorId = creadorIdString ? parseInt(creadorIdString, 10) : null;

        const response = await fetch(`${API_URL}/turnos`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospitalId: params.id,
            creadorId: creadorId, // <--- AGREGAMOS EL CREADOR ID ACÁ
            pacienteNombre: params.pacienteNombre,
            pacienteDni: params.pacienteDni,
            pacienteEdad: Number(params.pacienteEdad) || 0,
            motivo: bandera.motivo, 
            nivel: 'Resucitación', 
            color: '#EF4444',
            triaje: respuestas 
          })
        });

        if (!response.ok) {
          Alert.alert('Error', 'No se pudo generar el turno de emergencia en el sistema.');
          return;
        }

        router.push('/(paciente)/miTurno');
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Problema de conexión con el servidor.');
      }
      return;
    }

    // SI NO HAY BANDERA ROJA: Pasamos los datos a la última pantalla
    const nextParams = new URLSearchParams({
      ...(params as any), // Copiamos id, nombre, dni, edad...
      banderasData: JSON.stringify(respuestas) // Pasamos las respuestas negativas
    }).toString();

    router.push(`/cuestionario-triaje?${nextParams}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.paso}>Paso 2 de 3</Text>
        </View>

        <Text style={styles.titulo}>Antes de continuar</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.subtitulo}>
          Estas preguntas nos ayudan a detectar situaciones que requieren atención inmediata. Respondé con sinceridad.
        </Text>

        <View style={styles.preguntasContainer}>
          {PREGUNTAS.map((p) => (
            <View key={p.key} style={styles.preguntaRow}>
              <Text style={styles.preguntaTexto}>{p.texto}</Text>
              
              <View style={styles.opciones}>
                <Pressable
                  style={[styles.opcionBtn, respuestas[p.key] && styles.opcionBtnActivaSi]}
                  onPress={() => setRespuestas((prev) => ({ ...prev, [p.key]: true }))}
                >
                  <Text style={[styles.opcionTexto, respuestas[p.key] && styles.opcionTextoActivo]}>Sí</Text>
                </Pressable>
                
                <Pressable
                  style={[styles.opcionBtn, !respuestas[p.key] && styles.opcionBtnActivaNo]}
                  onPress={() => setRespuestas((prev) => ({ ...prev, [p.key]: false }))}
                >
                  <Text style={[styles.opcionTexto, !respuestas[p.key] && styles.opcionTextoActivo]}>No</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.continuarBtn} onPress={handleContinuar}>
          <Text style={styles.continuarTexto}>Continuar</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  paso: { 
    fontSize: 14, 
    fontWeight: '600',
    color: Colors.primary 
  },
  titulo: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: Colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 16,
  },
  progressFill: {
    width: '66%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  subtitulo: { 
    fontSize: 14, 
    color: Colors.textLight, 
    marginBottom: 24,
    lineHeight: 20,
  },
  preguntasContainer: {
    marginTop: 8,
  },
  preguntaRow: {
    marginBottom: 24,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preguntaTexto: { 
    fontSize: 15, 
    color: Colors.text, 
    marginBottom: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  opciones: { 
    flexDirection: 'row', 
    gap: 12 
  },
  opcionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  opcionBtnActivaSi: { 
    backgroundColor: Colors.danger, 
    borderColor: Colors.danger 
  },
  opcionBtnActivaNo: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primary 
  },
  opcionTexto: { 
    fontSize: 15, 
    fontWeight: '600',
    color: Colors.textLight 
  },
  opcionTextoActivo: { 
    color: '#fff',
  },
  continuarBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continuarTexto: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});