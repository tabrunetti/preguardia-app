import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import {
  calcularNivelTriaje,
  Motivo,
  TiempoSintomas,
  Evolucion,
  BanderasRojas,
} from '../utils/triage';

const MOTIVOS: Motivo[] = [
  'Dolor', 'Fiebre', 'Dificultad respiratoria', 
  'Herida / Trauma', 'Malestar general', 'Otro'
];

const TIEMPOS: TiempoSintomas[] = ['Menos de 24 horas', '1 a 3 días', 'Más de una semana'];
const EVOLUCIONES: Evolucion[] = ['Empeora', 'Se mantiene igual', 'Mejora'];

const SIN_BANDERAS: BanderasRojas = {
  dificultadRespiratoria: false, dolorPechoConSintomas: false, perdidaConciencia: false,
  sangradoIncontrolable: false, signosACV: false, embarazoConAlarma: false, convulsionReciente: false,
};

export default function CuestionarioTriaje() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [escalaDolor, setEscalaDolor] = useState<number | null>(null);
  const [tiempoSintomas, setTiempoSintomas] = useState<TiempoSintomas | null>(null);
  const [evolucion, setEvolucion] = useState<Evolucion | null>(null);
  const [detalle, setDetalle] = useState('');

  const [temperatura, setTemperatura] = useState('');
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState('');
  const [edad, setEdad] = useState('');
  const [enfermedadCronica, setEnfermedadCronica] = useState(false);
  const [embarazo, setEmbarazo] = useState(false);

  // Valida que los campos obligatorios estén completos
  const formularioCompleto = motivo && escalaDolor !== null && tiempoSintomas && evolucion;

  const handleSiguiente = () => {
    if (!formularioCompleto) return;

    // Calculamos el nivel de urgencia usando la lógica de tu amigo
    const resultado = calcularNivelTriaje(
      {
        motivo,
        escalaDolor,
        tiempoSintomas,
        evolucion,
        signosVitales: {
          temperatura: temperatura ? parseFloat(temperatura) : undefined,
          frecuenciaCardiaca: frecuenciaCardiaca ? parseInt(frecuenciaCardiaca, 10) : undefined,
        },
        factoresRiesgo: {
          edad: edad ? parseInt(edad, 10) : undefined,
          enfermedadCronica,
          embarazo,
        },
      },
      SIN_BANDERAS
    );

    router.push(
      `/estado-en-cola?id=${id}&nivel=${resultado.nivel}&color=${encodeURIComponent(
        resultado.color
      )}&colorNombre=${resultado.colorNombre}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.paso}>Paso 3 de 3</Text>
          </View>

          {/* Título y Barra de progreso */}
          <Text style={styles.titulo}>Síntomas y Motivo</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          {/* Motivo de Consulta */}
          <Text style={styles.label}>¿Cuál es su motivo de consulta principal?</Text>
          <View style={styles.chipsContainer}>
            {MOTIVOS.map((m) => (
              <Pressable
                key={m}
                style={[styles.chip, motivo === m && styles.chipActivo]}
                onPress={() => setMotivo(m)}
              >
                <Text style={[styles.chipTexto, motivo === m && styles.chipTextoActivo]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          {/* Escala de Dolor */}
          <Text style={styles.label}>Escala de Dolor (1 al 10)</Text>
          <View style={styles.escalaRow}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                style={[styles.escalaCirculo, escalaDolor === n && styles.escalaCirculoActivo]}
                onPress={() => setEscalaDolor(n)}
              >
                <Text style={[styles.escalaNumero, escalaDolor === n && styles.escalaNumeroActivo]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.escalaLabels}>
            <Text style={styles.escalaLabelTexto}>Leve</Text>
            <Text style={styles.escalaLabelTexto}>Insoportable</Text>
          </View>

          {/* Tiempos y Evolución */}
          <Text style={styles.label}>¿Hace cuánto comenzaron los síntomas?</Text>
          <View style={styles.chipsContainer}>
            {TIEMPOS.map((t) => (
              <Pressable
                key={t}
                style={[styles.chip, tiempoSintomas === t && styles.chipActivo]}
                onPress={() => setTiempoSintomas(t)}
              >
                <Text style={[styles.chipTexto, tiempoSintomas === t && styles.chipTextoActivo]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>¿Los síntomas...?</Text>
          <View style={styles.chipsContainer}>
            {EVOLUCIONES.map((e) => (
              <Pressable
                key={e}
                style={[styles.chip, evolucion === e && styles.chipActivo]}
                onPress={() => setEvolucion(e)}
              >
                <Text style={[styles.chipTexto, evolucion === e && styles.chipTextoActivo]}>{e}</Text>
              </Pressable>
            ))}
          </View>

          {/* Detalle Opcional */}
          <Text style={styles.label}>Detalle adicional (Opcional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ej. Dolor agudo abdominal derecho..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={3}
            value={detalle}
            onChangeText={setDetalle}
          />

          {/* Sección de Signos Vitales y Datos */}
          <View style={styles.divider} />
          <Text style={styles.seccionTitulo}>Signos vitales (Opcional)</Text>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.labelSecundario}>Temperatura (°C)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 37.5"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                value={temperatura}
                onChangeText={setTemperatura}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.labelSecundario}>Frec. Cardíaca (lpm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej. 80"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                value={frecuenciaCardiaca}
                onChangeText={setFrecuenciaCardiaca}
              />
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.seccionTitulo}>Datos adicionales</Text>

          <Text style={styles.labelSecundario}>Edad del paciente</Text>
          <TextInput
            style={[styles.input, { width: 100, marginBottom: 16 }]}
            placeholder="Ej. 34"
            placeholderTextColor={Colors.textLight}
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />

          <Pressable style={styles.checkboxRow} onPress={() => setEnfermedadCronica(!enfermedadCronica)}>
            <Ionicons 
              name={enfermedadCronica ? "checkbox" : "square-outline"} 
              size={24} 
              color={enfermedadCronica ? Colors.primary : Colors.border} 
            />
            <Text style={styles.checkboxTexto}>Tengo una enfermedad crónica</Text>
          </Pressable>

          <Pressable style={styles.checkboxRow} onPress={() => setEmbarazo(!embarazo)}>
            <Ionicons 
              name={embarazo ? "checkbox" : "square-outline"} 
              size={24} 
              color={embarazo ? Colors.primary : Colors.border} 
            />
            <Text style={styles.checkboxTexto}>Estoy embarazada</Text>
          </Pressable>

          <Pressable
            style={[styles.siguienteBtn, !formularioCompleto && styles.siguienteBtnDisabled]}
            onPress={handleSiguiente}
            disabled={!formularioCompleto}
          >
            <Text style={styles.siguienteTexto}>Finalizar y ver resultado</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  paso: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginTop: 16, marginBottom: 24 },
  progressFill: { width: '100%', height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 12, marginTop: 24 },
  labelSecundario: { fontSize: 13, fontWeight: '500', color: Colors.text, marginBottom: 8 },
  
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
    borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16,
  },
  chipActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTexto: { fontSize: 14, fontWeight: '500', color: Colors.text },
  chipTextoActivo: { color: '#fff', fontWeight: 'bold' },
  
  escalaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  escalaCirculo: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
    justifyContent: 'center', alignItems: 'center',
  },
  escalaCirculoActivo: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  escalaNumero: { fontSize: 14, fontWeight: '500', color: Colors.text },
  escalaNumeroActivo: { color: '#fff', fontWeight: 'bold' },
  escalaLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  escalaLabelTexto: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  
  textArea: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, textAlignVertical: 'top', minHeight: 100,
  },
  input: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
  },
  
  rowInputs: { flexDirection: 'row', gap: 16 },
  halfInput: { flex: 1 },
  
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 32 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 20 },
  
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  checkboxTexto: { fontSize: 15, color: Colors.text, flex: 1 },
  
  siguienteBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 40,
  },
  siguienteBtnDisabled: { backgroundColor: Colors.border },
  siguienteTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});