import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

export default function SplashLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleIngresar = () => {
    router.replace('/home'); 
  };

  const handleCrearCuenta = () => {
    router.push('/crearPerfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>🏥</Text>
          </View>
          <Text style={styles.title}>PreGuardia</Text>
          <Text style={styles.subtitle}>Tu guardia, sin esperas innecesarias</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.textLight}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          <Pressable style={styles.primaryButton} onPress={handleIngresar}>
            <Text style={styles.primaryButtonText}>Ingresar</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleCrearCuenta}>
            <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
          </Pressable>
        </View>

        {/* Texto Legal */}
        <Text style={styles.legal}>
          Al continuar, aceptás nuestros términos y políticas de salud pública.
        </Text>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: { 
    fontSize: 34,
    color: '#FFF' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: Colors.primary 
  },
  subtitle: { 
    fontSize: 14, 
    color: Colors.textLight, 
    marginTop: 6 
  },
  form: { 
    width: '100%',
    marginTop: 40,
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
  forgot: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  primaryButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: { 
    color: Colors.primary, 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  legal: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
});

/*
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

export default function SplashLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleIngresar = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoIcon}>🚑</Text>
      </View>

      <Text style={styles.title}>PreGuardia</Text>
      <Text style={styles.subtitle}>Tu guardia, sin esperas innecesarias</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@hospital.gob.ar"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>

        <Pressable style={styles.primaryButton} onPress={handleIngresar}>
          <Text style={styles.primaryButtonText}>Ingresar</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleIngresar}>
          <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
        </Pressable>
      </View>

      <Text style={styles.legal}>
        Al continuar, aceptás nuestros términos y políticas de salud pública
        de la Nación.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: { fontSize: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 4, marginBottom: 32 },
  form: { width: '100%' },
  label: { fontSize: 13, color: Colors.text, marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  forgot: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 15 },
  legal: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
});*/