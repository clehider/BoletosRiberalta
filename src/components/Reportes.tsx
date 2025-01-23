import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Venta {
  id: string;
  vehiculo: string;
  asiento: string;
  fecha: string;
  monto: number;
}

const Reportes: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);

  useEffect(() => {
    const fetchVentas = async () => {
      const ventasCollection = collection(db, 'ventas');
      const ventasSnapshot = await getDocs(ventasCollection);
      const ventasList = ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
      setVentas(ventasList);
    };

    fetchVentas();
  }, []);

  const totalVentas = ventas.reduce((total, venta) => total + venta.monto, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reportes de Ventas</h1>
      <p className="mb-4">Total de ventas: ${totalVentas.toFixed(2)}</p>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Fecha</th>
            <th className="border border-gray-300 p-2">Vehículo</th>
            <th className="border border-gray-300 p-2">Asiento</th>
            <th className="border border-gray-300 p-2">Monto</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id}>
              <td className="border border-gray-300 p-2">{new Date(venta.fecha).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{venta.vehiculo}</td>
              <td className="border border-gray-300 p-2">{venta.asiento}</td>
              <td className="border border-gray-300 p-2">${venta.monto.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reportes;
