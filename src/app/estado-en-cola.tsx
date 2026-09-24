import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { HOSPITALES } from '../data/hospitals';
import { Ionicons } from '@expo/vector-icons';

export default function EstadoEnCola() {
  const router = useRouter();
  const { id, nivel, color, colorNombre, motivo } = useLocalSearchParams<{
    id: string;
    nivel: string;
    color: string;
    colorNombre: string;
    motivo?: string;
  }>();

  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  // Simulamos datos de la fila
  const [posicion] = useState(() => Math.floor(Math.random() * 8) + 3);
  const [esperaMin] = useState(() => Math.floor(Math.random() * 30) + 15);

  const esEmergencia = nivel === 'Emergencia';

  return (
    <SafeAreaView style={[styles.container, esEmergencia && styles.containerEmergencia]}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitulo, esEmergencia && styles.textoBlanco]}>
            {esEmergencia ? 'Registro de Emergencia' : 'Tu pre-registro está activo'}
          </Text>
          <Text style={[styles.hospitalNombre, esEmergencia && styles.textoBlanco]}>
            {hospital.nombre}
          </Text>
        </View>

        {esEmergencia ? (
          // VISTA DE EMERGENCIA
          <View style={styles.alertaBox}>
            <Ionicons name="warning" size={40} color="#fff" style={{ marginBottom: 12 }} />
            <Text style={styles.alertaTitulo}>Nivel de Triaje: Rojo (Emergencia)</Text>
            {motivo ? (
              <Text style={styles.alertaDetalle}>
                Se detectó: {motivo}. Dirigite al hospital de inmediato o llamá al servicio de emergencias médicas.
              </Text>
            ) : (
              <Text style={styles.alertaDetalle}>
                Según tus respuestas, se te asignó prioridad máxima. Al llegar, validarán tus signos vitales de inmediato.
              </Text>
            )}
          </View>
        ) : (
          // VISTA ESTÁNDAR
          <View style={styles.vistaEstandar}>
            
            {/* Círculo de Posición */}
            <View style={styles.posicionCirculo}>
              <Text style={styles.posicionLabel}>TU POSICIÓN</Text>
              <Text style={styles.posicionNumero}>#{posicion}</Text>
            </View>

            {/* Tarjeta de Nivel */}
            <View style={[styles.nivelBox, { backgroundColor: `${color}15`, borderColor: color }]}>
              <View style={styles.nivelHeader}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={[styles.nivelTexto, { color }]}>
                  Nivel estimado: {colorNombre} ({nivel})
                </Text>
              </View>
              <Text style={styles.nivelDetalle}>
                Según tus síntomas, se te asignó esta prioridad. Puede reajustarse al medir tus signos vitales en el hospital.
              </Text>
            </View>

            {/* Tarjeta de Espera */}
            <View style={styles.esperaBox}>
              <View style={styles.esperaRow}>
                <Ionicons name="time-outline" size={24} color={Colors.textLight} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.esperaLabel}>Espera aproximada</Text>
                  <Text style={styles.esperaValor}>~{esperaMin} minutos</Text>
                </View>
              </View>
              <View style={styles.esperaDivider} />
              <Text style={styles.esperaSub}>Pacientes adelante tuyo: {posicion - 1}</Text>
            </View>
          </View>
        )}

        {/* Botones Inferiores */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.llegueBtn, esEmergencia && styles.llegueBtnEmergencia]}
            onPress={() => router.replace('/home')}
          >
            <Text style={[styles.llegueTexto, esEmergencia && { color: Colors.danger }]}>
              {esEmergencia ? '🚨 LLEGUÉ AL HOSPITAL' : '📍 Ya llegué al hospital'}
            </Text>
          </Pressable>

          {!esEmergencia && (
            <Pressable style={styles.cancelarBtn} onPress={() => router.replace('/home')}>
              <Text style={styles.cancelarTexto}>Cancelar pre-registro</Text>
            </Pressable>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerEmergencia: { backgroundColor: Colors.danger },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  
  header: { alignItems: 'center', marginBottom: 32 },
  headerTitulo: { fontSize: 14, fontWeight: '600', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  hospitalNombre: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginTop: 4, textAlign: 'center' },
  textoBlanco: { color: '#fff' },

  vistaEstandar: { alignItems: 'center', flex: 1 },
  
  posicionCirculo: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 6, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 32, backgroundColor: '#fff',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  posicionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textLight, marginBottom: 4 },
  posicionNumero: { fontSize: 48, fontWeight: 'bold', color: Colors.text },

  nivelBox: { 
    width: '100%', borderRadius: 16, padding: 16, marginBottom: 16, 
    borderWidth: 1,
  },
  nivelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  nivelTexto: { fontSize: 15, fontWeight: 'bold' },
  nivelDetalle: { fontSize: 13, color: Colors.text, lineHeight: 18 },

  esperaBox: { 
    width: '100%', backgroundColor: '#FAFAFA', borderRadius: 16, padding: 16, 
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24 
  },
  esperaRow: { flexDirection: 'row', alignItems: 'center' },
  esperaLabel: { fontSize: 13, color: Colors.textLight, fontWeight: '500' },
  esperaValor: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginTop: 2 },
  esperaDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  esperaSub: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },

  alertaBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 24, marginBottom: 24,
  },
  alertaTitulo: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  alertaDetalle: { fontSize: 15, color: '#fff', marginTop: 12, textAlign: 'center', lineHeight: 22 },

  footer: { marginTop: 'auto' },
  llegueBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  llegueBtnEmergencia: { backgroundColor: '#fff' },
  llegueTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  cancelarBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelarTexto: { color: Colors.textLight, fontSize: 14, fontWeight: '600' },
});