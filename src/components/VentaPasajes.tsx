import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

interface Vehiculo {
  id: string;
  nombre: string;
  placa: string;
  capacidad: number;
  asientos: { [key: string]: string };
}

const VentaPasajes: React.FC = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [selectedAsiento, setSelectedAsiento] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehiculos = async () => {
      const vehiculosCollection = collection(db, "vehiculos");
      const vehiculosSnapshot = await getDocs(vehiculosCollection);
      const vehiculosList = vehiculosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehiculo));
      setVehiculos(vehiculosList);
    };

    fetchVehiculos();
  }, []);

  const handleVehiculoSelect = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setSelectedAsiento(null);
  };

  const handleAsientoSelect = (asiento: string) => {
    setSelectedAsiento(asiento);
  };

  const generarBoleto = async () => {
    if (!selectedVehiculo || !selectedAsiento) return;

    try {
      const vehiculoRef = doc(db, "vehiculos", selectedVehiculo.id);
      await updateDoc(vehiculoRef, {
        [`asientos.${selectedAsiento}`]: "ocupado",
      });

      // Aquí iría la lógica para generar el PDF del boleto
      console.log(`Boleto generado para el vehículo ${selectedVehiculo.nombre}, asiento ${selectedAsiento}`);

      // Actualizar el estado local
      setSelectedVehiculo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          asientos: {
            ...prev.asientos,
            [selectedAsiento]: "ocupado"
          }
        };
      });
      setSelectedAsiento(null);
    } catch (error) {
      console.error("Error al generar el boleto:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Venta de Pasajes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Vehículos Disponibles</h2>
          {vehiculos.map((vehiculo) => (
            <button
              key={vehiculo.id}
              onClick={() => handleVehiculoSelect(vehiculo)}
              className="block w-full text-left p-2 mb-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              {vehiculo.nombre} - {vehiculo.placa}
            </button>
          ))}
        </div>
        {selectedVehiculo && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Asientos</h2>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(selectedVehiculo.asientos).map(([asiento, estado]) => (
                <button
                  key={asiento}
                  onClick={() => handleAsientoSelect(asiento)}
                  disabled={estado === "ocupado"}
                  className={`p-2 rounded ${
                    estado === "libre" ? "bg-green-200 hover:bg-green-300" : "bg-red-200"
                  }`}
                >
                  {asiento}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedAsiento && (
        <button
          onClick={generarBoleto}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generar Boleto
        </button>
      )}
    </div>
  );
};

export default VentaPasajes;
