import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Gasto {
  id?: string;
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
}

const categorias = ['Mantenimiento', 'Combustible', 'Salarios', 'Impuestos', 'Otros'];

const Gastos = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [nuevoGasto, setNuevoGasto] = useState<Gasto>({
    categoria: 'Otros',
    monto: 0,
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    const gastosCollection = collection(db, 'gastos');
    const q = query(gastosCollection, orderBy('fecha', 'desc'), limit(50));
    const gastosSnapshot = await getDocs(q);
    const gastosList = gastosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gasto));
    setGastos(gastosList);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoGasto(prev => ({
      ...prev,
      [name]: name === 'monto' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'gastos'), nuevoGasto);
      setNuevoGasto({
        categoria: 'Otros',
        monto: 0,
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      fetchGastos();
    } catch (error) {
      console.error("Error al agregar gasto:", error);
    }
  };

  const calcularTotalGastos = () => {
    return gastos.reduce((total, gasto) => total + gasto.monto, 0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Gastos</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <select
            name="categoria"
            value={nuevoGasto.categoria}
            onChange={handleInputChange}
            className="p-2 border rounded"
          >
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="number"
            name="monto"
            value={nuevoGasto.monto}
            onChange={handleInputChange}
            placeholder="Monto"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="descripcion"
            value={nuevoGasto.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción"
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            name="fecha"
            value={nuevoGasto.fecha}
            onChange={handleInputChange}
            className="p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Agregar Gasto
        </button>
      </form>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Total de Gastos: ${calcularTotalGastos().toFixed(2)}</h2>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Últimos Gastos</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Categoría</th>
              <th className="border p-2">Monto</th>
              <th className="border p-2">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map(gasto => (
              <tr key={gasto.id}>
                <td className="border p-2">{gasto.fecha}</td>
                <td className="border p-2">{gasto.categoria}</td>
                <td className="border p-2">${gasto.monto.toFixed(2)}</td>
                <td className="border p-2">{gasto.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Gastos;
