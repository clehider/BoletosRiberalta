import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Ingreso, Socio } from '../models/Socio';
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registro de Ingresos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Nuevo Ingreso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo de Ingreso</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="monto">Monto (Bs)</Label>
                  <Input
                    id="monto"
                    type="number"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="socio">Socio</Label>
                  <Select
                    value={formData.socioId}
                    onValueChange={(value) => setFormData({ ...formData, socioId: value })}
                  >
                    <SelectTrigger>
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
              <Button type="submit" className="w-full">Registrar Ingreso</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiposIngresos.map((tipo) => (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle>{tipo}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
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
