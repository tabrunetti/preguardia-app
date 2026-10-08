export type DatosDni = {
  apellido: string;
  nombres: string;
  dni: string;
  sexo?: string;
  fechaNacimiento: string; 
};

const esFecha = (s: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(s);
const esNumeroDni = (s: string) => /^\d{6,9}$/.test(s);

const capitalizar = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export function formatearDni(dni: string): string {
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parsearDni(raw: string): DatosDni | null {
  const campos = raw.split("@").map((c) => c.trim());

  if (campos.length >= 8 && esNumeroDni(campos[4]) && esFecha(campos[6])) {
    return {
      apellido: capitalizar(campos[1]),
      nombres: capitalizar(campos[2]),
      sexo: campos[3],
      dni: campos[4],
      fechaNacimiento: campos[6],
    };
  }

  if (campos.length >= 9 && esNumeroDni(campos[1]) && esFecha(campos[7])) {
    return {
      apellido: capitalizar(campos[4]),
      nombres: capitalizar(campos[5]),
      dni: campos[1],
      sexo: campos[8],
      fechaNacimiento: campos[7],
    };
  }

  return null;
}
