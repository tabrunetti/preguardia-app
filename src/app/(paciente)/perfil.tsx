import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const USER_DATA = {
  nombre: 'Tiago Abel',
  apellido: 'Brunetti',
  fechaNacimiento: '26/05/2001',
  dni: '43.413.181',
  apodo: 'Tiago',
  email: 'tiagobrunetti@hotmail.com',
  celular: null,
  fijo: null,
  direccion: null,
};

const CampoEditable = ({ label, valor, placeholder }: { label: string, valor: string | null, placeholder: string }) => {
  const tieneValor = valor !== null && valor !== '';
  return (
    <View style={[styles.campoContainer, !tieneValor && styles.campoVacio]}>
      <View style={styles.campoInfo}>
        <Text style={styles.campoLabel}>{label}</Text>
        <Text style={[styles.campoValor, !tieneValor && styles.campoPlaceholder]}>
          {tieneValor ? valor : placeholder}
        </Text>
      </View>
      <Pressable onPress={() => Alert.alert('En desarrollo', `Acá se abriría el modal para editar: ${label}`)}>
        <Text style={styles.campoAccion}>{tieneValor ? 'Editar' : 'Ingresar'}</Text>
      </Pressable>
    </View>
  );
};

export default function PerfilScreen() {
  const router = useRouter();

  const handleCerrarSesion = () => {
    router.replace('/');
  };

  const handleDatosMedicos = () => {
    Alert.alert(
      'Datos Médicos',
      'Esta sección está pendiente de diseño. Acá el paciente podrá cargar sus alergias, enfermedades crónicas y medicación.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.tituloPrincipal}>Mi Perfil</Text>

        {/* --- Sección: Datos estáticos con opción a editar --- */}
        <View style={styles.datosEstaticosCard}>
          <View style={styles.datosHeader}>
            <Text style={styles.datosEstaticosTitulo}>Datos básicos</Text>
            <Pressable onPress={() => Alert.alert('En desarrollo', 'Edición de nombre, apellido, DNI y fecha de nacimiento.')}>
              <Text style={styles.campoAccion}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.rowEstatico}>
            <View style={styles.colEstatico}>
              <Text style={styles.labelEstatico}>Nombre</Text>
              <Text style={styles.valorEstatico}>{USER_DATA.nombre}</Text>
            </View>
            <View style={styles.colEstatico}>
              <Text style={styles.labelEstatico}>Apellido</Text>
              <Text style={styles.valorEstatico}>{USER_DATA.apellido}</Text>
            </View>
          </View>
          <View style={[styles.rowEstatico, { marginTop: 16 }]}>
            <View style={styles.colEstatico}>
              <Text style={styles.labelEstatico}>Fecha de nacimiento</Text>
              <Text style={styles.valorEstatico}>{USER_DATA.fechaNacimiento}</Text>
            </View>
            <View style={styles.colEstatico}>
              <Text style={styles.labelEstatico}>Número de documento</Text>
              <Text style={styles.valorEstatico}>DNI {USER_DATA.dni}</Text>
            </View>
          </View>
        </View>

        {/* --- Sección: Apodo --- */}
        <Text style={styles.seccionTitulo}>¿Cuál es tu apodo?</Text>
        <CampoEditable 
          label="¿Cómo preferís que te llamemos?" 
          valor={USER_DATA.apodo} 
          placeholder="Ingresá tu apodo" 
        />

        {/* --- Sección: Contacto --- */}
        <Text style={styles.seccionTitulo}>¿Dónde te contactamos?</Text>
        <CampoEditable label="Email" valor={USER_DATA.email} placeholder="Ingresá un email" />
        <CampoEditable label="Teléfono celular" valor={USER_DATA.celular} placeholder="Ingresá un teléfono celular" />
        <CampoEditable label="Teléfono fijo" valor={USER_DATA.fijo} placeholder="Ingresá un teléfono fijo" />

        {/* --- Sección: Dirección --- */}
        <Text style={styles.seccionTitulo}>¿Cuál es tu dirección?</Text>
        <CampoEditable label="Dirección de residencia" valor={USER_DATA.direccion} placeholder="Ingresá tu dirección" />

        {/* --- Sección: Datos Médicos (Placeholder) --- */}
        <Text style={styles.seccionTitulo}>Información de salud</Text>
        <Pressable style={styles.actionCard} onPress={handleDatosMedicos}>
          <View style={styles.actionCardLeft}>
            <View style={styles.iconWrapper}>
              <Ionicons name="medical" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardText}>Gestionar datos médicos</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
        </Pressable>

        {/* Botón de Cerrar Sesión */}
        <Pressable style={styles.logoutBtn} onPress={handleCerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutTexto}>Cerrar sesión</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  tituloPrincipal: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 24 },
  
  datosEstaticosCard: {
    backgroundColor: Colors.surface,
    padding: 20, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, marginBottom: 32,
  },
  datosHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  datosEstaticosTitulo: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  rowEstatico: { flexDirection: 'row', justifyContent: 'space-between' },
  colEstatico: { flex: 1, paddingRight: 10 },
  labelEstatico: { fontSize: 12, color: Colors.textLight, marginBottom: 4, fontWeight: '500' },
  valorEstatico: { fontSize: 15, fontWeight: 'bold', color: Colors.text },

  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12, marginTop: 8 },
  campoContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.text, marginBottom: 12,
  },
  campoVacio: { borderColor: Colors.border, backgroundColor: '#FAFAFA' },
  campoInfo: { flex: 1 },
  campoLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
  campoValor: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  campoPlaceholder: { color: Colors.textLight, fontWeight: 'normal' },
  campoAccion: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginLeft: 16 },

  actionCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 12,
  },
  actionCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrapper: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primary + '22',
    justifyContent: 'center', alignItems: 'center',
  },
  actionCardText: { fontSize: 15, fontWeight: '600', color: Colors.text },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 32, gap: 8 },
  logoutTexto: { color: Colors.danger, fontSize: 16, fontWeight: 'bold' }
});