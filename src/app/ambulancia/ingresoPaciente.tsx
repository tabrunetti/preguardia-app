import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { Colors } from '../../constants/colors';
import { NIVELES } from '../../constants/niveles';
import { avisar } from '../../utils/alertas';
import { obtenerSesion } from '../../utils/sesion';

const SEXOS = ['Masculino', 'Femenino', 'No determinado'] as const;
const CONCIENCIA = ['Alerta', 'Responde a la voz', 'Responde al dolor', 'No responde'] as const;
const INCIDENTES = [
  'Trauma', 'Cardiovascular', 'Respiratorio', 'Neurológico', 'Obstétrico', 'Intoxicación', 'Quemadura', 'Otro',
] as const;

// Rojo/Naranja/Amarillo/Verde → Emergencia/Urgente/Moderado/Leve
const PRIORIDADES = NIVELES.slice(0, 4);
const PRIORIDADES_NOMBRES = PRIORIDADES.map((n) => n.colorNombre);

function Selector<T extends string>({
  opciones, valor, onChange, colorDe,
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
            style={[styles.chip, activo && { backgroundColor: c, borderColor: c }]}
            onPress={() => onChange(activo ? null : o)}
          >
            <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Campo({
  label, value, onChange, placeholder, numerico = true, ancho = '48%',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numerico?: boolean;
  ancho?: '48%' | '100%';
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
        keyboardType={numerico ? 'numeric' : 'default'}
      />
    </View>
  );
}

export default function IngresoPaciente() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hospitalNombre, setHospitalNombre] = useState('');

  const [noIdentificado, setNoIdentificado] = useState(false);
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState<(typeof SEXOS)[number] | null>(null);

  const [conciencia, setConciencia] = useState<(typeof CONCIENCIA)[number] | null>(null);
  const [incidente, setIncidente] = useState<(typeof INCIDENTES)[number] | null>(null);
  const [sintomas, setSintomas] = useState('');

  const [tension, setTension] = useState('');
  const [fc, setFc] = useState('');
  const [fr, setFr] = useState('');
  const [sat, setSat] = useState('');
  const [temp, setTemp] = useState('');
  const [glucemia, setGlucemia] = useState('');
  const [glasgow, setGlasgow] = useState('');

  const [prioridad, setPrioridad] = useState<string | null>(null);
  const [tratamiento, setTratamiento] = useState('');
  
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/hospitales/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => h && setHospitalNombre(h.nombre))
      .catch(() => {});
  }, [id]);

  const esNumero = (v: string) => v.trim() === '' || !Number.isNaN(Number(v.replace(',', '.')));

  const handleNotificar = async () => {
    if (!prioridad) {
      avisar('Falta la prioridad', 'Elegí la prioridad estimada del paciente.');
      return;
    }
    if (!noIdentificado && dni.trim() && !/^\d{7,8}$/.test(dni.replace(/\D/g, ''))) {
      avisar('DNI inválido', 'El DNI debe tener 7 u 8 números (o dejalo vacío).');
      return;
    }
    if (![edad, fc, fr, sat, temp, glucemia, glasgow].every(esNumero)) {
      avisar('Dato inválido', 'Revisá que edad ysignos vitales sean números.');
      return;
    }
    if (glasgow && (Number(glasgow) < 3 || Number(glasgow) > 15)) {
      avisar('Glasgow inválido', 'El Glasgow va de 3 a 15.');
      return;
    }

    const { usuarioId } = await obtenerSesion();
    if (!usuarioId) {
      avisar('Sesión vencida', 'Volvé a iniciar sesión.');
      return;
    }

    const nivel = PRIORIDADES.find((n) => n.colorNombre === prioridad)!;
    const num = (v: string) => (v.trim() ? Number(v.replace(',', '.')) : null);

    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/turnos/ambulancia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambulanciaId: usuarioId,
          hospitalId: id,
          pacienteNombre: noIdentificado ? 'NN (no identificado)' : nombre.trim() || null,
          pacienteDni: noIdentificado ? '' : dni,
          pacienteEdad: num(edad),
          pacienteSexo: sexo,
          pacientePresion: tension.trim() || null,
          motivo: sintomas.trim() || null,
          tipoIncidente: incidente,
          nivel: nivel.nombre,
          color: nivel.color,
          
          signos: {
            estadoConciencia: conciencia,
            frecuenciaCardiaca: num(fc),
            frecuenciaRespiratoria: num(fr),
            saturacionOxigeno: num(sat),
            temperatura: num(temp),
            glucemia: num(glucemia),
            glasgow: num(glasgow),
            tratamiento: tratamiento.trim() || null,
          },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        avisar('Error', data?.error ?? 'No se pudo notificar al hospital.');
        return;
      }
      router.replace({ pathname: '/ambulancia/confirmacion', params: { turnoId: String(data.id) } });
    } catch {
      avisar('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.emergencia} />
            </Pressable>
            <Text style={styles.destino} numberOfLines={1}>→ {hospitalNombre || 'Cargando...'}</Text>
          </View>

          <Text style={styles.titulo}>Ingreso de paciente</Text>
          <View style={styles.aviso}>
            <Ionicons name="information-circle" size={20} color={Colors.emergencia} />
            <Text style={styles.avisoTexto}>
              Solo la prioridad es obligatoria. Cargá lo que sepas y notificá al hospital.
            </Text>
          </View>

          <Text style={styles.seccion}>Identificación</Text>
          <Pressable style={styles.checkboxRow} onPress={() => setNoIdentificado(!noIdentificado)}>
            <Ionicons
              name={noIdentificado ? 'checkbox' : 'square-outline'}
              size={24}
              color={noIdentificado ? Colors.emergencia : Colors.border}
            />
            <Text style={styles.checkboxTexto}>Paciente no identificado (NN)</Text>
          </Pressable>

          <View style={styles.grid}>
            {!noIdentificado && (
              <>
                <Campo label="Nombre y apellido" value={nombre} onChange={setNombre} numerico={false} ancho="100%" placeholder="Si se conoce" />
                <Campo label="DNI" value={dni} onChange={setDni} placeholder="—" />
              </>
            )}
            <Campo label="Edad (aprox.)" value={edad} onChange={setEdad} placeholder="Ej. 45" />
          </View>
          <Text style={styles.subLabel}>Sexo</Text>
          <Selector opciones={SEXOS} valor={sexo} onChange={setSexo} />

          <Text style={styles.seccion}>Situación clínica</Text>
          <Text style={styles.subLabel}>Estado de conciencia</Text>
          <Selector opciones={CONCIENCIA} valor={conciencia} onChange={setConciencia} />

          <Text style={styles.subLabel}>Tipo de incidente</Text>
          <Selector opciones={INCIDENTES} valor={incidente} onChange={setIncidente} />

          <Text style={styles.subLabel}>Síntomas / descripción</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Ej. Dolor torácico opresivo de 30 min, sudoración..."
            placeholderTextColor={Colors.textLight}
            multiline
            value={sintomas}
            onChangeText={setSintomas}
          />

          <Text style={styles.seccion}>Signos vitales</Text>
          <View style={styles.grid}>
            <Campo label="TA (mmHg)" value={tension} onChange={setTension} numerico={false} placeholder="120/80" />
            <Campo label="FC (lpm)" value={fc} onChange={setFc} placeholder="80" />
            <Campo label="FR (rpm)" value={fr} onChange={setFr} placeholder="16" />
            <Campo label="SatO₂ (%)" value={sat} onChange={setSat} placeholder="98" />
            <Campo label="Temp. (°C)" value={temp} onChange={setTemp} placeholder="36.5" />
            <Campo label="Glucemia (mg/dL)" value={glucemia} onChange={setGlucemia} placeholder="100" />
            <Campo label="Glasgow (3-15)" value={glasgow} onChange={setGlasgow} placeholder="15" />
          </View>

          <Text style={styles.seccion}>Traslado</Text>
          <Text style={styles.subLabel}>Prioridad estimada *</Text>
          <Selector
            opciones={PRIORIDADES_NOMBRES}
            valor={prioridad}
            onChange={setPrioridad}
            colorDe={(p) => PRIORIDADES.find((n) => n.colorNombre === p)?.color ?? Colors.emergencia}
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

          

          <Pressable
            style={[styles.notificarBtn, enviando && { opacity: 0.7 }]}
            onPress={handleNotificar}
            disabled={enviando}
          >
            {enviando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.notificarTexto}>Notificar al hospital</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  destino: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.emergencia, textAlign: 'right' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  aviso: {
    flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: Colors.emergenciaLight,
    padding: 12, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: '#FECACA',
  },
  avisoTexto: { flex: 1, fontSize: 13, color: Colors.emergenciaDark, lineHeight: 18 },
  seccion: {
    fontSize: 17, fontWeight: 'bold', color: Colors.emergencia, marginTop: 28, marginBottom: 14,
    paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: Colors.emergenciaLight,
  },
  subLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  campoLabel: { fontSize: 12, fontWeight: '500', color: Colors.textLight, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text,
  },
  textArea: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, minHeight: 90, textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1, borderColor: Colors.border, backgroundColor: '#FAFAFA', borderRadius: 20,
    paddingVertical: 9, paddingHorizontal: 14,
  },
  chipTexto: { fontSize: 14, fontWeight: '500', color: Colors.text },
  chipTextoActivo: { color: '#fff', fontWeight: 'bold' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  checkboxTexto: { fontSize: 15, color: Colors.text },
  notificarBtn: {
    flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.emergencia, borderRadius: 12, paddingVertical: 16, marginTop: 32,
  },
  notificarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});