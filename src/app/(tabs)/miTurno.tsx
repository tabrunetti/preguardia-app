import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MiTurnoScreen() {
  const router = useRouter();
  
  // Estado para simular si el usuario tiene un turno activo o no
  const [tieneTurno, setTieneTurno] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header con el botón para cambiar de estado (solo para la demo) */}
      <View style={styles.header}>
        <Text style={styles.tituloPrincipal}>Mi Turno</Text>
        <Pressable 
          style={styles.demoToggle} 
          onPress={() => setTieneTurno(!tieneTurno)}
        >
          <Ionicons name="swap-horizontal" size={16} color={Colors.primary} />
          <Text style={styles.demoToggleText}>Simular</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {!tieneTurno ? (
          
          /* --- ESTADO 1: SIN TURNO ACTIVO --- */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-clear-outline" size={60} color={Colors.textLight} />
            </View>
            <Text style={styles.emptyTitulo}>No tenés turnos activos</Text>
            <Text style={styles.emptySubtitulo}>
              Actualmente no estás registrado en ninguna fila de espera virtual.
            </Text>
            <Pressable 
              style={styles.primaryButton} 
              onPress={() => router.replace('/home')}
            >
              <Text style={styles.primaryButtonText}>Buscar guardia cercana</Text>
            </Pressable>
          </View>

        ) : (

          /* --- ESTADO 2: CON TURNO ACTIVO (Ticket) --- */
          <View>
            <Text style={styles.subtitulo}>Información de tu pre-registro actual</Text>

            <View style={styles.ticketContainer}>
              {/* Cabecera del Ticket */}
              <View style={styles.ticketHeader}>
                <View style={styles.hospitalInfo}>
                  <Ionicons name="business" size={24} color={Colors.primary} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.hospitalNombre}>Hospital de Clínicas</Text>
                    <Text style={styles.hospitalDireccion}>Av. Córdoba 2351, CABA</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ticketDivider}>
                <View style={[styles.ticketNotch, styles.notchLeft]} />
                <View style={styles.dashedLine} />
                <View style={[styles.ticketNotch, styles.notchRight]} />
              </View>

              {/* Cuerpo del Ticket */}
              <View style={styles.ticketBody}>
                <View style={styles.statusRow}>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Tu posición</Text>
                    <Text style={styles.statusValue}>#3</Text>
                  </View>
                  <View style={styles.statusDivider} />
                  <View style={styles.statusBox}>
                    <Text style={styles.statusLabel}>Espera est.</Text>
                    <Text style={styles.statusValue}>~20 min</Text>
                  </View>
                </View>

                <View style={styles.nivelBadge}>
                  <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
                  <Text style={[styles.nivelTexto, { color: Colors.warning }]}>
                    Nivel de Triaje: Amarillo (Moderado)
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={20} color={Colors.textLight} />
                  <Text style={styles.infoText}>
                    Al llegar a la recepción, mencioná tu DNI para validar este turno.
                  </Text>
                </View>
              </View>
            </View>

            {/* Acciones */}
            <Pressable style={styles.llegueBtn} onPress={() => setTieneTurno(false)}>
              <Text style={styles.llegueTexto}>📍 Ya llegué al hospital</Text>
            </Pressable>

            <Pressable style={styles.cancelarBtn} onPress={() => setTieneTurno(false)}>
              <Text style={styles.cancelarTexto}>Cancelar pre-registro</Text>
            </Pressable>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, marginBottom: 12
  },
  tituloPrincipal: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  demoToggle: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4
  },
  demoToggleText: { fontSize: 12, fontWeight: 'bold', color: Colors.primary },
  content: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  subtitulo: { fontSize: 15, color: Colors.textLight, marginBottom: 20 },

  // Estilos del Estado Vacío
  emptyStateContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60,
  },
  emptyIconCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  emptyTitulo: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  emptySubtitulo: { fontSize: 14, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20, marginBottom: 32 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Estilos del Ticket
  ticketContainer: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
    marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  ticketHeader: { padding: 20, backgroundColor: '#FAFAFA', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  hospitalInfo: { flexDirection: 'row', alignItems: 'center' },
  hospitalNombre: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  hospitalDireccion: { fontSize: 13, color: Colors.textLight },
  
  ticketDivider: { height: 20, flexDirection: 'row', alignItems: 'center', position: 'relative', backgroundColor: '#fff' },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', marginHorizontal: 10 },
  ticketNotch: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, position: 'absolute', zIndex: 1, borderWidth: 1, borderColor: Colors.border },
  notchLeft: { left: -11 },
  notchRight: { right: -11 },

  ticketBody: { padding: 20 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  statusBox: { flex: 1, alignItems: 'center' },
  statusLabel: { fontSize: 12, color: Colors.textLight, fontWeight: '500', marginBottom: 4 },
  statusValue: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  statusDivider: { width: 1, height: 40, backgroundColor: Colors.border },

  nivelBadge: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.warning + '15', paddingVertical: 12, borderRadius: 12, marginBottom: 24,
    borderWidth: 1, borderColor: Colors.warning
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  nivelTexto: { fontSize: 14, fontWeight: 'bold' },

  infoBox: { flexDirection: 'row', backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 12, color: Colors.textLight, marginLeft: 8, lineHeight: 18 },

  // Botones
  llegueBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  llegueTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelarBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelarTexto: { color: Colors.danger, fontSize: 14, fontWeight: '600' },
});