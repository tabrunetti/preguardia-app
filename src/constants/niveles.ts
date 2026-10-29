export type Nivel = {
  nombre: string;
  color: string;
  colorNombre: string;
  orden: number;
};

export const NIVELES: Nivel[] = [
  { nombre: 'Emergencia', color: '#dc2626', colorNombre: 'Rojo', orden: 1 },
  { nombre: 'Urgente', color: '#f97316', colorNombre: 'Naranja', orden: 2 },
  { nombre: 'Moderado', color: '#f59e0b', colorNombre: 'Amarillo', orden: 3 },
  { nombre: 'Leve', color: '#16a34a', colorNombre: 'Verde', orden: 4 },
  { nombre: 'Sin urgencia', color: '#3b82f6', colorNombre: 'Azul', orden: 5 },
];

export const infoNivel = (nombre?: string | null) => NIVELES.find((n) => n.nombre === nombre);

export const colorDeNivel = (nombre?: string | null, colorGuardado?: string | null) =>
  colorGuardado ?? infoNivel(nombre)?.color ?? '#9CA3AF';

// Para ordenar: Emergencia primero; niveles desconocidos al final
export const ordenDeNivel = (nombre?: string | null) => infoNivel(nombre)?.orden ?? 99;