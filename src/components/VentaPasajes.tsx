import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Settings, Trash } from "lucide-react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  deleteDoc,
  doc,
  updateDoc 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { generarReportePDF } from "@/lib/pdfGenerator";
import { ReporteDiario, Boleto } from "@/types";

interface Vehiculo {
  id: string;
  placa: string;
  asientos: number;
}

interface Asiento {
  numero: number;
  ocupado: boolean;
}

const VentaPasajes = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [destinos, setDestinos] = useState<string[]>([]);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [destinoSeleccionado, setDestinoSeleccionado] = useState("");
  const [asientoSeleccionado, setAsientoSeleccionado] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [configuracionModalOpen, setConfiguracionModalOpen] = useState(false);
  const [nuevoDestino, setNuevoDestino] = useState("");
  const [boletosDelDia, setBoletosDelDia] = useState<Boleto[]>([]);
  const [ventaAbierta, setVentaAbierta] = useState(false);
  const [boletoActual, setBoletoActual] = useState<Boleto | null>(null);
  const [boleto, setBoleto] = useState<Partial<Boleto>>({
    pasajero: "",
    ci: "",
    hora: "",
    precio: 0,
    encomienda: "",
  });
useEffect(() => {
    cargarVehiculos();
    cargarDestinos();
    verificarVentaAbierta();
  }, []);

  useEffect(() => {
    if (vehiculoSeleccionado) {
      cargarBoletosDelDia();
    }
  }, [vehiculoSeleccionado]);

  const cargarVehiculos = async () => {
    const querySnapshot = await getDocs(collection(db, "vehiculos"));
    const vehiculosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Vehiculo[];
    setVehiculos(vehiculosData);
  };

  const cargarDestinos = async () => {
    const querySnapshot = await getDocs(collection(db, "destinos"));
    const destinosData = querySnapshot.docs.map(doc => doc.data().nombre as string);
    setDestinos(destinosData);
  };

  const verificarVentaAbierta = async () => {
    try {
      const fecha = new Date("2025-01-26 17:23:44").toISOString().split('T')[0];
      const reportesQuery = query(
        collection(db, "reportes"),
        where("fechaGeneracion", "==", fecha)
      );
      const reportesSnapshot = await getDocs(reportesQuery);
      
      if (!reportesSnapshot.empty) {
        const reporte = reportesSnapshot.docs[0].data();
        setVentaAbierta(reporte.estado === "abierto");
      } else {
        setVentaAbierta(false);
      }
    } catch (error) {
      console.error("Error al verificar venta:", error);
      setVentaAbierta(false);
    }
  };

  const cargarBoletosDelDia = async () => {
    if (!vehiculoSeleccionado) return;

    const fecha = new Date("2025-01-26 17:23:44").toISOString().split('T')[0];
    const boletosQuery = query(
      collection(db, "boletos"),
      where("fecha", "==", fecha),
      where("vehiculo", "==", vehiculoSeleccionado)
    );
    const querySnapshot = await getDocs(boletosQuery);
    const boletosData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Boleto[];
    setBoletosDelDia(boletosData);

    const asientosVehiculo = vehiculos.find(v => v.id === vehiculoSeleccionado)?.asientos || 0;
    const nuevosAsientos = Array.from({ length: asientosVehiculo }, (_, i) => ({
      numero: i + 1,
      ocupado: boletosData.some(boleto => boleto.asiento === i + 1)
    }));
    setAsientos(nuevosAsientos);
  };

  const abrirVenta = async () => {
    try {
      const fecha = new Date("2025-01-26 17:23:44").toISOString().split('T')[0];
      const horaApertura = new Date("2025-01-26 17:23:44").toLocaleTimeString();
      
      await addDoc(collection(db, "reportes"), {
        fecha: Timestamp.fromDate(new Date("2025-01-26 17:23:44")),
        fechaGeneracion: fecha,
        horaApertura,
        horaCierre: "",
        usuario: "clehider",
        estado: "abierto",
        totalVentas: 0,
        totalMonto: 0,
        boletos: [],
        vehiculos: {},
        destinos: {}
      });

      setVentaAbierta(true);
      alert("Venta del día abierta exitosamente");
    } catch (error) {
      console.error("Error al abrir venta:", error);
      alert("Error al abrir la venta del día");
    }
  };

  const cerrarVenta = async () => {
    try {
      const fecha = new Date("2025-01-26 17:23:44").toISOString().split('T')[0];
      const horaCierre = new Date("2025-01-26 17:23:44").toLocaleTimeString();
      
      // Buscar el reporte del día actual
      const reportesQuery = query(
        collection(db, "reportes"),
        where("fechaGeneracion", "==", fecha)
      );
      
      const reportesSnapshot = await getDocs(reportesQuery);
      
      if (reportesSnapshot.empty) {
        throw new Error("No se encontró el reporte del día actual");
      }
      
      const reporteDoc = reportesSnapshot.docs[0];
      
      if (reporteDoc.data().estado === "cerrado") {
        throw new Error("La venta del día ya está cerrada");
      }

      // Obtener boletos del día
      const boletosQuery = query(
        collection(db, "boletos"),
        where("fecha", "==", fecha)
      );
      
      const boletosSnapshot = await getDocs(boletosQuery);
      const boletos = boletosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Boleto[];

      const totalVentas = boletos.length;
      const totalMonto = boletos.reduce((sum, boleto) => sum + (Number(boleto.precio) || 0), 0);
      
      const vehiculos = boletos.reduce((acc, boleto) => {
        const key = boleto.vehiculo;
        acc[key] = (acc[key] || 0) + (Number(boleto.precio) || 0);
        return acc;
      }, {} as Record<string, number>);
      
      const destinos = boletos.reduce((acc, boleto) => {
        const key = boleto.destino;
        acc[key] = (acc[key] || 0) + (Number(boleto.precio) || 0);
        return acc;
      }, {} as Record<string, number>);

      const reporte: ReporteDiario = {
        id: reporteDoc.id,
        fecha: reporteDoc.data().fecha,
        fechaGeneracion: fecha,
        horaApertura: reporteDoc.data().horaApertura,
        horaCierre,
        usuario: "clehider",
        estado: "cerrado",
        totalVentas,
        totalMonto,
        boletos,
        vehiculos,
        destinos
      };

      await updateDoc(doc(db, "reportes", reporteDoc.id), {
        horaCierre,
        estado: "cerrado",
        totalVentas,
        totalMonto,
        boletos,
        vehiculos,
        destinos
      });

      await generarReportePDF(reporte);
      
      setVentaAbierta(false);
      alert("Venta del día cerrada exitosamente");

    } catch (error) {
      console.error("Error detallado al cerrar venta:", error);
      alert(error instanceof Error ? error.message : "Error al cerrar la venta del día");
    }
  };
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!vehiculoSeleccionado || !destinoSeleccionado || !asientoSeleccionado) {
        console.error("Faltan datos requeridos");
        return;
      }

      const fecha = new Date("2025-01-26 17:25:10").toISOString().split('T')[0];
      
      if (!boleto.pasajero || !boleto.ci || !boleto.hora || !boleto.precio) {
        alert("Por favor, complete todos los campos requeridos");
        return;
      }

      const nuevoBoleto = {
        vehiculo: vehiculoSeleccionado,
        destino: destinoSeleccionado,
        asiento: asientoSeleccionado,
        fecha: fecha,
        pasajero: boleto.pasajero,
        ci: boleto.ci,
        hora: boleto.hora,
        precio: Number(boleto.precio),
        encomienda: boleto.encomienda || "",
        usuario: "clehider"
      };

      const docRef = await addDoc(collection(db, "boletos"), nuevoBoleto);
      const boletoConId = { id: docRef.id, ...nuevoBoleto };
      setBoletosDelDia([...boletosDelDia, boletoConId]);
      setBoletoActual(boletoConId as Boleto);
      setModalOpen(false);
      setTicketModalOpen(true);
      cargarBoletosDelDia();
      
      setBoleto({
        pasajero: "",
        ci: "",
        hora: "",
        precio: 0,
        encomienda: "",
      });
      setAsientoSeleccionado(null);

    } catch (error) {
      console.error("Error al guardar el boleto:", error);
      alert("Hubo un error al guardar el boleto. Por favor, intente nuevamente.");
    }
  };

  const agregarDestino = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoDestino.trim()) return;

    try {
      await addDoc(collection(db, "destinos"), {
        nombre: nuevoDestino
      });
      cargarDestinos();
      setNuevoDestino("");
    } catch (error) {
      console.error("Error al agregar destino:", error);
    }
  };

  const eliminarDestino = async (destino: string) => {
    const destinosRef = collection(db, "destinos");
    const q = query(destinosRef, where("nombre", "==", destino));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, "destinos", document.id));
    });

    cargarDestinos();
  };

  const imprimirTicket = () => {
    setTimeout(() => {
      window.print();
      setTicketModalOpen(false);
    }, 100);
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Venta de Pasajes</h1>
        <div className="flex gap-2">
          <Button 
            variant={ventaAbierta ? "destructive" : "default"}
            onClick={ventaAbierta ? cerrarVenta : abrirVenta}
          >
            {ventaAbierta ? "Cerrar Venta" : "Abrir Venta"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setConfiguracionModalOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Vehículo</Label>
              <Select 
                value={vehiculoSeleccionado} 
                onValueChange={setVehiculoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehiculos.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.placa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destino</Label>
              <Select 
                value={destinoSeleccionado} 
                onValueChange={setDestinoSeleccionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un destino" />
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

          {vehiculoSeleccionado && (
            <div>
              <Label>Asientos</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {asientos.map((asiento) => (
                  <Button
                    key={asiento.numero}
                    variant={asiento.ocupado ? "secondary" : "outline"}
                    className={`p-2 ${
                      asiento.ocupado 
                        ? "bg-gray-300 cursor-not-allowed" 
                        : asiento.numero === 1 
                          ? "bg-yellow-100 cursor-not-allowed" 
                          : "hover:bg-blue-100"
                    }`}
                    onClick={() => {
                      if (!asiento.ocupado && asiento.numero !== 1) {
                        setAsientoSeleccionado(asiento.numero);
                        setModalOpen(true);
                      }
                    }}
                    disabled={asiento.ocupado || asiento.numero === 1 || !ventaAbierta}
                  >
                    {asiento.numero}
                    {asiento.numero === 1 && " (Chofer)"}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Venta de Pasaje - Asiento {asientoSeleccionado}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Pasajero</Label>
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
              <Label>Hora</Label>
              <Input
                type="time"
                value={boleto.hora}
                onChange={(e) => setBoleto((prev) => ({ ...prev, hora: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Precio</Label>
              <Input
                type="number"
                value={boleto.precio || ""}
                onChange={(e) => setBoleto((prev) => ({ ...prev, precio: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label>Encomienda (opcional)</Label>
              <Input
                value={boleto.encomienda}
                onChange={(e) => setBoleto((prev) => ({ ...prev, encomienda: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ticket de Venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border p-4 font-mono text-sm dialog-content">
              <div className="text-center border-b pb-2">
                <p className="font-bold">TICKET DE VIAJE</p>
                <p>Fecha: {new Date("2025-01-26 17:25:10").toLocaleDateString()}</p>
              </div>
              {boletoActual && (
                <div className="space-y-1 mt-2">
                  <p>Vehículo: {vehiculos.find(v => v.id === boletoActual.vehiculo)?.placa}</p>
                  <p>Destino: {boletoActual.destino}</p>
                  <p>Asiento: {boletoActual.asiento}</p>
                  <p>Pasajero: {boletoActual.pasajero}</p>
                  <p>CI: {boletoActual.ci}</p>
                  <p>Hora: {boletoActual.hora}</p>
                  <p>Precio: Bs. {boletoActual.precio.toFixed(2)}</p>
                  {boletoActual.encomienda && <p>Encomienda: {boletoActual.encomienda}</p>}
                </div>
              )}
              <div className="text-center border-t pt-2 mt-2">
                <p>¡Gracias por su preferencia!</p>
                <p>Usuario: clehider</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTicketModalOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={imprimirTicket}>Imprimir</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={configuracionModalOpen} onOpenChange={setConfiguracionModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Configuración</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="destinos">
            <TabsList>
              <TabsTrigger value="destinos">Destinos</TabsTrigger>
              <TabsTrigger value="ventas">Ventas del Día</TabsTrigger>
            </TabsList>
            <TabsContent value="destinos" className="space-y-4">
              <form onSubmit={agregarDestino} className="flex gap-2">
                <Input
                  value={nuevoDestino}
                  onChange={(e) => setNuevoDestino(e.target.value)}
                  placeholder="Nuevo destino"
                />
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </form>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destino</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {destinos.map((destino) => (
                    <TableRow key={destino}>
                      <TableCell>{destino}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => eliminarDestino(destino)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="ventas">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Pasajero</TableHead>
                    <TableHead>Asiento</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boletosDelDia.map((boleto) => (
                    <TableRow key={boleto.id}>
                      <TableCell>
                        {vehiculos.find((v) => v.id === boleto.vehiculo)?.placa}
                      </TableCell>
                      <TableCell>{boleto.destino}</TableCell>
                      <TableCell>{boleto.pasajero}</TableCell>
                      <TableCell>{boleto.asiento}</TableCell>
                      <TableCell>{boleto.hora}</TableCell>
                      <TableCell>Bs. {boleto.precio.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VentaPasajes;
