import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Ingreso } from '../models/Socio';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reportes: React.FC = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);

  useEffect(() => {
    const fetchIngresos = async () => {
      const ingresosQuery = query(collection(db, 'ingresos'));
      const ingresosSnapshot = await getDocs(ingresosQuery);
      const ingresosData = ingresosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ingreso[];
      setIngresos(ingresosData);
    };

    fetchIngresos();
  }, []);

  const tiposIngresos = ['SALIDAS', 'CAMAS', 'LINEA', 'CHURRASCO', 'MORTUORIA', 'FEDERACION', 'MENSUALIDAD', 'MULTAS', 'OTROS'];
  
  const ingresosPorTipo = tiposIngresos.map(tipo => ({
    tipo,
    total: ingresos.filter(ingreso => ingreso.tipo === tipo).reduce((sum, ingreso) => sum + ingreso.monto, 0)
  }));

  const chartData = {
    labels: tiposIngresos,
    datasets: [
      {
        label: 'Total de Ingresos por Tipo',
        data: ingresosPorTipo.map(i => i.total),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reportes de Ingresos</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ingresos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar data={chartData} />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ingresosPorTipo.map(({ tipo, total }) => (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle>{tipo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{total.toFixed(2)} Bs</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reportes;
