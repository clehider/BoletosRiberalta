import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSalidas: 0,
    totalPasajeros: 0,
    totalIngresos: 0,
    totalGastos: 0,
    vehiculosActivos: 0,
  });

  const [ventasPorMes, setVentasPorMes] = useState<number[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      // Obtener ventas
      const ventasQuery = query(collection(db, 'ventas'));
      const ventasSnapshot = await getDocs(ventasQuery);
      const ventas = ventasSnapshot.docs.map(doc => doc.data());

      // Obtener gastos
      const gastosQuery = query(collection(db, 'gastos'));
      const gastosSnapshot = await getDocs(gastosQuery);
      const gastos = gastosSnapshot.docs.map(doc => doc.data());

      // Obtener vehículos
      const vehiculosQuery = query(collection(db, 'vehiculos'));
      const vehiculosSnapshot = await getDocs(vehiculosQuery);
      const vehiculos = vehiculosSnapshot.docs.map(doc => doc.data());

      // Calcular estadísticas
      const totalSalidas = ventas.length;
      const totalPasajeros = ventas.length; // Asumiendo un pasajero por venta
      const totalIngresos = ventas.reduce((sum, venta) => sum + (venta.monto || 0), 0);
      const totalGastos = gastos.reduce((sum, gasto) => sum + (gasto.monto || 0), 0);
      const vehiculosActivos = vehiculos.length;

      setStats({
        totalSalidas,
        totalPasajeros,
        totalIngresos,
        totalGastos,
        vehiculosActivos,
      });

      // Calcular ventas por mes (últimos 6 meses)
      const ventasPorMes = Array(6).fill(0);
      const hoy = new Date();
      ventas.forEach(venta => {
        const fechaVenta = (venta.fecha as Timestamp).toDate();
        const mesesDeDiferencia = (hoy.getMonth() - fechaVenta.getMonth() + 12) % 12;
        if (mesesDeDiferencia < 6) {
          ventasPorMes[5 - mesesDeDiferencia] += venta.monto || 0;
        }
      });
      setVentasPorMes(ventasPorMes);

      // Calcular gastos por categoría
      const gastosPorCategoria: { [key: string]: number } = {};
      gastos.forEach(gasto => {
        const categoria = gasto.categoria || 'Otros';
        gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + (gasto.monto || 0);
      });
      setGastosPorCategoria(gastosPorCategoria);
    };

    fetchData();
  }, []);

  const ventasChartData = {
    labels: ['Hace 6 meses', 'Hace 5 meses', 'Hace 4 meses', 'Hace 3 meses', 'Hace 2 meses', 'Último mes'],
    datasets: [
      {
        label: 'Ventas por mes',
        data: ventasPorMes,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const gastosChartData = {
    labels: Object.keys(gastosPorCategoria),
    datasets: [
      {
        data: Object.values(gastosPorCategoria),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Salidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalSalidas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total de Pasajeros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.totalPasajeros}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${stats.totalIngresos.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">${stats.totalGastos.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vehículos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.vehiculosActivos}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={ventasChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={gastosChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
