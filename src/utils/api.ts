import { router } from 'expo-router';
import { API_URL } from '../constants/api';
import { cerrarSesion, obtenerSesion } from './sesion';

export async function apiFetch(ruta: string, opciones: RequestInit = {}) {
  const { token } = await obtenerSesion();

  const headers = new Headers(opciones.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });

  if (res.status === 401 && !ruta.startsWith('/auth/')) {
    await cerrarSesion();
    router.replace('/');
  }

  return res;
}
