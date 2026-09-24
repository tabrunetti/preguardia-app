import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { HOSPITALES } from '../data/hospitals';
import { Ionicons } from '@expo/vector-icons';

export default function PreRegistro() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hospital = HOSPITALES.find((h) => h.id === id) ?? HOSPITALES[0];

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [obraSocial, setObraSocial] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');

  const handleSiguiente = () => {
    router.push(`/banderasRojas?id=${hospital.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header con botón atrás y contador de pasos */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.paso}>Paso 1 de 3</Text>
          </View>

          {/* Título y Barra de progreso */}
          <Text style={styles.titulo}>Datos Personales</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>

          {/* Formulario */}
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
              placeholder="DD / MM / AAAA"
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  paso: { 
    fontSize: 14, 
    fontWeight: '600',
    color: Colors.primary 
  },
  titulo: { 
    fontSize: 26, 
    fontWeight: 'bold', 
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
    width: '33%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  form: {
    flex: 1,
  },
  label: { 
    fontSize: 13, 
    fontWeight: '500',
    color: Colors.text, 
    marginBottom: 8, 
    marginTop: 16 
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  siguienteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  siguienteTexto: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});