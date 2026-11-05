// Validaciones compartidas de DNI y fecha de nacimiento.
// El backend tiene las mismas reglas en preguardia-backend/src/utils/validaciones.ts

export const MAX_LARGO_DNI = 10; // "12.345.678" con puntos
export const MAX_LARGO_FECHA = 10; // "DD/MM/AAAA"
const EDAD_MAXIMA = 120;

// ---------- DNI ----------

export const limpiarDni = (dni: string) => dni.replace(/\D/g, '');

export const esDniValido = (dni: string) => /^\d{7,8}$/.test(limpiarDni(dni));

export const ERROR_DNI = 'El DNI debe tener 7 u 8 números.';

// ---------- Fecha (DD/MM/AAAA) ----------

// Mientras el usuario escribe: deja solo números y agrega las barras.
// "26052001" -> "26/05/2001"
export function mascaraFecha(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// Convierte "DD/MM/AAAA" en Date, o null si la fecha no existe (ej. 31/02/2024)
function parsearFecha(fecha: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha.trim());
  if (!m) return null;
  const [dia, mes, anio] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(anio, mes - 1, dia);
  const existe =
    date.getFullYear() === anio && date.getMonth() === mes - 1 && date.getDate() === dia;
  return existe ? date : null;
}

// Devuelve el mensaje de error, o null si la fecha de nacimiento es válida
export function errorFechaNacimiento(fecha: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha.trim())) return 'Usá el formato DD/MM/AAAA.';
  const date = parsearFecha(fecha);
  if (!date) return 'Esa fecha no existe.';
  if (date > new Date()) return 'La fecha de nacimiento no puede ser futura.';
  if (calcularEdad(fecha)! > EDAD_MAXIMA) return 'Revisá el año de nacimiento.';
  return null;
}

// Edad exacta en años (tiene en cuenta día y mes). null si la fecha no es válida.
export function calcularEdad(fecha: string): number | null {
  const nacimiento = parsearFecha(fecha);
  if (!nacimiento) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const yaCumplio =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
  if (!yaCumplio) edad--;
  return edad;
}
