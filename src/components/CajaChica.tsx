import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Movimiento {
  id?: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  descripcion: string;
  fecha: string;
}

const CajaChica = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [nuevoMovimiento, setNuevoMovimiento] = useState<Movimiento>({
    tipo: 'ingreso',
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    const movimientosCollection = collection(db, 'cajaChica');
    const q = query(movimientosCollection, orderBy('fecha', 'desc'), limit(50));
    const movimientosSnapshot = await getDocs(q);
    const movimientosList = movimientosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movimiento));
    setMovimientos(movimientosList);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoMovimiento(prev => ({
      ...prev,
      [name]: name === 'monto' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'cajaChica'), nuevoMovimiento);
      setNuevoMovimiento({
        tipo: 'ingreso',
        monto: 0,
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      fetchMovimientos();
    } catch (error) {
      console.error("Error al agregar movimiento:", error);
    }
  };

  const calcularSaldo = () => {
    return movimientos.reduce((saldo, mov) => {
      return mov.tipo === 'ingreso' ? saldo + mov.monto : saldo - mov.monto;
    }, 0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Caja Chica</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <select
            name="tipo"
            value={nuevoMovimiento.tipo}
            onChange={handleInputChange}
            className="p-2 border rounded"
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
          <input
            type="number"
            name="monto"
            value={nuevoMovimiento.monto}
            onChange={handleInputChange}
            placeholder="Monto"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="descripcion"
            value={nuevoMovimiento.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción"
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            name="fecha"
            value={nuevoMovimiento.fecha}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Agregar Movimiento
        </button>
      </form>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Saldo Actual: ${calcularSaldo().toFixed(2)}</h2>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Últimos Movimientos</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Monto</th>
              <th className="border p-2">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(mov => (
              <tr key={mov.id}>
                <td className="border p-2">{mov.fecha}</td>
                <td className="border p-2">{mov.tipo}</td>
                <td className="border p-2">${mov.monto.toFixed(2)}</td>
                <td className="border p-2">{mov.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CajaChica;
