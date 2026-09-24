export type Motivo =
  | 'Dolor'
  | 'Fiebre'
  | 'Dificultad respiratoria'
  | 'Herida / Trauma'
  | 'Malestar general'
  | 'Otro';

export type TiempoSintomas = 'Menos de 24 horas' | '1 a 3 días' | 'Más de una semana';

export type Evolucion = 'Empeora' | 'Se mantiene igual' | 'Mejora';

export type BanderasRojas = {
  dificultadRespiratoria: boolean;
  dolorPechoConSintomas: boolean;
  perdidaConciencia: boolean;
  sangradoIncontrolable: boolean;
  signosACV: boolean;
  embarazoConAlarma: boolean;
  convulsionReciente: boolean;
};

export type SignosVitales = {
  temperatura?: number;
  frecuenciaCardiaca?: number;
};

export type FactoresRiesgo = {
  edad?: number;
  enfermedadCronica: boolean;
  embarazo: boolean;
};

export type RespuestasTriaje = {
  motivo: Motivo;
  escalaDolor: number;
  tiempoSintomas: TiempoSintomas;
  evolucion: Evolucion;
  signosVitales: SignosVitales;
  factoresRiesgo: FactoresRiesgo;
};

export type ResultadoTriaje = {
  nivel: 'Emergencia' | 'Urgente' | 'Moderado' | 'Leve' | 'Sin urgencia';
  color: string;
  colorNombre: string;
  motivoEmergencia?: string;
};

export function hayBanderaRoja(banderas: BanderasRojas): { activa: boolean; motivo?: string } {
  if (banderas.dolorPechoConSintomas) {
    return { activa: true, motivo: 'Dolor de pecho con síntomas de alarma' };
  }
  if (banderas.signosACV) {
    return { activa: true, motivo: 'Posibles signos de ACV' };
  }
  if (banderas.dificultadRespiratoria) {
    return { activa: true, motivo: 'Dificultad respiratoria actual' };
  }
  if (banderas.perdidaConciencia) {
    return { activa: true, motivo: 'Pérdida de conocimiento o confusión' };
  }
  if (banderas.sangradoIncontrolable) {
    return { activa: true, motivo: 'Sangrado que no se detiene' };
  }
  if (banderas.embarazoConAlarma) {
    return { activa: true, motivo: 'Embarazo con sangrado o dolor abdominal fuerte' };
  }
  if (banderas.convulsionReciente) {
    return { activa: true, motivo: 'Convulsión en los últimos 30 minutos' };
  }
  return { activa: false };
}

const PUNTOS_MOTIVO: Record<Motivo, number> = {
  'Dificultad respiratoria': 8,
  'Herida / Trauma': 6,
  'Dolor': 4,
  'Fiebre': 3,
  'Otro': 3,
  'Malestar general': 2,
};

const PUNTOS_TIEMPO: Record<TiempoSintomas, number> = {
  'Menos de 24 horas': 2,
  '1 a 3 días': 0,
  'Más de una semana': -2,
};

const PUNTOS_EVOLUCION: Record<Evolucion, number> = {
  'Empeora': 3,
  'Se mantiene igual': 0,
  'Mejora': -2,
};

function puntosPorSignosVitales(signos: SignosVitales): number {
  let puntos = 0;

  if (signos.temperatura !== undefined) {
    if (signos.temperatura >= 39) puntos += 4;
    else if (signos.temperatura >= 38) puntos += 2;
  }

  if (signos.frecuenciaCardiaca !== undefined) {
    if (signos.frecuenciaCardiaca >= 120 || signos.frecuenciaCardiaca <= 45) puntos += 4;
    else if (signos.frecuenciaCardiaca >= 100) puntos += 1;
  }

  return puntos;
}

function puntosPorFactoresRiesgo(factores: FactoresRiesgo): number {
  let puntos = 0;

  if (factores.edad !== undefined) {
    if (factores.edad < 2 || factores.edad >= 75) puntos += 3;
    else if (factores.edad < 5 || factores.edad >= 65) puntos += 1;
  }

  if (factores.enfermedadCronica) puntos += 2;
  if (factores.embarazo) puntos += 2;

  return puntos;
}

export function calcularNivelTriaje(
  respuestas: RespuestasTriaje,
  banderas: BanderasRojas
): ResultadoTriaje {
  const bandera = hayBanderaRoja(banderas);

  if (bandera.activa) {
    return {
      nivel: 'Emergencia',
      color: '#dc2626',
      colorNombre: 'Rojo',
      motivoEmergencia: bandera.motivo,
    };
  }

  const puntaje =
    PUNTOS_MOTIVO[respuestas.motivo] +
    respuestas.escalaDolor * 0.5 +
    PUNTOS_TIEMPO[respuestas.tiempoSintomas] +
    PUNTOS_EVOLUCION[respuestas.evolucion] +
    puntosPorSignosVitales(respuestas.signosVitales) +
    puntosPorFactoresRiesgo(respuestas.factoresRiesgo);

  if (puntaje >= 14) return { nivel: 'Emergencia', color: '#dc2626', colorNombre: 'Rojo' };
  if (puntaje >= 10) return { nivel: 'Urgente', color: '#f97316', colorNombre: 'Naranja' };
  if (puntaje >= 6) return { nivel: 'Moderado', color: '#f59e0b', colorNombre: 'Amarillo' };
  if (puntaje >= 3) return { nivel: 'Leve', color: '#16a34a', colorNombre: 'Verde' };
  return { nivel: 'Sin urgencia', color: '#3b82f6', colorNombre: 'Azul' };
}