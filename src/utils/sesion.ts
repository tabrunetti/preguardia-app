import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVES = ['token', 'usuarioId', 'rol', 'hospitalId'];

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

// Guarda la sesión que devuelve /auth/login o /auth/registro, borrando cualquier sesión anterior
export async function guardarSesion(token: string, usuario: UsuarioLogueado) {
  await AsyncStorage.multiRemove(CLAVES);
  const datos: [string, string][] = [
    ['token', token],
    ['usuarioId', usuario.id.toString()],
    ['rol', usuario.rol ?? 'Paciente'],
  ];
  if (usuario.hospitalId) datos.push(['hospitalId', usuario.hospitalId]);
  await AsyncStorage.multiSet(datos);
}

export async function obtenerSesion(): Promise<Sesion> {
  const [[, token], [, id], [, rol], [, hospitalId]] = await AsyncStorage.multiGet(CLAVES);
  return { token, usuarioId: id ? Number(id) : null, rol, hospitalId };
}

export async function cerrarSesion() {
  await AsyncStorage.multiRemove(CLAVES);
}
