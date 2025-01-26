import { format } from 'date-fns';

export const formatearFecha = (fecha: Date): string => {
  return format(fecha, 'yyyy-MM-dd');
};

export const formatearHora = (fecha: Date): string => {
  return format(fecha, 'HH:mm:ss');
};

export const obtenerFechaActual = (): Date => {
  return new Date();
};
