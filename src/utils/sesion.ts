import AsyncStorage from '@react-native-async-storage/async-storage';

export type Sesion = {
  usuarioId: number | null;
  rol: string | null;
  hospitalId: string | null;
};

export async function obtenerSesion(): Promise<Sesion> {
  const [[, id], [, rol], [, hospitalId]] = await AsyncStorage.multiGet(['usuarioId', 'rol', 'hospitalId']);
  return { usuarioId: id ? Number(id) : null, rol, hospitalId };
}

export async function cerrarSesion() {
  await AsyncStorage.multiRemove(['usuarioId', 'rol', 'hospitalId']);
}