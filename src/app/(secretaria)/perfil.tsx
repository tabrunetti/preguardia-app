import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

export default function AdminPerfil() {
  const router = useRouter();

const handleCerrarSesion = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.tituloPrincipal}>Perfil del Personal</Text>
        
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.nombre}>María González</Text>
          <Text style={styles.rol}>Secretaria Turno Mañana</Text>
          <Text style={styles.hospital}>Hospital de Clínicas</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de la cuenta</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Documento</Text>
            <Text style={styles.infoValue}>DNI 28.345.678</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <Text style={styles.infoValue}>maria.g@hospital.com</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Horario de guardia</Text>
            <Text style={styles.infoValue}>Lunes a Viernes - 06:00 a 14:00</Text>
          </View>
        </View>

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
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  tituloPrincipal: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 24 },
  
  profileCard: { backgroundColor: Colors.surface, padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  nombre: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  rol: { fontSize: 15, color: Colors.primary, fontWeight: '500', marginBottom: 4 },
  hospital: { fontSize: 14, color: Colors.textLight },

  section: { marginBottom: 32, backgroundColor: Colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 20 },
  infoRow: { marginBottom: 16 },
  infoLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4, fontWeight: '500' },
  infoValue: { fontSize: 15, color: Colors.text, fontWeight: '500' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 16, gap: 8 },
  logoutTexto: { color: Colors.danger, fontSize: 16, fontWeight: 'bold' }
});