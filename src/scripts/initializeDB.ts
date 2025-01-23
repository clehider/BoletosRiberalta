import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDKgmm97leUvsdeC9SdGCUhikbFpv48PgI",
  authDomain: "pasajesboletoscontrol.firebaseapp.com",
  projectId: "pasajesboletoscontrol",
  storageBucket: "pasajesboletoscontrol.firebasestorage.app",
  messagingSenderId: "593018397568",
  appId: "1:593018397568:web:f88f99e11e82723b5f1765"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const inicializarBaseDeDatos = async () => {
  try {
    console.log('Iniciando la inicialización de la base de datos...');

    // Crear vehículo de ejemplo
    const vehiculoRef = await addDoc(collection(db, 'vehiculos'), {
      nombre: 'Vehículo 001',
      placa: 'ABC123',
      capacidad: 6,
      enMantenimiento: false,
      asientos: {
        '1': 'libre',
        '2': 'libre',
        '3': 'libre',
        '4': 'libre',
        '5': 'libre',
        '6': 'libre'
      }
    });
    console.log('Vehículo creado con ID:', vehiculoRef.id);

    // Crear conductor de ejemplo
    const conductorRef = await addDoc(collection(db, 'conductores'), {
      nombre: 'Juan Pérez',
      licencia: 'LIC123456',
      carnetIdentidad: 'CI789012',
      ubicacion: 'La Paz',
      numeroInterno: '001',
      pagoVineta: false
    });
    console.log('Conductor creado con ID:', conductorRef.id);

    // Crear venta de ejemplo
    const ventaRef = await addDoc(collection(db, 'ventas'), {
      vehiculo: 'Vehículo 001',
      asiento: '1',
      fecha: new Date().toISOString(),
      monto: 50
    });
    console.log('Venta creada con ID:', ventaRef.id);

    // Crear registro de caja chica
    const cajaChicaRef = await addDoc(collection(db, 'cajaChica'), {
      tipo: 'ingreso',
      monto: 100,
      descripcion: 'Fondo inicial',
      fecha: new Date().toISOString()
    });
    console.log('Registro de caja chica creado con ID:', cajaChicaRef.id);

    // Crear registro de gastos
    const gastoRef = await addDoc(collection(db, 'gastos'), {
      categoria: 'Mantenimiento',
      monto: 30,
      descripcion: 'Cambio de aceite',
      fecha: new Date().toISOString()
    });
    console.log('Gasto creado con ID:', gastoRef.id);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
};

inicializarBaseDeDatos();
