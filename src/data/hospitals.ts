export type NivelTriaje = {
  nivel: 'Emergencia' | 'Urgente' | 'Moderado' | 'Leve' | 'Sin urgencia';
  pacientes: number;
  detalle: string;
  color: string;
};

export type Hospital = {
  id: string;
  nombre: string;
  direccion: string;
  lat?: number;
  lon?: number;
  // Cambiamos string por any para que acepte archivos locales
  imagen?: any; 
  distanciaTiempo: string;
  enEspera: number;
  demora: 'Baja' | 'Media' | 'Alta';
  gravedad: string;
  niveles: NivelTriaje[];
};

export const HOSPITALES: Hospital[] = [
  {
    id: '1',
    nombre: 'Hosp. Dr. Cosme Argerich',
    direccion: 'La Boca, CABA',
    lat: -34.627667,
    lon: -58.365942,
    // Ruta relativa desde la carpeta data hacia la carpeta assets
    imagen: require('../../assets/images/argerich.jpg'), 
    distanciaTiempo: '~45 min',
    enEspera: 12,
    demora: 'Media',
    gravedad: 'Baja',
    niveles: [
      { nivel: 'Emergencia', pacientes: 0, detalle: 'Crítico', color: '#dc2626' },
      { nivel: 'Urgente', pacientes: 2, detalle: 'Atención inmediata', color: '#f97316' },
      { nivel: 'Moderado', pacientes: 5, detalle: 'Espera est. 30min', color: '#f59e0b' },
      { nivel: 'Leve', pacientes: 4, detalle: 'Espera est. 1h', color: '#16a34a' },
      { nivel: 'Sin urgencia', pacientes: 1, detalle: 'Espera est. 2h', color: '#3b82f6' },
    ],
  },
  {
    id: '2',
    nombre: 'Hospital General de Agudos Fernández',
    direccion: 'Av. Cervino 3356, CABA',
    lat: -34.581016,
    lon: -58.406809,
    imagen: require('../../assets/images/fernandez.jpg'),
    distanciaTiempo: '~15 min',
    enEspera: 4,
    demora: 'Baja',
    gravedad: 'Baja',
    niveles: [
      { nivel: 'Emergencia', pacientes: 0, detalle: 'Crítico', color: '#dc2626' },
      { nivel: 'Urgente', pacientes: 1, detalle: 'Atención inmediata', color: '#f97316' },
      { nivel: 'Moderado', pacientes: 2, detalle: 'Espera est. 20min', color: '#f59e0b' },
      { nivel: 'Leve', pacientes: 1, detalle: 'Espera est. 40min', color: '#16a34a' },
      { nivel: 'Sin urgencia', pacientes: 0, detalle: '-', color: '#3b82f6' },
    ],
  },
  {
    id: '3',
    nombre: 'Hospital de Clínicas José de San Martín',
    direccion: 'Av. Córdoba 2351, CABA',
    lat: -34.598134,
    lon: -58.399971,
    imagen: require('../../assets/images/clinicas.jpg'),
    distanciaTiempo: '~1h 20 min',
    enEspera: 28,
    demora: 'Alta',
    gravedad: 'Media',
    niveles: [
      { nivel: 'Emergencia', pacientes: 1, detalle: 'Crítico', color: '#dc2626' },
      { nivel: 'Urgente', pacientes: 6, detalle: 'Atención inmediata', color: '#f97316' },
      { nivel: 'Moderado', pacientes: 10, detalle: 'Espera est. 1h', color: '#f59e0b' },
      { nivel: 'Leve', pacientes: 8, detalle: 'Espera est. 2h', color: '#16a34a' },
      { nivel: 'Sin urgencia', pacientes: 3, detalle: 'Espera est. 3h', color: '#3b82f6' },
    ],
  }
];