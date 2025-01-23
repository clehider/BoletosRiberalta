import { db } from './config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Socio, Ingreso } from '../models/Socio';

const initSociosIngresos = async () => {
  try {
    // Añadir socios de ejemplo
    const sociosEjemplo: Omit<Socio, 'id'>[] = [
      {
        nombre: "Juan",
        apellidos: "Pérez González",
        ci: "1234567",
        fechaIngreso: Timestamp.now(),
        lineasCompradas: 1,
        vinetas: ["ABC123", "DEF456"],
        esChofer: true
      },
      {
        nombre: "María",
        apellidos: "López Rodríguez",
        ci: "7654321",
        fechaIngreso: Timestamp.now(),
        lineasCompradas: 2,
        vinetas: ["GHI789", "JKL012"],
        esChofer: false,
        choferes: ["Carlos Gómez", "Ana Martínez"]
      }
    ];

    for (const socio of sociosEjemplo) {
      await addDoc(collection(db, 'socios'), socio);
    }

    console.log('Socios de ejemplo añadidos con éxito');

    // Añadir ingresos de ejemplo
    const tiposIngresos: Ingreso['tipo'][] = ['SALIDAS', 'CAMAS', 'LINEA', 'CHURRASCO', 'MORTUORIA', 'FEDERACION', 'MENSUALIDAD', 'MULTAS', 'OTROS'];
    
    for (const tipo of tiposIngresos) {
      const ingresoEjemplo: Omit<Ingreso, 'id'> = {
        tipo: tipo,
        monto: Math.floor(Math.random() * 1000) + 100, // Monto aleatorio entre 100 y 1100
        fecha: Timestamp.now(),
        descripcion: `Ingreso por ${tipo}`,
        socioId: "ID_ALEATORIO" // En una aplicación real, esto sería un ID válido de un socio
      };

      await addDoc(collection(db, 'ingresos'), ingresoEjemplo);
    }

    console.log('Ingresos de ejemplo añadidos con éxito');

  } catch (error) {
    console.error("Error al inicializar socios e ingresos:", error);
  }
};

export default initSociosIngresos;
