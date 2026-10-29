import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EscanerDni from "../components/escanerDni";
import { Colors } from "../constants/colors";
import { avisar } from "../utils/alertas";
import { DatosDni, formatearDni } from "../utils/dni";
const API_URL = "http://172.28.96.1:3000/api";

type Usuario = {
  id: number;
  nombre: string;
  dni: string | null;
  fechaNacimiento: string | null;
  celular: string | null;
};

type Familiar = {
  id: number;
  parentesco: string;
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  
  celular: string | null;
  
};

// Datos comunes que usa el autocompletado
type DatosPersona = {
  nombre: string;
  dni: string | null;
  fechaNacimiento: string | null;
  
  celular: string | null;
  
};

type Persona = {
  id: string;
  etiqueta: string;
  esYo: boolean;
  datos: DatosPersona;
};

const formatearDniVisual = (dni: string | null) =>
  dni ? dni.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";

export default function PreRegistro() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  
  const [telefono, setTelefono] = useState("");
 

  const [escanerVisible, setEscanerVisible] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [cargandoPersonas, setCargandoPersonas] = useState(true);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [faltantes, setFaltantes] = useState<string[] | null>(null);
  const [verificando, setVerificando] = useState(false);
  // Trae al usuario logueado y sus familiares desde la base
  const cargarPersonas = useCallback(async () => {
    try {
      const usuarioId = await AsyncStorage.getItem("usuarioId");
      if (!usuarioId) return;

      const [resUsuario, resFamiliares] = await Promise.all([
        fetch(`${API_URL}/usuarios/${usuarioId}`),
        fetch(`${API_URL}/usuarios/${usuarioId}/familiares`),
      ]);
      if (!resUsuario.ok || !resFamiliares.ok) throw new Error();

      const usuario: Usuario = await resUsuario.json();
      const familiares: Familiar[] = await resFamiliares.json();

      setPersonas([
        {
          id: "yo",
          etiqueta: "Yo",
          esYo: true,
          datos: {
            nombre: usuario.nombre,
            dni: usuario.dni,
            fechaNacimiento: usuario.fechaNacimiento,
            
            celular: usuario.celular,
          },
        },
        ...familiares.map((f) => ({
          id: `fam-${f.id}`,
          etiqueta: `${f.nombre} (${f.parentesco})`,
          esYo: false,
          datos: {
            nombre: f.nombre,
            dni: f.dni,
            fechaNacimiento: f.fechaNacimiento,
            
            celular: f.celular,
           
          },
        })),
      ]);
    } catch {
      Alert.alert("Error", "No se pudieron cargar tus datos para autocompletar.");
    } finally {
      setCargandoPersonas(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPersonas();
    }, [cargarPersonas])
  );

  const handleAutocompletar = (p: Persona) => {
    const d = p.datos;
    setSeleccionado(p.id);
    // Se pisan todos los campos para no arrastrar datos de otra persona
    setNombre(d.nombre ?? "");
    setDni(formatearDniVisual(d.dni));
    setFechaNacimiento(d.fechaNacimiento ?? "");
    
    setTelefono(d.celular ?? "");
    

    const sinCargar: string[] = [];
    if (!d.dni) sinCargar.push("DNI");
    if (!d.fechaNacimiento) sinCargar.push("Fecha de nacimiento");
    if (!d.celular) sinCargar.push("Teléfono de contacto");
    
    setFaltantes(sinCargar);
  };

  const handleDniEscaneado = (d: DatosDni) => {
    setSeleccionado(null);
    setFaltantes(null);
    setNombre(`${d.nombres} ${d.apellido}`.trim());
    setDni(formatearDni(d.dni));
    setFechaNacimiento(d.fechaNacimiento);
  };

   const handleSiguiente = async () => {
    if (!nombre || !dni || !fechaNacimiento || !telefono) {
      avisar("Faltan datos", "Por favor completá los campos obligatorios (*).");
      return;
    }

    // Antes de seguir, verificamos que el usuario no tenga ya un turno vigente
    setVerificando(true);
    try {
      const usuarioId = await AsyncStorage.getItem("usuarioId");
      if (!usuarioId) {
        avisar("Sesión vencida", "Volvé a iniciar sesión.");
        return;
      }
      const res = await fetch(`${API_URL}/turnos/usuario/${usuarioId}/vigente`);
      if (res.ok) {
        const vigente = await res.json();
        if (vigente) {
          avisar(
            "Ya tenés un turno vigente",
            `Tenés un turno ${vigente.estado === "Activo" ? "activo" : "pendiente"} para ${
              vigente.pacienteNombre
            } en ${vigente.hospital.nombre}. Cancelalo desde "Mi Turno" antes de sacar otro.`
          );
          return;
        }
      }
    } catch {
      avisar("Error", "No se pudo conectar con el servidor.");
      return;
    } finally {
      setVerificando(false);
    }

    const yearNacimiento = parseInt(fechaNacimiento.split("/").pop() || "0");
    const edadCalculada = yearNacimiento ? new Date().getFullYear() - yearNacimiento : 0;

    const params = new URLSearchParams({
      id: id as string,
      pacienteNombre: nombre.trim(),
      pacienteDni: dni.replace(/\D/g, ""),
      pacienteEdad: edadCalculada.toString(),
      pacienteSexo: "No especificado",
      pacienteTelefono: telefono.trim(),
    }).toString();

    router.push(`/banderasRojas?${params}`);
  };

  const personaSeleccionada = personas.find((p) => p.id === seleccionado);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.paso}>Paso 1 de 3</Text>
          </View>

          <Text style={styles.titulo}>Datos Personales</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.paraQuienLabel}>¿Para quién es la consulta?</Text>
          {cargandoPersonas ? (
            <ActivityIndicator color={Colors.primary} style={{ alignSelf: "flex-start", marginBottom: 12 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={{ marginBottom: 12, maxHeight: 45 }}
            >
              {personas.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.chip, seleccionado === p.id && styles.chipActivo]}
                  onPress={() => handleAutocompletar(p)}
                >
                  <Ionicons
                    name={p.esYo ? "person" : "people"}
                    size={14}
                    color={seleccionado === p.id ? Colors.primary : Colors.textLight}
                  />
                  <Text style={[styles.chipTexto, seleccionado === p.id && styles.chipTextoActivo]}>
                    {p.etiqueta}
                  </Text>
                </Pressable>
              ))}

              <Pressable style={[styles.chip, styles.chipAgregar]} onPress={() => router.push("/familiarNuevo")}>
                <Ionicons name="add" size={14} color={Colors.primary} />
                <Text style={[styles.chipTexto, { color: Colors.primary }]}>Agregar familiar</Text>
              </Pressable>
            </ScrollView>
          )}

          {faltantes !== null && (
            <View style={styles.aviso}>
              <Ionicons
                name={faltantes.length ? "information-circle-outline" : "checkmark-circle-outline"}
                size={18}
                color={faltantes.length ? Colors.warning : Colors.success}
              />
              <Text style={styles.avisoTexto}>
                {faltantes.length
                  ? `Datos cargados. Te falta completar: ${faltantes.join(", ")}.`
                  : personaSeleccionada?.esYo
                  ? "Datos cargados desde tu perfil."
                  : "Datos cargados desde tu grupo familiar."}
              </Text>
            </View>
          )}

          <Pressable style={styles.escanearBtn} onPress={() => setEscanerVisible(true)}>
            <Ionicons name="scan-outline" size={22} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.escanearTitulo}>Escanear DNI</Text>
              <Text style={styles.escanearSub}>Completá tus datos automáticamente</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </Pressable>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre completo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Juan Sebastián Pérez"
              placeholderTextColor={Colors.textLight}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.label}>DNI / Documento *</Text>
            <TextInput
              style={styles.input}
              placeholder="12.345.678"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
              value={dni}
              onChangeText={setDni}
            />

            <Text style={styles.label}>Fecha de nacimiento *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.textLight}
              value={fechaNacimiento}
              onChangeText={setFechaNacimiento}
            />

            

            <Text style={styles.label}>Teléfono de contacto *</Text>
            <TextInput
              style={styles.input}
              placeholder="+54 9 11 5555 5555"
              placeholderTextColor={Colors.textLight}
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />

            
          </View>

          <Pressable
            style={[styles.siguienteBtn, verificando && { opacity: 0.7 }]}
            onPress={handleSiguiente}
            disabled={verificando}
          >
            {verificando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.siguienteTexto}>Siguiente paso →</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <EscanerDni
        visible={escanerVisible}
        onClose={() => setEscanerVisible(false)}
        onEscaneado={handleDniEscaneado}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  paso: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  titulo: { fontSize: 26, fontWeight: "bold", color: Colors.text },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginTop: 16, marginBottom: 24 },
  progressFill: { width: "33%", height: "100%", backgroundColor: Colors.primary, borderRadius: 3 },
  escanearBtn: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.primaryLight,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, padding: 16, marginBottom: 8,
  },
  escanearTitulo: { fontSize: 15, fontWeight: "bold", color: Colors.text },
  escanearSub: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  form: { flex: 1 },
  label: { fontSize: 13, fontWeight: "500", color: Colors.text, marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, backgroundColor: "#FAFAFA",
  },
  siguienteBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 40 },
  siguienteTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  aviso: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: Colors.surface,
    borderRadius: 10, padding: 12, marginBottom: 8,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: Colors.text, lineHeight: 17 },
  paraQuienLabel: { fontSize: 13, fontWeight: "500", color: Colors.text, marginBottom: 10 },
  chips: { gap: 8, paddingRight: 8, alignItems: "center" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#FAFAFA",
  },
  chipActivo: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipAgregar: { borderStyle: "dashed", borderColor: Colors.primary, backgroundColor: "transparent" },
  chipTexto: { fontSize: 13, color: Colors.text },
  chipTextoActivo: { color: Colors.primary, fontWeight: "bold" },
});