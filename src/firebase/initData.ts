import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';

const destinos = [
  'Riberalta',
  'Guayaramerín',
  'La Paz',
  'Santa Cruz',
  'Cochabamba'
];

const vehiculos = [
  {
    tipo: 'Bus',
    placa: 'ABC123',
    disponible: true
  },
  {
    tipo: 'Noah',
    placa: 'XYZ789',
    disponible: true
  }
];

export const initializeData = async () => {
  try {
    // Verificar y agregar destinos
    const destinosSnapshot = await getDocs(collection(db, 'destinos'));
    if (destinosSnapshot.empty) {
      console.log('Inicializando destinos...');
      for (const destino of destinos) {
        await addDoc(collection(db, 'destinos'), {
          nombre: destino
        });
      }
    }

    // Verificar y agregar vehículos
    const vehiculosSnapshot = await getDocs(query(collection(db, 'vehiculos'), where('disponible', '==', true)));
    if (vehiculosSnapshot.empty) {
      console.log('Inicializando vehículos...');
      for (const vehiculo of vehiculos) {
        await addDoc(collection(db, 'vehiculos'), vehiculo);
      }
    }
  } catch (error) {
    console.error('Error inicializando datos:', error);
  }
};
