import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { initializeData } from '../firebase/initData';

interface Boleto {
  id: string;
  vehiculo: string;
  origen: string;
  destino: string;
  fecha: Timestamp;
  hora: string;
  precio: number;
  pasajero: string;
  ci: string;
  asiento: string;
  encomienda: string;
}

interface Vehiculo {
  id: string;
  tipo: 'Bus' | 'Noah';
  placa: string;
}

interface Asiento {
  id: string;
  nombre: string;
  ocupado: boolean;
}

const VentaPasajes: React.FC = () => {
  const [boleto, setBoleto] = useState<Omit<Boleto, 'id'>>({
    vehiculo: '',
    origen: '',
    destino: '',
    fecha: Timestamp.now(),
    hora: '',
    precio: 0,
    pasajero: '',
    ci: '',
    asiento: '',
    encomienda: '',
  });
  
  const [destinos, setDestinos] = useState<string[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Inicializar datos si es necesario
        await initializeData();

        // Cargar destinos
        const destinosSnapshot = await getDocs(collection(db, 'destinos'));
        const destinosList = destinosSnapshot.docs.map(doc => doc.data().nombre);
        setDestinos(destinosList);
        console.log('Destinos cargados:', destinosList);

        // Cargar vehículos
        const vehiculosSnapshot = await getDocs(query(collection(db, 'vehiculos'), where('disponible', '==', true)));
        const vehiculosList = vehiculosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vehiculo));
        setVehiculos(vehiculosList);
        console.log('Vehículos cargados:', vehiculosList);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (boleto.vehiculo) {
      const vehiculoSeleccionado = vehiculos.find(v => v.id === boleto.vehiculo);
      if (vehiculoSeleccionado) {
        const asientosTotal = vehiculoSeleccionado.tipo === 'Bus' ? 7 : 15;
        const nuevosAsientos = Array.from({ length: asientosTotal }, (_, i) => ({
          id: (i + 1).toString(),
          nombre: i === 0 ? 'Conductor' : `Asiento ${i + 1}`,
          ocupado: i === 0
        }));
        setAsientos(nuevosAsientos);
        console.log('Asientos generados:', nuevosAsientos);
      }
    }
  }, [boleto.vehiculo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBoleto(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    console.log(`Cambiando ${name} a:`, value);
    setBoleto(prev => ({ ...prev, [name]: value }));
  };

  const handleAsientoClick = (asiento: Asiento) => {
    if (!asiento.ocupado && asiento.nombre !== 'Conductor') {
      setAsientoSeleccionado(asiento.id);
      setModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'boletos'), {
        ...boleto,
        asiento: asientoSeleccionado,
        fecha: Timestamp.fromDate(new Date(boleto.fecha.toDate().toDateString())),
      });
      console.log('Boleto guardado con ID:', docRef.id);
      setAsientos(prev => prev.map(a => 
        a.id === asientoSeleccionado ? { ...a, ocupado: true } : a
      ));
      setTicketModalOpen(true);
    } catch (error) {
      console.error('Error al vender el boleto:', error);
      alert('Error al vender el boleto');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Cargando datos...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Venta de Pasajes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="vehiculo">Vehículo</Label>
              <Select 
                value={boleto.vehiculo} 
                onValueChange={handleSelectChange('vehiculo')}
              >
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
                <Label htmlFor="origen">Origen</Label>
                <Select 
                  value={boleto.origen} 
                  onValueChange={handleSelectChange('origen')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinos.map((destino, index) => (
                      <SelectItem key={index} value={destino}>
                        {destino}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="destino">Destino</Label>
                <Select 
                  value={boleto.destino} 
                  onValueChange={handleSelectChange('destino')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinos.map((destino, index) => (
                      <SelectItem key={index} value={destino}>
                        {destino}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  type="date"
                  name="fecha"
                  value={boleto.fecha.toDate().toISOString().split('T')[0]}
                  onChange={(e) => setBoleto(prev => ({
                    ...prev,
                    fecha: Timestamp.fromDate(new Date(e.target.value))
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hora">Hora</Label>
                <Input
                  type="time"
                  name="hora"
                  value={boleto.hora}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="precio">Precio</Label>
              <Input
                type="number"
                name="precio"
                value={boleto.precio}
                onChange={handleInputChange}
                required
              />
            </div>

            {boleto.vehiculo && (
              <div>
                <Label>Selección de Asiento</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {asientos.map((asiento) => (
                    <Button
                      key={asiento.id}
                      type="button"
                      onClick={() => handleAsientoClick(asiento)}
                      variant={asiento.ocupado ? "destructive" : asientoSeleccionado === asiento.id ? "default" : "outline"}
                      disabled={asiento.ocupado || asiento.nombre === 'Conductor'}
                      className="h-16"
                    >
                      {asiento.nombre}
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
                <Label htmlFor="pasajero">Nombre del Pasajero</Label>
                <Input
                  type="text"
                  name="pasajero"
                  value={boleto.pasajero}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ci">CI del Pasajero</Label>
                <Input
                  type="text"
                  name="ci"
                  value={boleto.ci}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="encomienda">Encomienda</Label>
                <Input
                  type="text"
                  name="encomienda"
                  value={boleto.encomienda}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit">Vender Boleto</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ticket de Venta</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p><strong>Vehículo:</strong> {vehiculos.find(v => v.id === boleto.vehiculo)?.placa}</p>
              <p><strong>Origen:</strong> {boleto.origen}</p>
              <p><strong>Destino:</strong> {boleto.destino}</p>
              <p><strong>Fecha:</strong> {boleto.fecha.toDate().toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {boleto.hora}</p>
              <p><strong>Precio:</strong> {boleto.precio}</p>
              <p><strong>Pasajero:</strong> {boleto.pasajero}</p>
              <p><strong>CI:</strong> {boleto.ci}</p>
              <p><strong>Asiento:</strong> {asientoSeleccionado}</p>
              <p><strong>Encomienda:</strong> {boleto.encomienda || 'N/A'}</p>
            </div>
            <Button onClick={() => {
              console.log('Imprimiendo boleto...');
              setTicketModalOpen(false);
              setModalOpen(false);
              setBoleto({
                vehiculo: '',
                origen: '',
                destino: '',
                fecha: Timestamp.now(),
                hora: '',
                precio: 0,
                pasajero: '',
                ci: '',
                asiento: '',
                encomienda: '',
              });
              setAsientoSeleccionado('');
            }}>
              Imprimir Ticket
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VentaPasajes;
