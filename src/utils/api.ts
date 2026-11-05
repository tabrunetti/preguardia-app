import { router } from 'expo-router';
import { API_URL } from '../constants/api';
import { cerrarSesion, obtenerSesion } from './sesion';

// fetch al backend: arma la URL con API_URL y agrega el token de sesión.
// Uso: apiFetch('/turnos', { method: 'POST', headers: {...}, body: ... })
export async function apiFetch(ruta: string, opciones: RequestInit = {}) {
  const { token } = await obtenerSesion();

  const headers = new Headers(opciones.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });

  // Sin token, vencido o inválido: cerramos la sesión y volvemos al login.
  // En /auth/* un 401 es "contraseña incorrecta", así que ahí no redirigimos.
  if (res.status === 401 && !ruta.startsWith('/auth/')) {
    await cerrarSesion();
    router.replace('/');
  }

  return res;
}
