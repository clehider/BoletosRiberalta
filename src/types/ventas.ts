import { Timestamp } from "firebase/firestore";

export interface Venta {
  id: string;
  fecha: Timestamp;
  origen: string;
  destino: string;
  numeroAsiento: number;
  precio: number;
  nombrePasajero: string;
  dniPasajero: string;
  estado: 'activo' | 'cancelado';
  vendedor: string;
  horaVenta: string;
  metodoPago: 'efectivo' | 'tarjeta' | 'yape' | 'plin';
  numeroBoleto: string;
}

export interface Destino {
  id: string;
  nombre: string;
  precio: number;
  horariosSalida: string[];
  disponible: boolean;
}

export interface AsientoConfig {
  numero: number;
  estado: 'disponible' | 'ocupado' | 'reservado';
  posicion: {
    x: number;
    y: number;
  };
}
