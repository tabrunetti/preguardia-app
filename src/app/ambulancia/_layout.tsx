import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { obtenerSesion } from '../../utils/sesion';

export default function AmbulanciaLayout() {
  const [estadoSesion, setEstadoSesion] = useState<'cargando' | 'ok' | 'no'>('cargando');

  useEffect(() => {
    (async () => {
      const { rol } = await obtenerSesion();
      setEstadoSesion(rol === 'Ambulancia' || rol === 'Profesional' ? 'ok' : 'no');
    })();
  }, []);

  if (estadoSesion === 'cargando') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={Colors.emergencia} />
      </View>
    );
  }

  if (estadoSesion === 'no') return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}