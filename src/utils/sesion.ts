import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CLAVE_TOKEN = 'token';
const esWeb = Platform.OS === 'web';

async function guardarToken(token: string) {
  if (esWeb) return AsyncStorage.setItem(CLAVE_TOKEN, token);
  await SecureStore.setItemAsync(CLAVE_TOKEN, token);
}

async function leerToken(): Promise<string | null> {
  if (esWeb) return AsyncStorage.getItem(CLAVE_TOKEN);

  const token = await SecureStore.getItemAsync(CLAVE_TOKEN);
  if (token) return token;

  const viejo = await AsyncStorage.getItem(CLAVE_TOKEN);
  if (viejo) {
    await SecureStore.setItemAsync(CLAVE_TOKEN, viejo);
    await AsyncStorage.removeItem(CLAVE_TOKEN);
  }
  return viejo;
}

async function borrarToken() {
  await AsyncStorage.removeItem(CLAVE_TOKEN);
  if (!esWeb) await SecureStore.deleteItemAsync(CLAVE_TOKEN);
}

const CLAVES_SESION = ['usuarioId', 'rol', 'hospitalId'];

export type Sesion = {
  token: string | null;
  usuarioId: number | null;
  rol: string | null;
  hospitalId: string | null;
};

type UsuarioLogueado = {
  id: number;
  rol?: string | null;
  hospitalId?: string | null;
};

export async function guardarSesion(token: string, usuario: UsuarioLogueado) {
  await cerrarSesion();
  const datos: [string, string][] = [
    ['usuarioId', usuario.id.toString()],
    ['rol', usuario.rol ?? 'Paciente'],
  ];
  if (usuario.hospitalId) datos.push(['hospitalId', usuario.hospitalId]);
  await AsyncStorage.multiSet(datos);
  await guardarToken(token);
}

export async function obtenerSesion(): Promise<Sesion> {
  const [token, [[, id], [, rol], [, hospitalId]]] = await Promise.all([
    leerToken(),
    AsyncStorage.multiGet(CLAVES_SESION),
  ]);
  return { token, usuarioId: id ? Number(id) : null, rol, hospitalId };
}

export async function cerrarSesion() {
  await AsyncStorage.multiRemove(CLAVES_SESION);
  await borrarToken();
}
