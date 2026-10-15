import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { HOSPITALES } from "../data/hospitals";
import { DatosPersona, useFamiliares, USER_DATA } from "../data/paciente";
import { DatosDni, formatearDni } from "../utils/dni";
export default function PreRegistro() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [obraSocial, setObraSocial] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");

  const [escanerVisible, setEscanerVisible] = useState(false);
    const familiares = useFamiliares();
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [faltantes, setFaltantes] = useState<string[] | null>(null);

  const personas = [
    { id: "yo", etiqueta: "Yo", datos: USER_DATA as DatosPersona },
    ...familiares.map((f) => ({
      id: f.id,
      etiqueta: `${f.nombre} (${f.parentesco})`,
      datos: f as DatosPersona,
    })),
  ];

  const handleAutocompletar = (id: string, p: DatosPersona) => {
    setSeleccionado(id);
    setNombre(`${p.nombre} ${p.apellido}`);
    setDni(p.dni);
    setFechaNacimiento(p.fechaNacimiento);
    // Se pisan todos los campos para no arrastrar datos de otra persona
    setObraSocial(p.obraSocial ?? "");
    setTelefono(p.celular ?? "");
    setContactoEmergencia(p.contactoEmergencia ?? "");

    const sinCargar: string[] = [];
    if (!p.celular) sinCargar.push("Teléfono de contacto");
    if (!p.contactoEmergencia) sinCargar.push("Contacto de emergencia");
    setFaltantes(sinCargar);
  };
  const handleDniEscaneado = (d: DatosDni) => {
    setNombre(`${d.nombres} ${d.apellido}`);
    setDni(formatearDni(d.dni));
    setFechaNacimiento(d.fechaNacimiento);
  };

  const handleSiguiente = () => {
    router.push(`/banderasRojas?id=${hospital.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={{ marginBottom: 12 }}
          >
            {personas.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.chip, seleccionado === p.id && styles.chipActivo]}
                onPress={() => handleAutocompletar(p.id, p.datos)}
              >
                <Ionicons
                  name={p.id === "yo" ? "person" : "people"}
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
              <Text style={[styles.chipTexto, { color: Colors.primary }]}>Agregar</Text>
            </Pressable>
          </ScrollView>

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
                  : "Datos cargados desde tu perfil."}
              </Text>
            </View>
          )}
          <Pressable
            style={styles.escanearBtn}
            onPress={() => setEscanerVisible(true)}
          >
            <Ionicons name="scan-outline" size={22} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.escanearTitulo}>Escanear DNI</Text>
              <Text style={styles.escanearSub}>
                Completá tus datos automáticamente
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textLight}
            />
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

            <Text style={styles.label}>Obra social / Prepaga (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="PAMI, OSDE, IOMA, etc."
              placeholderTextColor={Colors.textLight}
              value={obraSocial}
              onChangeText={setObraSocial}
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

            <Text style={styles.label}>Contacto de emergencia *</Text>
            <TextInput
              style={styles.input}
              placeholder="Madre - 11 9999 9999"
              placeholderTextColor={Colors.textLight}
              value={contactoEmergencia}
              onChangeText={setContactoEmergencia}
            />
          </View>

          <Pressable style={styles.siguienteBtn} onPress={handleSiguiente}>
            <Text style={styles.siguienteTexto}>Siguiente paso →</Text>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  paso: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 16,
    marginBottom: 24,
  },
  progressFill: {
    width: "33%",
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  escanearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 16,
    marginBottom: 8,
  },
  escanearTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },
  escanearSub: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: "#FAFAFA",
  },
  siguienteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 40,
  },
  siguienteTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
    aviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 17,
  },
    paraQuienLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 10,
  },
  chips: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#FAFAFA",
  },
  chipActivo: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  chipAgregar: {
    borderStyle: "dashed",
    borderColor: Colors.primary,
    backgroundColor: "transparent",
  },
  chipTexto: {
    fontSize: 13,
    color: Colors.text,
  },
  chipTextoActivo: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
