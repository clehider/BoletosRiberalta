import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "../firebase/config"
import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { Bus, Settings, Plus, Trash } from "lucide-react"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface Boleto {
  id: string
  vehiculo: string
  origen: string
  destino: string
  fecha: Timestamp
  hora: string
  precio: number
  pasajero: string
  ci: string
  asiento: string
  encomienda: string
}

interface Vehiculo {
  id: string
  tipo: "Bus" | "Noah"
  placa: string
  asientos: number
}

interface Asiento {
  numero: number
  ocupado: boolean
}

const VentaPasajes: React.FC = () => {
  const [boleto, setBoleto] = useState<Omit<Boleto, "id">>({
    vehiculo: "",
    origen: "",
    destino: "",
    fecha: Timestamp.now(),
    hora: "",
    precio: 0,
    pasajero: "",
    ci: "",
    asiento: "",
    encomienda: "",
  })

  const [destinos, setDestinos] = useState<string[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [asientos, setAsientos] = useState<Asiento[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<number | null>(null)
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [ventaAbierta, setVentaAbierta] = useState(false)
  const [boletosDelDia, setBoletosDelDia] = useState<Boleto[]>([])
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<Vehiculo | null>(null)
  const [configuracionModalOpen, setConfiguracionModalOpen] = useState(false)
  const [nuevoDestino, setNuevoDestino] = useState("")
  //const [editandoDestinos, setEditandoDestinos] = useState(false)

  useEffect(() => {
    cargarDatos()
    verificarEstadoVenta()
  }, [])

  const cargarDatos = async () => {
    try {
      const destinosSnapshot = await getDocs(collection(db, "destinos"))
      const destinosList = destinosSnapshot.docs.map((doc) => doc.data().nombre)
      setDestinos(destinosList)

      const vehiculosSnapshot = await getDocs(collection(db, "vehiculos"))
      const vehiculosList = vehiculosSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Vehiculo,
      )
      setVehiculos(vehiculosList)

      const boletosDelDiaQuery = query(
        collection(db, "boletos"),
        where("fecha", ">=", Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))),
      )
      const boletosDelDiaSnapshot = await getDocs(boletosDelDiaQuery)
      const boletosDelDiaList = boletosDelDiaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Boleto)
      setBoletosDelDia(boletosDelDiaList)
    } catch (error) {
      console.error("Error cargando datos:", error)
    }
  }

  const verificarEstadoVenta = async () => {
    const ventaQuery = query(
      collection(db, "ventas"),
      where("fecha", ">=", Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))),
      where("estado", "==", "abierta"),
    )
    const ventaSnapshot = await getDocs(ventaQuery)
    setVentaAbierta(!ventaSnapshot.empty)
  }

  useEffect(() => {
    if (vehiculoSeleccionado) {
      const asientosArray: Asiento[] = Array.from({ length: vehiculoSeleccionado.asientos }, (_, i) => ({
        numero: i + 1,
        ocupado: i === 0, // El asiento 1 es el conductor
      }))
      setAsientos(asientosArray)
    }
  }, [vehiculoSeleccionado])

  const handleVehiculoChange = (vehiculoId: string) => {
    const vehiculo = vehiculos.find((v) => v.id === vehiculoId)
    setVehiculoSeleccionado(vehiculo || null)
    setBoleto((prev) => ({ ...prev, vehiculo: vehiculoId }))
  }

  const handleAsientoClick = (asiento: Asiento) => {
    if (!asiento.ocupado && asiento.numero !== 1) {
      setAsientoSeleccionado(asiento.numero)
      setModalOpen(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ventaAbierta) {
      alert("La venta del día no está abierta")
      return
    }
    if (!asientoSeleccionado) {
      alert("Debe seleccionar un asiento")
      return
    }

    try {
      const nuevoBoleto: Boleto = {
        id: "", // Será reemplazado por el ID generado por Firestore
        ...boleto,
        asiento: asientoSeleccionado.toString(),
        fecha: Timestamp.fromDate(new Date()),
      }

      const docRef = await addDoc(collection(db, "boletos"), nuevoBoleto)
      nuevoBoleto.id = docRef.id
      setBoletosDelDia([...boletosDelDia, nuevoBoleto])
      setAsientos((prev) => prev.map((a) => (a.numero === asientoSeleccionado ? { ...a, ocupado: true } : a)))
      setTicketModalOpen(true)
      setModalOpen(false)
    } catch (error) {
      console.error("Error al guardar el boleto:", error)
      alert("Error al guardar el boleto")
    }
  }

  const imprimirTicket = () => {
    const doc = new jsPDF()
    doc.text("Ticket de Venta", 10, 10)
    // Agregar más datos al ticket aquí...
    doc.save("ticket.pdf")
    setTicketModalOpen(false)
    setBoleto({
      vehiculo: "",
      origen: "",
      destino: "",
      fecha: Timestamp.now(),
      hora: "",
      precio: 0,
      pasajero: "",
      ci: "",
      asiento: "",
      encomienda: "",
    })
    setAsientoSeleccionado(null)
  }

  const abrirVenta = async () => {
    try {
      await addDoc(collection(db, "ventas"), {
        fecha: Timestamp.now(),
        estado: "abierta",
      })
      setVentaAbierta(true)
    } catch (error) {
      console.error("Error al abrir venta:", error)
    }
  }

  const cerrarVenta = async () => {
    try {
      const ventaQuery = query(
        collection(db, "ventas"),
        where("fecha", ">=", Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0)))),
        where("estado", "==", "abierta"),
      )
      const ventaSnapshot = await getDocs(ventaQuery)
      ventaSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { estado: "cerrada" })
      })
      setVentaAbierta(false)
    } catch (error) {
      console.error("Error al cerrar venta:", error)
    }
  }

  const agregarDestino = async () => {
    if (!nuevoDestino.trim()) return
    try {
      await addDoc(collection(db, "destinos"), {
        nombre: nuevoDestino.trim(),
      })
      setNuevoDestino("")
      cargarDatos()
    } catch (error) {
      console.error("Error al agregar destino:", error)
    }
  }

  const eliminarDestino = async (destino: string) => {
    try {
      const destinosRef = collection(db, "destinos")
      const q = query(destinosRef, where("nombre", "==", destino))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref)
      })
      cargarDatos()
    } catch (error) {
      console.error("Error al eliminar destino:", error)
    }
  }

  const actualizarAsientosVehiculo = async (vehiculoId: string, nuevaCantidad: number) => {
    try {
      await updateDoc(doc(db, "vehiculos", vehiculoId), {
        asientos: nuevaCantidad,
      })
      cargarDatos()
    } catch (error) {
      console.error("Error al actualizar asientos:", error)
    }
  }

  const exportarReportePDF = () => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text("Reporte de Ventas del Día", 14, 20)

    // Fecha
    doc.setFontSize(12)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30)

    // Tabla de ventas
    const headers = [["Vehículo", "Origen", "Destino", "Hora", "Pasajero", "Asiento", "Precio"]]
    const data = boletosDelDia.map((boleto) => [
      vehiculos.find((v) => v.id === boleto.vehiculo)?.placa || "",
      boleto.origen,
      boleto.destino,
      boleto.hora,
      boleto.pasajero,
      boleto.asiento,
      `$${boleto.precio}`,
    ])

    // Total
    const total = boletosDelDia.reduce((sum, boleto) => sum + boleto.precio, 0)
    ;(doc as any).autoTable({
      head: headers,
      body: data,
      startY: 40,
    })

    const finalY = (doc as any).lastAutoTable.finalY || 40
    doc.text(`Total de ventas: $${total}`, 14, finalY + 10)

    doc.save("reporte_ventas.pdf")
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bus className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Sistema de Pasajes</h1>
        </div>
        <Button variant="outline" size="icon" onClick={() => setConfiguracionModalOpen(true)}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venta de Pasajes</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Vehículo</Label>
                <Select onValueChange={handleVehiculoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((vehiculo) => (
                      <SelectItem key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.tipo} - {vehiculo.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origen</Label>
                  <Select onValueChange={(value) => setBoleto((prev) => ({ ...prev, origen: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinos.map((destino) => (
                        <SelectItem key={destino} value={destino}>
                          {destino}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Destino</Label>
                  <Select onValueChange={(value) => setBoleto((prev) => ({ ...prev, destino: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinos.map((destino) => (
                        <SelectItem key={destino} value={destino}>
                          {destino}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={boleto.fecha.toDate().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setBoleto((prev) => ({
                        ...prev,
                        fecha: Timestamp.fromDate(new Date(e.target.value)),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input
                    type="time"
                    value={boleto.hora}
                    onChange={(e) => setBoleto((prev) => ({ ...prev, hora: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Precio</Label>
                <Input
                  type="number"
                  value={boleto.precio}
                  onChange={(e) => setBoleto((prev) => ({ ...prev, precio: Number(e.target.value) }))}
                />
              </div>

              {vehiculoSeleccionado && (
                <div>
                  <Label>Selección de Asiento</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {asientos.map((asiento) => (
                      <Button
                        key={asiento.numero}
                        type="button"
                        variant={asiento.numero === 1 ? "destructive" : asiento.ocupado ? "secondary" : "outline"}
                        className={`h-16 ${asiento.numero === asientoSeleccionado ? "ring-2 ring-primary" : ""}`}
                        disabled={asiento.ocupado || asiento.numero === 1}
                        onClick={() => handleAsientoClick(asiento)}
                      >
                        {asiento.numero === 1 ? "Conductor" : `Asiento ${asiento.numero}`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Datos del Pasajero</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Nombre del Pasajero</Label>
                  <Input
                    value={boleto.pasajero}
                    onChange={(e) => setBoleto((prev) => ({ ...prev, pasajero: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>CI</Label>
                  <Input
                    value={boleto.ci}
                    onChange={(e) => setBoleto((prev) => ({ ...prev, ci: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Encomienda</Label>
                  <Input
                    value={boleto.encomienda}
                    onChange={(e) => setBoleto((prev) => ({ ...prev, encomienda: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Confirmar
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ticket de Venta</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p>
                  <strong>Vehículo:</strong> {vehiculoSeleccionado?.placa}
                </p>
                <p>
                  <strong>Origen:</strong> {boleto.origen}
                </p>
                <p>
                  <strong>Destino:</strong> {boleto.destino}
                </p>
                <p>
                  <strong>Fecha:</strong> {boleto.fecha.toDate().toLocaleDateString()}
                </p>
                <p>
                  <strong>Hora:</strong> {boleto.hora}
                </p>
                <p>
                  <strong>Precio:</strong> {boleto.precio}
                </p>
                <p>
                  <strong>Pasajero:</strong> {boleto.pasajero}
                </p>
                <p>
                  <strong>CI:</strong> {boleto.ci}
                </p>
                <p>
                  <strong>Asiento:</strong> {asientoSeleccionado}
                </p>
                <p>
                  <strong>Encomienda:</strong> {boleto.encomienda || "N/A"}
                </p>
              </div>
              <Button onClick={imprimirTicket} className="w-full">
                Imprimir Ticket
              </Button>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Dialog open={configuracionModalOpen} onOpenChange={setConfiguracionModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configuración del Sistema</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="ventas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ventas">Control de Ventas</TabsTrigger>
              <TabsTrigger value="vehiculos">Vehículos</TabsTrigger>
              <TabsTrigger value="destinos">Destinos</TabsTrigger>
            </TabsList>

            <TabsContent value="ventas" className="space-y-4">
              <div className="flex justify-between items-center">
                <Button onClick={ventaAbierta ? cerrarVenta : abrirVenta}>
                  {ventaAbierta ? "Cerrar Venta del Día" : "Abrir Venta del Día"}
                </Button>
                <Button onClick={exportarReportePDF}>Exportar Reporte PDF</Button>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Ventas del Día</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boletosDelDia.map((boleto) => (
                      <TableRow key={boleto.id}>
                        <TableCell>{vehiculos.find((v) => v.id === boleto.vehiculo)?.placa}</TableCell>
                        <TableCell>{boleto.origen}</TableCell>
                        <TableCell>{boleto.destino}</TableCell>
                        <TableCell>{boleto.hora}</TableCell>
                        <TableCell>${boleto.precio}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="vehiculos" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Configuración de Asientos</h3>
                {vehiculos.map((vehiculo) => (
                  <div key={vehiculo.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span>
                      {vehiculo.tipo} - {vehiculo.placa}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={vehiculo.asientos}
                        onChange={(e) => actualizarAsientosVehiculo(vehiculo.id, Number.parseInt(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-500">asientos</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="destinos" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Nuevo destino"
                  value={nuevoDestino}
                  onChange={(e) => setNuevoDestino(e.target.value)}
                />
                <Button onClick={agregarDestino}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Destinos Disponibles</h3>
                <div className="space-y-2">
                  {destinos.map((destino) => (
                    <div key={destino} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span>{destino}</span>
                      <Button variant="ghost" size="sm" onClick={() => eliminarDestino(destino)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VentaPasajes

