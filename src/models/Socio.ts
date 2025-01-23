import { Timestamp } from 'firebase/firestore';

export interface Socio {
  id: string;
  nombre: string;
  apellidos: string;
  ci: string;
  fechaIngreso: Timestamp;
  lineasCompradas: number;
  vinetas: string[];
  esChofer: boolean;
  choferes?: string[];
}

export interface Ingreso {
  tipo: 'SALIDAS' | 'CAMAS' | 'LINEA' | 'CHURRASCO' | 'MORTUORIA' | 'FEDERACION' | 'MENSUALIDAD' | 'MULTAS' | 'OTROS';
  monto: number;
  fecha: Timestamp;
  descripcion?: string;
  socioId?: string;
}
