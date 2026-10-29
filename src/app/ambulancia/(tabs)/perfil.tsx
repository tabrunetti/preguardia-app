import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../../constants/api';
import { Colors } from '../../../constants/colors';
import { cerrarSesion, obtenerSesion } from '../../../utils/sesion';

type Usuario = {
  nombre: string;
  email: string;
  dni: string | null;
  rol: string;
  hospital: { nombre: string } | null;
};

const formatearDni = (dni: string | null) =>
  dni ? dni.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 'Sin registrar';

const Fila = ({ icono, label, valor }: { icono: keyof typeof Ionicons.glyphMap; label: string; valor: string }) => (
  <View style={styles.fila}>
    <Ionicons name={icono} size={18} color={Colors.emergencia} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValor}>{valor}</Text>
    </View>
  </View>
);

export default function PerfilAmbulancia() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          setError(null);
          const { usuarioId } = await obtenerSesion();
          if (!usuarioId) {
            setError('No se encontró la sesión.');
            return;
          }
          const res = await fetch(`${API_URL}/usuarios/${usuarioId}`);
          if (!res.ok) throw new Error();
          setUsuario(await res.json());
        } catch {
          setError('No se pudieron cargar tus datos.');
        }
      })();
    }, [])
  );

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.emergencia} />
          </View>
          <Text style={styles.nombre}>{usuario?.nombre ?? ' '}</Text>
          {usuario && <Text style={styles.rol}>{usuario.rol}</Text>}
        </View>

        <View style={styles.body}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : !usuario ? (
            <ActivityIndicator color={Colors.emergencia} style={{ marginTop: 30 }} />
          ) : (
            <>
              <Text style={styles.seccion}>Datos personales</Text>
              <View style={styles.card}>
                <Fila icono="person-outline" label="Nombre" valor={usuario.nombre} />
                <Fila icono="card-outline" label="DNI" valor={formatearDni(usuario.dni)} />
              </View>

              <Text style={styles.seccion}>Contacto</Text>
              <View style={styles.card}>
                <Fila icono="mail-outline" label="Email" valor={usuario.email} />
              </View>

              <Text style={styles.seccion}>Base</Text>
              <View style={styles.card}>
                <Fila icono="business-outline" label="Hospital de base" valor={usuario.hospital?.nombre ?? 'Sin asignar'} />
              </View>
            </>
          )}

          <Pressable style={styles.logoutBtn} onPress={handleCerrarSesion}>
            <Ionicons name="log-out-outline" size={20} color={Colors.emergencia} />
            <Text style={styles.logoutTexto}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: Colors.emergencia, alignItems: 'center', paddingTop: 20, paddingBottom: 28,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  nombre: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  rol: { fontSize: 14, color: '#FECACA', marginTop: 4 },
  body: { paddingHorizontal: 24 },
  seccion: { fontSize: 17, fontWeight: 'bold', color: Colors.text, marginTop: 28, marginBottom: 12 },
  card: { borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4 },
  fila: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.emergenciaLight,
  },
  filaLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  filaValor: { fontSize: 15, fontWeight: '500', color: Colors.text },
  error: { textAlign: 'center', color: Colors.textLight, marginTop: 30 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  logoutTexto: { color: Colors.emergencia, fontSize: 16, fontWeight: 'bold' },
});