import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Socios</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Nuevo Socio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Socio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ci">CI</Label>
                  <Input
                    id="ci"
                    value={formData.ci}
                    onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lineasCompradas">Líneas Compradas</Label>
                  <Input
                    id="lineasCompradas"
                    type="number"
                    min="1"
                    value={formData.lineasCompradas}
                    onChange={(e) => setFormData({ ...formData, lineasCompradas: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="esChofer"
                    checked={formData.esChofer}
                    onCheckedChange={(checked) => setFormData({ ...formData, esChofer: checked as boolean })}
                  />
                  <Label htmlFor="esChofer">Es Chofer</Label>
                </div>
              </div>
              <Button type="submit" className="w-full">Guardar Socio</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>CI</TableHead>
            <TableHead>Líneas</TableHead>
            <TableHead>Es Chofer</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {socios.map((socio) => (
            <TableRow key={socio.id}>
              <TableCell>{socio.nombre} {socio.apellidos}</TableCell>
              <TableCell>{socio.ci}</TableCell>
              <TableCell>{socio.lineasCompradas}</TableCell>
              <TableCell>{socio.esChofer ? 'Sí' : 'No'}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(socio.id)}
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
