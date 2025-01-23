import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Socio, Ingreso } from '../models/Socio';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSocios: 0,
    totalVehiculos: 0,
    totalIngresos: 0,
    sociosChoferes: 0,
  });

  const [ingresosPorTipo, setIngresosPorTipo] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      // Obtener socios
      const sociosQuery = query(collection(db, 'socios'));
      const sociosSnapshot = await getDocs(sociosQuery);
      const socios = sociosSnapshot.docs.map(doc => doc.data() as Socio);

      // Obtener ingresos
      const ingresosQuery = query(collection(db, 'ingresos'));
      const ingresosSnapshot = await getDocs(ingresosQuery);
      const ingresos = ingresosSnapshot.docs.map(doc => doc.data() as Ingreso);

      // Calcular estadísticas
      const totalSocios = socios.length;
      const totalVehiculos = socios.reduce((sum, socio) => sum + socio.vinetas.length, 0);
      const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
      const sociosChoferes = socios.filter(socio => socio.esChofer).length;

      setStats({
        totalSocios,
        totalVehiculos,
        totalIngresos,
        sociosChoferes,
      });

      // Calcular ingresos por tipo
      const ingresosPorTipo: { [key: string]: number } = {};
      ingresos.forEach(ingreso => {
        ingresosPorTipo[ingreso.tipo] = (ingresosPorTipo[ingreso.tipo] || 0) + ingreso.monto;
      });
      setIngresosPorTipo(ingresosPorTipo);
    };

    fetchData();
  }, []);

  const ingresosPorTipoData = {
    labels: Object.keys(ingresosPorTipo),
    datasets: [
      {
        data: Object.values(ingresosPorTipo),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(199, 199, 199, 0.5)',
          'rgba(83, 102, 255, 0.5)',
          'rgba(40, 159, 64, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Socios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalSocios}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total de Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalVehiculos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalIngresos.toFixed(2)} Bs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Socios Choferes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.sociosChoferes}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={ingresosPorTipoData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
