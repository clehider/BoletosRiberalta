import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "../firebase/config"
import { collection, addDoc, getDocs, query, where, Timestamp, updateDoc, doc, deleteDoc } from "firebase/firestore"
import { Bus, Settings, Plus, Trash } from 'lucide-react'
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
  tipo: "Camioneta" | "Ipsum" | "Noah"
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

  const handleVehiculoChange = async (vehiculoId: string) => {
    const vehiculo = vehiculos.find((v) => v.id === vehiculoId)
    if (vehiculo) {
      setVehiculoSeleccionado(vehiculo)
      setBoleto((prev) => ({ ...prev, vehiculo: vehiculoId }))
      try {
        const boletosQuery = query(
          collection(db, "boletos"),
          where("vehiculo", "==", vehiculoId),
          where("fecha", ">=", Timestamp.fromDate(new Date(new Date().setHours(0,0,0,0)))),
          where("fecha", "<=", Timestamp.fromDate(new Date(new Date().setHours(23,59,59,999))))
        )
        const boletosSnapshot = await getDocs(boletosQuery)
        const asientosOcupados = boletosSnapshot.docs.map(doc => doc.data().asiento)
        
        const asientosArray: Asiento[] = Array.from(
          { length: vehiculo.asientos },
          (_, i) => ({
            numero: i + 1,
            ocupado: asientosOcupados.includes((i + 1).toString())
          })
        )
        setAsientos(asientosArray)
      } catch (error) {
        console.error("Error al cargar asientos ocupados:", error)
        const asientosArray: Asiento[] = Array.from(
          { length: vehiculo.asientos },
          (_, i) => ({
            numero: i + 1,
            ocupado: false
          })
        )
        setAsientos(asientosArray)
      }
    }
  }

  const handleAsientoClick = (asiento: Asiento) => {
    if (!asiento.ocupado) {
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
        id: "",
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
      
      let totalVentas = 0
      boletosDelDia.forEach(boleto => {
        totalVentas += boleto.precio
      })

      ventaSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { 
          estado: "cerrada",
          totalVentas: totalVentas,
          cantidadBoletos: boletosDelDia.length
        })
      })

      await addDoc(collection(db, "reportes"), {
        fecha: Timestamp.now(),
        totalVentas: totalVentas,
        cantidadBoletos: boletosDelDia.length,
        boletos: boletosDelDia
      })

      setVentaAbierta(false)
      alert(`Venta del día cerrada. Total: ${totalVentas} Bs.`)
    } catch (error) {
      console.error("Error al cerrar venta:", error)
      alert("Error al cerrar la venta")
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
                <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
                  <Label className="text-lg font-semibold mb-4 block">
                    Selección de Asiento - {vehiculoSeleccionado.placa}
                  </Label>
                  <div className="grid gap-4">
                    {vehiculoSeleccionado.tipo === "Camioneta" && (
                      <div className="grid grid-cols-3 gap-3">
                        {asientos.map((asiento) => (
                          <Button
                            key={asiento.numero}
                            type="button"
                            variant={asiento.numero === 1 ? "destructive" : asiento.ocupado ? "secondary" : "outline"}
                            className={`
                              h-24 w-full flex flex-col items-center justify-center p-2
                              ${asiento.ocupado ? 'bg-gray-200 text-gray-500' : 'bg-white'}
                              ${asiento.numero === 1 ? 'bg-red-100 text-red-700' : ''}
                              ${asiento.numero === asientoSeleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                              border-2 hover:bg-gray-50 transition-all duration-200
                            `}
                            disabled={asiento.ocupado || asiento.numero === 1}
                            onClick={() => handleAsientoClick(asiento)}
                          >
                            <span className="text-xs font-medium mb-1">
                              {asiento.numero === 1 ? 'Chofer' : 'Asiento'}
                            </span>
                            <span className="text-xl font-bold">
                              {asiento.numero}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                    {vehiculoSeleccionado.tipo === "Ipsum" && (
                      <div className="grid grid-cols-2 gap-3">
                        {asientos.map((asiento) => (
                          <Button
                            key={asiento.numero}
                            type="button"
                            variant={asiento.numero === 1 ? "destructive" : asiento.ocupado ? "secondary" : "outline"}
                            className={`
                              h-24 w-full flex flex-col items-center justify-center p-2
                              ${asiento.ocupado ? 'bg-gray-200 text-gray-500' : 'bg-white'}
                              ${asiento.numero === 1 ? 'bg-red-100 text-red-700' : ''}
                              ${asiento.numero === asientoSeleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                              border-2 hover:bg-gray-50 transition-all duration-200
                            `}
                            disabled={asiento.ocupado || asiento.numero === 1}
                            onClick={() => handleAsientoClick(asiento)}
                          >
                            <span className="text-xs font-medium mb-1">
                              {asiento.numero === 1 ? 'Chofer' : 'Asiento'}
                            </span>
                            <span className="text-xl font-bold">
                              {asiento.numero}
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                    {vehiculoSeleccionado.tipo === "Noah" && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {asientos.slice(0, 2).map((asiento) => (
                            <Button
                              key={asiento.numero}
                              type="button"
                              variant={asiento.numero === 1 ? "destructive" : asiento.ocupado ? "secondary" : "outline"}
                              className={`
                                h-24 w-full flex flex-col items-center justify-center p-2
                                ${asiento.ocupado ? 'bg-gray-200 text-gray-500' : 'bg-white'}
                                ${asiento.numero === 1 ? 'bg-red-100 text-red-700' : ''}
                                ${asiento.numero === asientoSeleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                border-2 hover:bg-gray-50 transition-all duration-200
                              `}
                              disabled={asiento.ocupado || asiento.numero === 1}
                              onClick={() => handleAsientoClick(asiento)}
                            >
                              <span className="text-xs font-medium mb-1">
                                {asiento.numero === 1 ? 'Chofer' : 'Asiento'}
                              </span>
                              <span className="text-xl font-bold">
                                {asiento.numero}
                              </span>
                            </Button>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {asientos.slice(2, 5).map((asiento) => (
                            <Button
                              key={asiento.numero}
                              type="button"
                              variant={asiento.ocupado ? "secondary" : "outline"}
                              className={`
                                h-24 w-full flex flex-col items-center justify-center p-2
                                ${asiento.ocupado ? 'bg-gray-200 text-gray-500' : 'bg-white'}
                                ${asiento.numero === asientoSeleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                border-2 hover:bg-gray-50 transition-all duration-200
                              `}
                              disabled={asiento.ocupado}
                              onClick={() => handleAsientoClick(asiento)}
                            >
                              <span className="text-xs font-medium mb-1">
                                Asiento
                              </span>
                              <span className="text-xl font-bold">
                                {asiento.numero}
                              </span>
                            </Button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {asientos.slice(5).map((asiento) => (
                            <Button
                              key={asiento.numero}
                              type="button"
                              variant={asiento.ocupado ? "secondary" : "outline"}
                              className={`
                                h-24 w-full flex flex-col items-center justify-center p-2
                                ${asiento.ocupado ? 'bg-gray-200 text-gray-500' : 'bg-white'}
                                ${asiento.numero === asientoSeleccionado ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                border-2 hover:bg-gray-50 transition-all duration-200
                              `}
                              disabled={asiento.ocupado}
                              onClick={() => handleAsientoClick(asiento)}
                            >
                              <span className="text-xs font-medium mb-1">
                                Asiento
                              </span>
                              <span className="text-xl font-bold">
                                {asiento.numero}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {ventaAbierta ? (
        <Button onClick={cerrarVenta} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Cerrar Venta del Día
        </Button>
      ) : (
        <Button onClick={abrirVenta} className="mt-4 bg-green-500 hover:bg-green-600 text-white">
          Abrir Venta del Día
        </Button>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Datos del Pasajero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Pasajero</Label>
              <Input
                value={boleto.pasajero}
                onChange={(e) => setBoleto((prev) => ({ ...prev, pasajero: e.target.value }))}
              />
            </div>
            <div>
              <Label>CI</Label>
              <Input
                value={boleto.ci}
                onChange={(e) => setBoleto((prev) => ({ ...prev, ci: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket de Venta</DialogTitle>
          </DialogHeader>
          <div>
            <p>Boleto vendido exitosamente</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setTicketModalOpen(false)}>Cerrar</Button>
            <Button onClick={imprimirTicket}>Imprimir Ticket</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={configuracionModalOpen} onOpenChange={setConfiguracionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="destinos">
            <TabsList>
              <TabsTrigger value="destinos">Destinos</TabsTrigger>
              <TabsTrigger value="vehiculos">Vehículos</TabsTrigger>
            </TabsList>
            <TabsContent value="destinos">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Nuevo destino"
                    value={nuevoDestino}
                    onChange={(e) => setNuevoDestino(e.target.value)}
                  />
                  <Button onClick={agregarDestino}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ul>
                  {destinos.map((destino) => (
                    <li key={destino} className="flex items-center justify-between py-2">
                      <span>{destino}</span>
                      <Button variant="ghost" onClick={() => eliminarDestino(destino)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="vehiculos">
              <div className="space-y-4">
                {vehiculos.map((vehiculo) => (
                  <div key={vehiculo.id} className="flex items-center space-x-2">
                    <span>{vehiculo.tipo} - {vehiculo.placa}</span>
                    <Input
                      type="number"
                      defaultValue={vehiculo.asientos}
                      onChange={(e) => actualizarAsientosVehiculo(vehiculo.id, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VentaPasajes
