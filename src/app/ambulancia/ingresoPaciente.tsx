import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Colors } from "../../constants/colors";
import { HOSPITALES } from "../../data/hospitals";

const SEXOS = ["Masculino", "Femenino", "No determinado"] as const;
const CONCIENCIA = [
  "Alerta",
  "Responde a la voz",
  "Responde al dolor",
  "No responde",
] as const;
const INCIDENTES = [
  "Trauma",
  "Cardiovascular",
  "Respiratorio",
  "Neurológico",
  "Obstétrico",
  "Intoxicación",
  "Quemadura",
  "Otro",
] as const;
const PRIORIDADES = ["Rojo", "Naranja", "Amarillo", "Verde"] as const;

const COLOR_PRIORIDAD: Record<(typeof PRIORIDADES)[number], string> = {
  Rojo: "#DC2626",
  Naranja: "#F97316",
  Amarillo: "#F59E0B",
  Verde: "#16A34A",
};

function Selector<T extends string>({
  opciones,
  valor,
  onChange,
  colorDe,
}: {
  opciones: readonly T[];
  valor: T | null;
  onChange: (v: T | null) => void;
  colorDe?: (v: T) => string;
}) {
  return (
    <View style={styles.chips}>
      {opciones.map((o) => {
        const activo = valor === o;
        const c = colorDe ? colorDe(o) : Colors.emergencia;
        return (
          <Pressable
            key={o}
            style={[
              styles.chip,
              activo && { backgroundColor: c, borderColor: c },
            ]}
            onPress={() => onChange(activo ? null : o)}
          >
            <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  numerico = true,
  ancho = "48%",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numerico?: boolean;
  ancho?: "48%" | "100%";
}) {
  return (
    <View style={{ width: ancho, marginBottom: 14 }}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        keyboardType={numerico ? "numeric" : "default"}
      />
    </View>
  );
}

export default function IngresoPaciente() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  // Identificación
  const [noIdentificado, setNoIdentificado] = useState(false);
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState<(typeof SEXOS)[number] | null>(null);

  // Situación clínica
  const [conciencia, setConciencia] = useState<
    (typeof CONCIENCIA)[number] | null
  >(null);
  const [incidente, setIncidente] = useState<
    (typeof INCIDENTES)[number] | null
  >(null);
  const [sintomas, setSintomas] = useState("");

  // Signos vitales
  const [tension, setTension] = useState("");
  const [fc, setFc] = useState("");
  const [fr, setFr] = useState("");
  const [sat, setSat] = useState("");
  const [temp, setTemp] = useState("");
  const [glucemia, setGlucemia] = useState("");
  const [glasgow, setGlasgow] = useState("");

  // Traslado
  const [prioridad, setPrioridad] = useState<
    (typeof PRIORIDADES)[number] | null
  >(null);
  const [tratamiento, setTratamiento] = useState("");
  const [eta, setEta] = useState("");

  const handleNotificar = () => {
    const paciente = noIdentificado
      ? "NN (no identificado)"
      : nombre.trim() || "Sin datos de identidad";

    router.replace({
      pathname: "/ambulancia/confirmacion",
      params: {
        id: hospital.id,
        paciente,
        prioridad: prioridad ?? "",
        eta,
        incidente: incidente ?? "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.emergencia} />
            </Pressable>
            <Text style={styles.destino} numberOfLines={1}>
              → {hospital.nombre}
            </Text>
          </View>

          <Text style={styles.titulo}>Ingreso de paciente</Text>
          <View style={styles.aviso}>
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors.emergencia}
            />
            <Text style={styles.avisoTexto}>
              Todos los campos son opcionales. Cargá solo lo que sepas y
              notificá al hospital.
            </Text>
          </View>

          {/* Identificación */}
          <Text style={styles.seccion}>Identificación</Text>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setNoIdentificado(!noIdentificado)}
          >
            <Ionicons
              name={noIdentificado ? "checkbox" : "square-outline"}
              size={24}
              color={noIdentificado ? Colors.emergencia : Colors.border}
            />
            <Text style={styles.checkboxTexto}>
              Paciente no identificado (NN)
            </Text>
          </Pressable>

          <View style={styles.grid}>
            {!noIdentificado && (
              <>
                <Campo
                  label="Nombre y apellido"
                  value={nombre}
                  onChange={setNombre}
                  numerico={false}
                  ancho="100%"
                  placeholder="Si se conoce"
                />
                <Campo
                  label="DNI"
                  value={dni}
                  onChange={setDni}
                  placeholder="—"
                />
              </>
            )}
            <Campo
              label="Edad (aprox.)"
              value={edad}
              onChange={setEdad}
              placeholder="Ej. 45"
            />
          </View>
          <Text style={styles.subLabel}>Sexo</Text>
          <Selector opciones={SEXOS} valor={sexo} onChange={setSexo} />

          {/* Situación clínica */}
          <Text style={styles.seccion}>Situación clínica</Text>
          <Text style={styles.subLabel}>Estado de conciencia</Text>
          <Selector
            opciones={CONCIENCIA}
            valor={conciencia}
            onChange={setConciencia}
          />

          <Text style={styles.subLabel}>Tipo de incidente</Text>
          <Selector
            opciones={INCIDENTES}
            valor={incidente}
            onChange={setIncidente}
          />

          <Text style={styles.subLabel}>Síntomas / descripción</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ej. Dolor torácico opresivo de 30 min, sudoración..."
            placeholderTextColor={Colors.textLight}
            multiline
            value={sintomas}
            onChangeText={setSintomas}
          />

          {/* Signos vitales */}
          <Text style={styles.seccion}>Signos vitales</Text>
          <View style={styles.grid}>
            <Campo
              label="TA (mmHg)"
              value={tension}
              onChange={setTension}
              numerico={false}
              placeholder="120/80"
            />
            <Campo
              label="FC (lpm)"
              value={fc}
              onChange={setFc}
              placeholder="80"
            />
            <Campo
              label="FR (rpm)"
              value={fr}
              onChange={setFr}
              placeholder="16"
            />
            <Campo
              label="SatO₂ (%)"
              value={sat}
              onChange={setSat}
              placeholder="98"
            />
            <Campo
              label="Temp. (°C)"
              value={temp}
              onChange={setTemp}
              placeholder="36.5"
            />
            <Campo
              label="Glucemia (mg/dL)"
              value={glucemia}
              onChange={setGlucemia}
              placeholder="100"
            />
            <Campo
              label="Glasgow (3-15)"
              value={glasgow}
              onChange={setGlasgow}
              placeholder="15"
            />
          </View>

          {/* Traslado */}
          <Text style={styles.seccion}>Traslado</Text>
          <Text style={styles.subLabel}>Prioridad estimada</Text>
          <Selector
            opciones={PRIORIDADES}
            valor={prioridad}
            onChange={setPrioridad}
            colorDe={(p) => COLOR_PRIORIDAD[p]}
          />

          <Text style={styles.subLabel}>Tratamiento aplicado</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ej. O₂ por máscara, vía periférica, inmovilización cervical..."
            placeholderTextColor={Colors.textLight}
            multiline
            value={tratamiento}
            onChangeText={setTratamiento}
          />

          <View style={[styles.grid, { marginTop: 14 }]}>
            <Campo
              label="Llegada estimada (min)"
              value={eta}
              onChange={setEta}
              placeholder="10"
            />
          </View>

          <Pressable style={styles.notificarBtn} onPress={handleNotificar}>
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.notificarTexto}>Notificar al hospital</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  destino: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.emergencia,
    textAlign: "right",
  },
  titulo: { fontSize: 26, fontWeight: "bold", color: Colors.text },
  aviso: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: Colors.emergenciaLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  avisoTexto: {
    flex: 1,
    fontSize: 13,
    color: Colors.emergenciaDark,
    lineHeight: 18,
  },
  seccion: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.emergencia,
    marginTop: 28,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: Colors.emergenciaLight,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  campoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textLight,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: "top",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipTexto: { fontSize: 14, fontWeight: "500", color: Colors.text },
  chipTextoActivo: { color: "#fff", fontWeight: "bold" },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  checkboxTexto: { fontSize: 15, color: Colors.text },
  notificarBtn: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.emergencia,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
  },
  notificarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
