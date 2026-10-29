import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';

const API_URL = 'http://172.28.96.1:3000/api';

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  dni: string | null;
  fechaNacimiento: string | null;
  celular: string | null;
  direccion: string | null;
  rol: string;
};

type Familiar = {
  id: number;
  parentesco: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  obraSocial: string | null;
  celular: string | null;
  contactoEmergencia: string | null;
};

type CampoUsuario = 'nombre' | 'email' | 'dni' | 'fechaNacimiento' | 'celular' | 'direccion';

const formatearDniVisual = (dni: string) => dni.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------- Validaciones ----------
const validar = (campo: CampoUsuario, valor: string): string | null => {
  const v = valor.trim();
  if ((campo === 'nombre' || campo === 'email') && !v) return 'Este campo es obligatorio.';
  if (!v) return null;
  if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingresá un email válido.';
  if (campo === 'dni' && !/^\d{7,8}$/.test(v.replace(/\./g, ''))) return 'El DNI debe tener 7 u 8 números.';
  if (campo === 'fechaNacimiento' && !/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return 'Usá el formato DD/MM/AAAA.';
  if (campo === 'celular' && v.replace(/\D/g, '').length < 8) return 'Ingresá un teléfono válido.';
  return null;
};

// ---------- Campo editable en línea ----------
type CampoEditableProps = {
  label: string;
  valor: string | null;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  onGuardar: (nuevoValor: string) => Promise<boolean>;
};

const CampoEditable = ({
  label,
  valor,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  onGuardar,
}: CampoEditableProps) => {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(valor ?? '');
  const [guardando, setGuardando] = useState(false);
  const tieneValor = valor !== null && valor !== '';

  const empezarEdicion = () => {
    setTexto(valor ?? '');
    setEditando(true);
  };

  const guardar = async () => {
    setGuardando(true);
    const ok = await onGuardar(texto);
    setGuardando(false);
    if (ok) setEditando(false);
  };

  if (editando) {
    return (
      <View style={[styles.campoContainer, styles.campoEditando]}>
        <View style={styles.campoInfo}>
          <Text style={styles.campoLabel}>{label}</Text>
          <TextInput
            style={styles.campoInput}
            value={texto}
            onChangeText={setTexto}
            placeholder={placeholder}
            placeholderTextColor={Colors.textLight}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoFocus
            editable={!guardando}
            onSubmitEditing={guardar}
          />
          <View style={styles.accionesEdicion}>
            <Pressable onPress={() => setEditando(false)} disabled={guardando} hitSlop={8}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.guardarBtn} onPress={guardar} disabled={guardando}>
              {guardando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.guardarTexto}>Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.campoContainer, !tieneValor && styles.campoVacio]}>
      <View style={styles.campoInfo}>
        <Text style={styles.campoLabel}>{label}</Text>
        <Text style={[styles.campoValor, !tieneValor && styles.campoPlaceholder]}>
          {tieneValor ? valor : placeholder}
        </Text>
      </View>
      <Pressable onPress={empezarEdicion} hitSlop={8}>
        <Text style={styles.campoAccion}>{tieneValor ? 'Editar' : 'Ingresar'}</Text>
      </Pressable>
    </View>
  );
};

// ---------- Pantalla ----------
export default function PerfilScreen() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setError(null);
      const id = await AsyncStorage.getItem('usuarioId');
      if (!id) {
        setError('No se encontró la sesión. Volvé a iniciar sesión.');
        return;
      }

      const [resUsuario, resFamiliares] = await Promise.all([
        fetch(`${API_URL}/usuarios/${id}`),
        fetch(`${API_URL}/usuarios/${id}/familiares`),
      ]);
      if (!resUsuario.ok || !resFamiliares.ok) throw new Error();

      setUsuario(await resUsuario.json());
      setFamiliares(await resFamiliares.json());
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  }, []);

  // Se recarga cada vez que volvés a esta pantalla (por ejemplo, después de agregar un familiar)
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const actualizarCampo = async (campo: CampoUsuario, valor: string): Promise<boolean> => {
    if (!usuario) return false;

    const errorValidacion = validar(campo, valor);
    if (errorValidacion) {
      Alert.alert('Dato inválido', errorValidacion);
      return false;
    }

    const valorFinal = campo === 'dni' ? valor.replace(/\./g, '').trim() : valor.trim();

    try {
      const res = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [campo]: valorFinal }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        Alert.alert('Error', data?.error ?? 'No se pudo guardar el cambio.');
        return false;
      }
      setUsuario(data);
      return true;
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
      return false;
    }
  };

  const eliminarFamiliar = async (f: Familiar) => {
    if (!usuario) return;
    try {
      const res = await fetch(`${API_URL}/usuarios/${usuario.id}/familiares/${f.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        Alert.alert('Error', data?.error ?? 'No se pudo eliminar el familiar.');
        return;
      }
      setFamiliares((prev) => prev.filter((x) => x.id !== f.id));
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  const confirmarEliminar = (f: Familiar) => {
    Alert.alert('Eliminar familiar', `¿Querés quitar a ${f.nombre} de tu grupo familiar?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminarFamiliar(f) },
    ]);
  };

  const handleCerrarSesion = async () => {
    await AsyncStorage.removeItem('usuarioId');
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloPrincipalHeader}>Mi perfil</Text>
        <Text style={styles.subtituloHeader}>Gestión de datos y familiares</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {cargando ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : error || !usuario ? (
            <View style={styles.errorBox}>
              <Ionicons name="cloud-offline-outline" size={48} color={Colors.textLight} />
              <Text style={styles.errorTexto}>{error ?? 'No se pudieron cargar tus datos.'}</Text>
              <Pressable
                style={styles.reintentarBtn}
                onPress={() => {
                  setCargando(true);
                  cargarDatos();
                }}
              >
                <Text style={styles.reintentarTexto}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.seccionTitulo}>Datos básicos</Text>
              <CampoEditable
                label="Nombre completo"
                valor={usuario.nombre}
                placeholder="Ingresá tu nombre y apellido"
                autoCapitalize="words"
                onGuardar={(v) => actualizarCampo('nombre', v)}
              />
              <CampoEditable
                label="Número de documento"
                valor={usuario.dni}
                placeholder="Ingresá tu DNI"
                keyboardType="numeric"
                onGuardar={(v) => actualizarCampo('dni', v)}
              />
              <CampoEditable
                label="Fecha de nacimiento"
                valor={usuario.fechaNacimiento}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                onGuardar={(v) => actualizarCampo('fechaNacimiento', v)}
              />

              <Text style={styles.seccionTitulo}>¿Dónde te contactamos?</Text>
              <CampoEditable
                label="Email"
                valor={usuario.email}
                placeholder="Ingresá un email"
                keyboardType="email-address"
                autoCapitalize="none"
                onGuardar={(v) => actualizarCampo('email', v)}
              />
              <CampoEditable
                label="Teléfono celular"
                valor={usuario.celular}
                placeholder="Ingresá un teléfono celular"
                keyboardType="phone-pad"
                onGuardar={(v) => actualizarCampo('celular', v)}
              />

              <Text style={styles.seccionTitulo}>¿Cuál es tu dirección?</Text>
              <CampoEditable
                label="Dirección de residencia"
                valor={usuario.direccion}
                placeholder="Ingresá tu dirección"
                onGuardar={(v) => actualizarCampo('direccion', v)}
              />

              <Text style={styles.seccionTitulo}>Grupo familiar</Text>
              <Text style={styles.familiaSub}>
                Personas a tu cargo que vas a poder pre-registrar en una emergencia.
              </Text>

              {familiares.length === 0 && (
                <Text style={styles.sinFamiliares}>Todavía no agregaste familiares.</Text>
              )}

              {familiares.map((f) => (
                <View key={f.id} style={styles.familiarCard}>
                  <View style={styles.familiarAvatar}>
                    <Text style={styles.familiarInicial}>{f.nombre.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.familiarNombre}>
                      {f.nombre} 
                    </Text>
                    <Text style={styles.familiarDetalle}>
                      {f.parentesco} · DNI {formatearDniVisual(f.dni)}
                    </Text>
                  </View>
                  <Pressable onPress={() => confirmarEliminar(f)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color={Colors.textLight} />
                  </Pressable>
                </View>
              ))}

              <Pressable style={styles.agregarFamiliarBtn} onPress={() => router.push('/familiarNuevo')}>
                <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                <Text style={styles.agregarFamiliarTexto}>Agregar familiar</Text>
              </Pressable>
            </>
          )}

          <Pressable style={styles.logoutBtn} onPress={handleCerrarSesion}>
            <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
            <Text style={styles.logoutTexto}>Cerrar sesión</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24, paddingBottom: 40 },

  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 12, marginTop: 8 },

  campoContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.text, marginBottom: 12,
  },
  campoVacio: { borderColor: Colors.border, backgroundColor: '#FAFAFA' },
  campoEditando: { borderColor: Colors.primary, backgroundColor: '#fff' },
  campoInfo: { flex: 1 },
  campoLabel: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
  campoValor: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  campoPlaceholder: { color: Colors.textLight, fontWeight: 'normal' },
  campoAccion: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginLeft: 16 },
  campoInput: {
    fontSize: 15, color: Colors.text, borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 6,
  },
  accionesEdicion: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 20, marginTop: 12 },
  cancelarTexto: { color: Colors.textLight, fontWeight: '600', fontSize: 14 },
  guardarBtn: {
    backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16,
    minWidth: 80, alignItems: 'center',
  },
  guardarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  errorBox: { alignItems: 'center', paddingVertical: 32 },
  errorTexto: { fontSize: 14, color: Colors.textLight, textAlign: 'center', marginTop: 12 },
  reintentarBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 },
  reintentarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 32, gap: 8 },
  logoutTexto: { color: Colors.danger, fontSize: 16, fontWeight: 'bold' },

  familiaSub: { fontSize: 13, color: Colors.textLight, marginBottom: 12, marginTop: -6 },
  sinFamiliares: { fontSize: 14, color: Colors.textLight, fontStyle: 'italic', marginBottom: 12 },
  familiarCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, marginBottom: 10,
  },
  familiarAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  familiarInicial: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  familiarNombre: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  familiarDetalle: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  agregarFamiliarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14,
    borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.primary, marginTop: 4,
  },
  agregarFamiliarTexto: { color: Colors.primary, fontWeight: 'bold', fontSize: 15 },

  header: {
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20,
  },
  tituloPrincipalHeader: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  subtituloHeader: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
});