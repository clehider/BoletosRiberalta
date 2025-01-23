import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Socio } from '../models/Socio';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const GestionSocios: React.FC = () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    lineasCompradas: 1,
    vinetas: [''],
    esChofer: false,
    choferes: ['']
  });

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
      await addDoc(collection(db, 'socios'), {
        ...formData,
        fechaIngreso: new Date(),
      });
      setIsOpen(false);
      fetchSocios();
      setFormData({
        nombre: '',
        apellidos: '',
        ci: '',
        lineasCompradas: 1,
        vinetas: [''],
        esChofer: false,
        choferes: ['']
      });
    } catch (error) {
      console.error('Error al guardar socio:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este socio?')) {
      await deleteDoc(doc(db, 'socios', id));
      fetchSocios();
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Socios</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Nuevo Socio</Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-white">Añadir Nuevo Socio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellidos" className="text-gray-700 dark:text-gray-300">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ci" className="text-gray-700 dark:text-gray-300">CI</Label>
                  <Input
                    id="ci"
                    value={formData.ci}
                    onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                    required
                    className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lineasCompradas" className="text-gray-700 dark:text-gray-300">Líneas Compradas</Label>
                  <Input
                    id="lineasCompradas"
                    type="number"
                    min="1"
                    value={formData.lineasCompradas}
                    onChange={(e) => setFormData({ ...formData, lineasCompradas: parseInt(e.target.value) })}
                    required
                    className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="esChofer"
                    checked={formData.esChofer}
                    onCheckedChange={(checked) => setFormData({ ...formData, esChofer: checked as boolean })}
                    className="text-blue-600"
                  />
                  <Label htmlFor="esChofer" className="text-gray-700 dark:text-gray-300">Es Chofer</Label>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Guardar Socio</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-700 dark:text-gray-300">Nombre</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">CI</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Líneas</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Es Chofer</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {socios.map((socio) => (
            <TableRow key={socio.id}>
              <TableCell className="text-gray-800 dark:text-gray-200">{socio.nombre} {socio.apellidos}</TableCell>
              <TableCell className="text-gray-800 dark:text-gray-200">{socio.ci}</TableCell>
              <TableCell className="text-gray-800 dark:text-gray-200">{socio.lineasCompradas}</TableCell>
              <TableCell className="text-gray-800 dark:text-gray-200">{socio.esChofer ? 'Sí' : 'No'}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(socio.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GestionSocios;
