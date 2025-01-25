import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { Socio } from '../models/Socio';

export const initSociosIngresos = async () => {
  const sociosCollection = collection(db, 'socios');

  const sociosIniciales: Omit<Socio, 'id'>[] = [
    {
      nombre: 'Juan',
      apellidos: 'Pérez',
      ci: '1234567',
      fechaNacimiento: Timestamp.fromDate(new Date('1980-01-01')),
      direccion: 'Calle 123',
      telefono: '12345678',
      email: 'juan@example.com',
      fechaIngreso: Timestamp.now(),
      estado: 'Activo',
      vehiculos: [
        { id: '1', marca: 'Toyota', modelo: 'Corolla', placa: 'ABC123', vineta: 'V001' }
      ],
      choferes: [
        { id: '1', nombre: 'Carlos', apellidos: 'Gómez', licencia: 'L001' },
        { id: '2', nombre: 'Ana', apellidos: 'Martínez', licencia: 'L002' }
      ]
    },
    {
      nombre: 'María',
      apellidos: 'González',
      ci: '7654321',
      fechaNacimiento: Timestamp.fromDate(new Date('1985-05-05')),
      direccion: 'Avenida 456',
      telefono: '87654321',
      email: 'maria@example.com',
      fechaIngreso: Timestamp.now(),
      estado: 'Activo',
      vehiculos: [
        { id: '2', marca: 'Honda', modelo: 'Civic', placa: 'XYZ789', vineta: 'V002' }
      ],
      choferes: [
        { id: '3', nombre: 'Pedro', apellidos: 'Rodríguez', licencia: 'L003' }
      ]
    }
  ];

  for (const socio of sociosIniciales) {
    await addDoc(sociosCollection, socio);
  }

  console.log('Datos iniciales de socios agregados');
};
