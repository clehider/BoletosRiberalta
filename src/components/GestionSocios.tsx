'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from 'lucide-react'

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  vineta: string;
}

interface Chofer {
  id: string;
  nombre: string;
  apellidos: string;
  licencia: string;
}

interface Socio {
  id: string;
  nombre: string;
  apellidos: string;
  ci: string;
  fechaNacimiento: Timestamp;
  direccion: string;
  telefono: string;
  email: string;
  fechaIngreso: Timestamp;
  estado: string;
  vehiculos: Vehiculo[];
  choferes: Chofer[];
}

export default function GestionSocios() {
  const [socios, setSocios] = useState<Socio[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ci: '',
    direccion: '',
    telefono: '',
    email: '',
    estado: 'Activo',
    vehiculos: [] as Vehiculo[],
    choferes: [] as Chofer[]
  })

  useEffect(() => {
    cargarSocios()
  }, [])

  async function cargarSocios() {
    try {
      const querySnapshot = await getDocs(collection(db, 'socios'))
      const sociosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Socio[]
      setSocios(sociosData)
    } catch (error) {
      console.error('Error al cargar socios:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingSocio) {
        await updateDoc(doc(db, 'socios', editingSocio.id), {
          ...formData,
          fechaActualizacion: Timestamp.now()
        })
        console.log('Socio actualizado correctamente')
      } else {
        const docRef = await addDoc(collection(db, 'socios'), {
          ...formData,
          fechaNacimiento: Timestamp.now(),
          fechaIngreso: Timestamp.now()
        })
        console.log('Nuevo socio agregado con ID:', docRef.id)
      }
      setShowDialog(false)
      setEditingSocio(null)
      await cargarSocios() // Esperamos a que se recarguen los datos
      resetForm()
      alert(editingSocio ? 'Socio actualizado correctamente' : 'Socio agregado correctamente')
    } catch (error) {
      console.error('Error al guardar socio:', error)
      alert('Error al guardar: ' + error)
    }
  }

  function resetForm() {
    setFormData({
      nombre: '',
      apellidos: '',
      ci: '',
      direccion: '',
      telefono: '',
      email: '',
      estado: 'Activo',
      vehiculos: [],
      choferes: []
    })
    setEditingSocio(null) // Importante: resetear el estado de edición
  }

  function handleEdit(socio: Socio) {
    setEditingSocio(socio)
    setFormData({
      nombre: socio.nombre,
      apellidos: socio.apellidos,
      ci: socio.ci,
      direccion: socio.direccion || '',
      telefono: socio.telefono || '',
      email: socio.email || '',
      estado: socio.estado,
      vehiculos: socio.vehiculos || [],
      choferes: socio.choferes || []
    })
    setShowDialog(true)
  }

  async function handleDelete(id: string) {
    if (confirm('¿Está seguro de eliminar este socio?')) {
      try {
        await deleteDoc(doc(db, 'socios', id))
        cargarSocios()
      } catch (error) {
        console.error('Error al eliminar socio:', error)
      }
    }
  }

  function addVehiculo() {
    setFormData({
      ...formData,
      vehiculos: [...formData.vehiculos, { id: Date.now().toString(), marca: '', modelo: '', placa: '', vineta: '' }]
    })
  }

  function removeVehiculo(index: number) {
    const newVehiculos = formData.vehiculos.filter((_, i) => i !== index)
    setFormData({ ...formData, vehiculos: newVehiculos })
  }

  function addChofer() {
    setFormData({
      ...formData,
      choferes: [...formData.choferes, { id: Date.now().toString(), nombre: '', apellidos: '', licencia: '' }]
    })
  }

  function removeChofer(index: number) {
    const newChoferes = formData.choferes.filter((_, i) => i !== index)
    setFormData({ ...formData, choferes: newChoferes })
  }

  return (
    <div className="container mx-auto p-4">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button 
            className="bg-[#1e1b4b] text-white"
            onClick={() => {
              resetForm() // Limpia el formulario antes de abrir
              setShowDialog(true)
            }}
          >
            Nuevo Socio
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSocio ? 'Editar Socio' : 'Registrar Nuevo Socio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ci">CI</Label>
                <Input
                  id="ci"
                  value={formData.ci}
                  onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Sección de Vehículos */}
              <div className="space-y-2">
                <Label>Vehículos</Label>
                {formData.vehiculos.map((vehiculo, index) => (
                  <div key={vehiculo.id} className="grid grid-cols-4 gap-2 items-center">
                    <Input
                      placeholder="Marca"
                      value={vehiculo.marca}
                      onChange={(e) => {
                        const newVehiculos = [...formData.vehiculos]
                        newVehiculos[index].marca = e.target.value
                        setFormData({ ...formData, vehiculos: newVehiculos })
                      }}
                    />
                    <Input
                      placeholder="Placa"
                      value={vehiculo.placa}
                      onChange={(e) => {
                        const newVehiculos = [...formData.vehiculos]
                        newVehiculos[index].placa = e.target.value
                        setFormData({ ...formData, vehiculos: newVehiculos })
                      }}
                    />
                    <Input
                      placeholder="Viñeta"
                      value={vehiculo.vineta}
                      onChange={(e) => {
                        const newVehiculos = [...formData.vehiculos]
                        newVehiculos[index].vineta = e.target.value
                        setFormData({ ...formData, vehiculos: newVehiculos })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVehiculo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addVehiculo}>
                  Agregar Vehículo
                </Button>
              </div>

              {/* Sección de Choferes */}
              <div className="space-y-2">
                <Label>Choferes</Label>
                {formData.choferes.map((chofer, index) => (
                  <div key={chofer.id} className="grid grid-cols-4 gap-2 items-center">
                    <Input
                      placeholder="Nombre"
                      value={chofer.nombre}
                      onChange={(e) => {
                        const newChoferes = [...formData.choferes]
                        newChoferes[index].nombre = e.target.value
                        setFormData({ ...formData, choferes: newChoferes })
                      }}
                    />
                    <Input
                      placeholder="Apellidos"
                      value={chofer.apellidos}
                      onChange={(e) => {
                        const newChoferes = [...formData.choferes]
                        newChoferes[index].apellidos = e.target.value
                        setFormData({ ...formData, choferes: newChoferes })
                      }}
                    />
                    <Input
                      placeholder="Licencia"
                      value={chofer.licencia}
                      onChange={(e) => {
                        const newChoferes = [...formData.choferes]
                        newChoferes[index].licencia = e.target.value
                        setFormData({ ...formData, choferes: newChoferes })
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChofer(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addChofer}>
                  Agregar Chofer
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingSocio ? 'Actualizar' : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold my-4">Lista de Socios</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>CI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socios.map((socio) => (
                <TableRow key={socio.id}>
                  <TableCell>{socio.nombre} {socio.apellidos}</TableCell>
                  <TableCell>{socio.ci}</TableCell>
                  <TableCell>{socio.telefono}</TableCell>
                  <TableCell>{socio.estado}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      onClick={() => handleEdit(socio)}
                      variant="outline"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(socio.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
