import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Socio } from '../models/Socio';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RegistroIngresos: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'SALIDAS',
    monto: '',
    descripcion: '',
    socioId: ''
  });

  const tiposIngresos = [
    'SALIDAS',
    'CAMAS',
    'LINEA',
    'CHURRASCO',
    'MORTUORIA',
    'FEDERACION',
    'MENSUALIDAD',
    'MULTAS',
    'OTROS'
  ];

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    const querySnapshot = await getDocs(collection(db, 'socios'));
    const sociosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Socio[];
    setSocios(sociosData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'ingresos'), {
        ...formData,
        monto: parseFloat(formData.monto),
        fecha: new Date()
      });
      setIsOpen(false);
      setFormData({
        tipo: 'SALIDAS',
        monto: '',
        descripcion: '',
        socioId: ''
      });
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Registro de Ingresos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Nuevo Ingreso</Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-white">Registrar Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo" className="text-gray-700 dark:text-gray-300">Tipo de Ingreso</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposIngresos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monto" className="text-gray-700 dark:text-gray-300">Monto (Bs)</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descripcion" className="text-gray-700 dark:text-gray-300">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="socio" className="text-gray-700 dark:text-gray-300">Socio</Label>
                  <Select
                    value={formData.socioId}
                    onValueChange={(value) => setFormData({ ...formData, socioId: value })}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white">
                      <SelectValue placeholder="Seleccione el socio" />
                    </SelectTrigger>
                    <SelectContent>
                      {socios.map((socio) => (
                        <SelectItem key={socio.id} value={socio.id}>
                          {socio.nombre} {socio.apellidos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Registrar Ingreso</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposIngresos.map((tipo) => (
          <Card key={tipo} className="bg-white dark:bg-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-white">{tipo}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setFormData({ ...formData, tipo });
                  setIsOpen(true);
                }}
              >
                Registrar {tipo}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RegistroIngresos;
