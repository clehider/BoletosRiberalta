import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

interface Ingreso {
  id: string;
  tipo: string;
  monto: number;
  descripcion: string;
  socioId: string;
  fecha: Date;
}

const RegistroIngresos: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [selectedIngresos, setSelectedIngresos] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    tipo: 'SALIDAS',
    monto: '',
    descripcion: '',
    socioId: ''
  });
  const [editingIngreso, setEditingIngreso] = useState<Ingreso | null>(null);

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
    fetchIngresos();
  }, []);

  const fetchSocios = async () => {
    const querySnapshot = await getDocs(collection(db, 'socios'));
    const sociosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Socio[];
    setSocios(sociosData);
  };

  const fetchIngresos = async () => {
    const querySnapshot = await getDocs(collection(db, 'ingresos'));
    const ingresosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha.toDate()
    })) as Ingreso[];
    setIngresos(ingresosData);
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
      fetchIngresos();
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
    }
  };

  const handleEdit = (ingreso: Ingreso) => {
    setEditingIngreso(ingreso);
    setFormData({
      tipo: ingreso.tipo,
      monto: ingreso.monto.toString(),
      descripcion: ingreso.descripcion,
      socioId: ingreso.socioId
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIngreso) {
      try {
        await updateDoc(doc(db, 'ingresos', editingIngreso.id), {
          ...formData,
          monto: parseFloat(formData.monto)
        });
        setIsEditOpen(false);
        fetchIngresos();
      } catch (error) {
        console.error('Error al actualizar ingreso:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      try {
        await deleteDoc(doc(db, 'ingresos', id));
        fetchIngresos();
      } catch (error) {
        console.error('Error al eliminar ingreso:', error);
      }
    }
  };

  const handleMassDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIngresos.length} ingresos?`)) {
      try {
        await Promise.all(selectedIngresos.map(id => deleteDoc(doc(db, 'ingresos', id))));
        fetchIngresos();
        setSelectedIngresos([]);
      } catch (error) {
        console.error('Error al eliminar ingresos masivamente:', error);
      }
    }
  };

 const exportToPDF = () => {
  const doc = new jsPDF();
  const tableColumn = ["Tipo", "Monto", "Descripción", "Fecha"];
  const tableRows = ingresos.map(ingreso => [
    ingreso.tipo,
    ingreso.monto,
    ingreso.descripcion,
    ingreso.fecha.toLocaleDateString()
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
  } as UserOptions);

  doc.save('ingresos.pdf');
};

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Tipo,Monto,Descripción,Fecha\n"
      + ingresos.map(ingreso => 
          `${ingreso.tipo},${ingreso.monto},${ingreso.descripcion},${ingreso.fecha.toLocaleDateString()}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ingresos.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Registro de Ingresos</h1>
        <div className="space-x-2">
          <Button onClick={exportToPDF} className="bg-blue-600 hover:bg-blue-700 text-white">Exportar a PDF</Button>
          <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white">Exportar a CSV</Button>
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
      </div>

      {selectedIngresos.length > 0 && (
        <Button onClick={handleMassDelete} className="mb-4 bg-red-600 hover:bg-red-700 text-white">
          Eliminar Seleccionados ({selectedIngresos.length})
        </Button>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingresos.map((ingreso) => (
                <TableRow key={ingreso.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIngresos.includes(ingreso.id)}
                      onCheckedChange={(checked) => {
                        setSelectedIngresos(
                          checked
                            ? [...selectedIngresos, ingreso.id]
                            : selectedIngresos.filter((id) => id !== ingreso.id)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>{ingreso.tipo}</TableCell>
                  <TableCell>{ingreso.monto}</TableCell>
                  <TableCell>{ingreso.descripcion}</TableCell>
                  <TableCell>{ingreso.fecha.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(ingreso)} className="mr-2 bg-yellow-600 hover:bg-yellow-700 text-white">
                      Editar
                    </Button>
                    <Button onClick={() => handleDelete(ingreso.id)} className="bg-red-600 hover:bg-red-700 text-white">
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-white">Editar Ingreso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Actualizar Ingreso</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistroIngresos;
