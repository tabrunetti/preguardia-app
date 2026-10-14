import { useSyncExternalStore } from 'react';

export type DatosPersona = {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  celular: string | null;
  obraSocial: string | null;
  contactoEmergencia: string | null;
};

export type Paciente = DatosPersona & {
  email: string;
  direccion: string | null;
};

export type Familiar = DatosPersona & {
  id: string;
  parentesco: string;
};

// Mock del paciente logueado (después vendría del backend)
export const USER_DATA: Paciente = {
  nombre: 'Tiago Abel',
  apellido: 'Brunetti',
  fechaNacimiento: '26/05/2001',
  dni: '43.413.181',
  email: 'tiagobrunetti@hotmail.com',
  celular: null,
  direccion: null,
  obraSocial: null,
  contactoEmergencia: null,
};

// ---- Store en memoria del grupo familiar ----
let familiares: Familiar[] = [
  {
    id: '1',
    parentesco: 'Madre',
    nombre: 'Laura',
    apellido: 'Gómez',
    fechaNacimiento: '14/03/1972',
    dni: '22.845.910',
    celular: '+54 9 11 4567 8910',
    obraSocial: 'OSDE',
    contactoEmergencia: 'Tiago (hijo) - 11 2345 6789',
  },
];

const listeners = new Set<() => void>();
const emitir = () => listeners.forEach((l) => l());

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFamiliares() {
  return useSyncExternalStore(subscribe, () => familiares);
}

export function agregarFamiliar(datos: Omit<Familiar, 'id'>) {
  familiares = [...familiares, { ...datos, id: Date.now().toString() }];
  emitir();
}

export function eliminarFamiliar(id: string) {
  familiares = familiares.filter((f) => f.id !== id);
  emitir();
}