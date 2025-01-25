import React from 'react';
import { Button } from './ui/button';

interface AsientosGridProps {
  totalAsientos: number;
  asientoSeleccionado: number | null;
  asientosOcupados: number[];
  onSeleccionAsiento: (asiento: number) => void;
}

const AsientosGrid: React.FC<AsientosGridProps> = ({
  totalAsientos,
  asientoSeleccionado,
  asientosOcupados,
  onSeleccionAsiento,
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Selección de Asiento</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 bg-red-200 p-4 rounded-lg text-center">
          Conductor
        </div>
        {Array.from({ length: totalAsientos }, (_, i) => i + 1).map((asiento) => (
          <Button
            key={asiento}
            variant={asientoSeleccionado === asiento ? "default" : "outline"}
            className={`p-4 ${
              asientosOcupados.includes(asiento)
                ? "bg-gray-300 cursor-not-allowed"
                : ""
            }`}
            onClick={() => onSeleccionAsiento(asiento)}
            disabled={asientosOcupados.includes(asiento)}
          >
            Asiento {asiento}
          </Button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-primary rounded mr-2"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
};

export default AsientosGrid;
