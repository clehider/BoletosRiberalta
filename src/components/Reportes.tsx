import React, { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Ingreso {
  id: string;
  tipo: string;
  monto: number;
  fecha: Date;
  descripcion?: string;
  socioId?: string;
}

const Reportes: React.FC = () => {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);

  useEffect(() => {
    const fetchIngresos = async () => {
      const ingresosQuery = query(collection(db, 'ingresos'));
      const ingresosSnapshot = await getDocs(ingresosQuery);
      const ingresosData = ingresosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha.toDate()
      })) as Ingreso[];
      setIngresos(ingresosData);
    };

    fetchIngresos();
  }, []);

  const calcularTotalPorTipo = () => {
    const totales: { [key: string]: number } = {};
    ingresos.forEach(ingreso => {
      totales[ingreso.tipo] = (totales[ingreso.tipo] || 0) + ingreso.monto;
    });
    return totales;
  };

  const totalesPorTipo = calcularTotalPorTipo();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reportes de Ingresos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Object.entries(totalesPorTipo).map(([tipo, total]) => (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle>{tipo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingresos.map((ingreso) => (
                <TableRow key={ingreso.id}>
                  <TableCell>{ingreso.fecha.toLocaleDateString()}</TableCell>
                  <TableCell>{ingreso.tipo}</TableCell>
                  <TableCell>${ingreso.monto.toFixed(2)}</TableCell>
                  <TableCell>{ingreso.descripcion || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reportes;
