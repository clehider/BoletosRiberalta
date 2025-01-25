import { Timestamp } from 'firebase/firestore';

export interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  vineta: string;
}

export interface Chofer {
  id: string;
  nombre: string;
  apellidos: string;
  licencia: string;
}

export interface Socio {
  id: string;
  nombre: string;
  apellidos: string;
  ci: string;
  fechaNacimiento: Timestamp;
  direccion: string;
  telefono: string;
  email: string;
  fechaIngreso: Timestamp;
  estado: 'Activo' | 'Inactivo';
  vehiculos: Vehiculo[];
  choferes: Chofer[];
}
