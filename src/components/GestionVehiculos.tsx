import  React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

interface Vehiculo {
  id: string;
  nombre: string;
  placa: string;
  capacidad: number;
  asientos: { [key: string]: string };
}

const GestionVehiculos: React.FC = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    nombre: "",
    placa: "",
    capacidad: 6,
  });

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    const vehiculosCollection = collection(db, "vehiculos");
    const vehiculosSnapshot = await getDocs(vehiculosCollection);
    const vehiculosList = vehiculosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehiculo));
    setVehiculos(vehiculosList);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoVehiculo(prev => ({
      ...prev,
      [name]: name === "capacidad" ? parseInt(value) : value,
    }));
  };

  const agregarVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const asientos: { [key: string]: string } = {};
      for (let i = 1; i <= nuevoVehiculo.capacidad; i++) {
        asientos[i.toString()] = "libre";
      }
      await addDoc(collection(db, "vehiculos"), {
        ...nuevoVehiculo,
        asientos,
      });
      setNuevoVehiculo({ nombre: "", placa: "", capacidad: 6 });
      fetchVehiculos();
    } catch (error) {
      console.error("Error al agregar vehículo:", error);
    }
  };

  const editarVehiculo = async (id: string, nuevosDatos: Partial<Vehiculo>) => {
    try {
      await updateDoc(doc(db, "vehiculos", id), nuevosDatos);
      fetchVehiculos();
    } catch (error) {
      console.error("Error al editar vehículo:", error);
    }
  };

  const eliminarVehiculo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "vehiculos", id));
      fetchVehiculos();
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Vehículos</h1>
      <form onSubmit={agregarVehiculo} className="mb-4">
        <input
          type="text"
          name="nombre"
          value={nuevoVehiculo.nombre}
          onChange={handleInputChange}
          placeholder="Nombre del vehículo"
          className="mr-2 p-2 border rounded"
        />
        <input
          type="text"
          name="placa"
          value={nuevoVehiculo.placa}
          onChange={handleInputChange}
          placeholder="Placa"
          className="mr-2 p-2 border rounded"
        />
        <input
          type="number"
          name="capacidad"
          value={nuevoVehiculo.capacidad}
          onChange={handleInputChange}
          placeholder="Capacidad"
          className="mr-2 p-2 border rounded"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Agregar Vehículo
        </button>
      </form>
      <div>
        {vehiculos.map(vehiculo => (
          <div key={vehiculo.id} className="mb-2 p-2 border rounded">
            <p>{vehiculo.nombre} - {vehiculo.placa} (Capacidad: {vehiculo.capacidad})</p>
            <button
              onClick={() => editarVehiculo(vehiculo.id, { nombre: prompt("Nuevo nombre") || vehiculo.nombre })}
              className="mr-2 p-1 bg-yellow-500 text-white rounded"
            >
              Editar
            </button>
            <button
              onClick={() => eliminarVehiculo(vehiculo.id)}
              className="p-1 bg-red-500 text-white rounded"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionVehiculos;
