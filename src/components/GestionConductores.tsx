import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Conductor {
  id?: string;
  nombre: string;
  licencia: string;
  carnetIdentidad: string;
  ubicacion: string;
  numeroInterno: string;
  pagoVineta: boolean;
}

const GestionConductores = () => {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [newConductor, setNewConductor] = useState<Conductor>({
    nombre: '',
    licencia: '',
    carnetIdentidad: '',
    ubicacion: '',
    numeroInterno: '',
    pagoVineta: false
  });

  useEffect(() => {
    fetchConductores();
  }, []);

  const fetchConductores = async () => {
    const conductoresCollection = collection(db, 'conductores');
    const conductoresSnapshot = await getDocs(conductoresCollection);
    const conductoresList = conductoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conductor));
    setConductores(conductoresList);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewConductor(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'conductores'), newConductor);
      setNewConductor({
        nombre: '',
        licencia: '',
        carnetIdentidad: '',
        ubicacion: '',
        numeroInterno: '',
        pagoVineta: false
      });
      fetchConductores();
    } catch (error) {
      console.error("Error al agregar conductor:", error);
    }
  };

  const handleUpdate = async (id: string, updatedData: Partial<Conductor>) => {
    try {
      const conductorRef = doc(db, 'conductores', id);
      await updateDoc(conductorRef, updatedData);
      fetchConductores();
    } catch (error) {
      console.error("Error al actualizar conductor:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'conductores', id));
      fetchConductores();
    } catch (error) {
      console.error("Error al eliminar conductor:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Conductores</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="nombre"
            value={newConductor.nombre}
            onChange={handleInputChange}
            placeholder="Nombre"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="licencia"
            value={newConductor.licencia}
            onChange={handleInputChange}
            placeholder="Licencia"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="carnetIdentidad"
            value={newConductor.carnetIdentidad}
            onChange={handleInputChange}
            placeholder="Carnet de Identidad"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="ubicacion"
            value={newConductor.ubicacion}
            onChange={handleInputChange}
            placeholder="Ubicación"
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="numeroInterno"
            value={newConductor.numeroInterno}
            onChange={handleInputChange}
            placeholder="Número Interno"
            className="p-2 border rounded"
            required
          />
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="pagoVineta"
                checked={newConductor.pagoVineta}
                onChange={handleInputChange}
                className="mr-2"
              />
              Pago de Viñeta
            </label>
          </div>
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Agregar Conductor
        </button>
      </form>
      <div>
        <h2 className="text-xl font-semibold mb-2">Lista de Conductores</h2>
        {conductores.map(conductor => (
          <div key={conductor.id} className="mb-4 p-4 border rounded">
            <h3 className="font-bold">{conductor.nombre}</h3>
            <p>Licencia: {conductor.licencia}</p>
            <p>Carnet de Identidad: {conductor.carnetIdentidad}</p>
            <p>Ubicación: {conductor.ubicacion}</p>
            <p>Número Interno: {conductor.numeroInterno}</p>
            <p>Pago de Viñeta: {conductor.pagoVineta ? 'Sí' : 'No'}</p>
            <button
              onClick={() => handleUpdate(conductor.id!, { pagoVineta: !conductor.pagoVineta })}
              className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
            >
              Actualizar Pago Viñeta
            </button>
            <button
              onClick={() => handleDelete(conductor.id!)}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionConductores;
