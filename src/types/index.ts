import { Timestamp } from "firebase/firestore";

export interface Boleto {
  id: string;
  vehiculo: string;
  destino: string;
  asiento: number;
  pasajero: string;
  ci: string;
  hora: string;
  precio: number;
  encomienda?: string;
  fecha: string;
}

export interface ReporteDiario {
  id: string;
  fecha: Timestamp;
  totalVentas: number;
  totalMonto: number;
  boletos: Boleto[];
  vehiculos: Record<string, number>;
  destinos: Record<string, number>;
  usuario: string;
  estado: 'abierto' | 'cerrado';
  horaApertura: string;
  horaCierre: string;
  fechaGeneracion: string;
}
