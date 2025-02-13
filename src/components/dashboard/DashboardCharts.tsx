import {                                                            Box,                                                              SimpleGrid,
  Heading,                                                          Select,                                                           HStack,                                                         } from '@chakra-ui/react';
import {                                                            BarChart,                                                         Bar,                                                              XAxis,
  YAxis,                                                            Tooltip,                                                          Legend,                                                           PieChart,
  Pie,                                                              Cell,                                                             ResponsiveContainer,                                            } from 'recharts';
import { useState, useEffect } from 'react';                                                                                        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];      
interface EstadisticasTickets {                                     porEstado: { name: string; value: number }[];                     porPrioridad: { name: string; value: number }[];
  porFecha: { fecha: string; total: number }[];                   }                                                                                                                                   export default function DashboardCharts() {
  const [periodo, setPeriodo] = useState('7dias');                  const [estadisticas, setEstadisticas] = useState<EstadisticasTickets>({                                                               porEstado: [],
    porPrioridad: [],                                                 porFecha: [],                                                   });                                                             
  const cargarEstadisticas = async () => {                            // Implementar carga de estadísticas desde Firebase             };                                                              
  useEffect(() => {                                                   cargarEstadisticas();                                           }, [periodo]);                                                  
  return (                                                            <Box p={4}>                                                         <HStack justify="space-between" mb={6}>                             <Heading size="md">Estadísticas de Tickets</Heading>
        <Select                                                             width="200px"                                                     value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}                    >                                                                   <option value="7dias">Últimos 7 días</option>
          <option value="30dias">Últimos 30 días</option>                   <option value="90dias">Últimos 90 días</option>                 </Select>
      </HStack>                                                                                                                           <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>               <Box bg="white" p={4} borderRadius="lg" shadow="sm">
          <Heading size="sm" mb={4}>Tickets por Estado</Heading>            <ResponsiveContainer width="100%" height={300}>                     <PieChart>                                                          <Pie
                data={estadisticas.porEstado}                                     cx="50%"                                                          cy="50%"
                labelLine={false}                                                 outerRadius={80}                                                  fill="#8884d8"                                                    dataKey="value"
                label={({ name, percent }) =>                                       `${name} ${(percent * 100).toFixed(0)}%`                        }                                                               >
                {estadisticas.porEstado.map((entry, index) => (                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />                                                               ))}
              </Pie>                                                            <Tooltip />                                                       <Legend />
            </PieChart>                                                     </ResponsiveContainer>                                          </Box>
                                                                          <Box bg="white" p={4} borderRadius="lg" shadow="sm">                <Heading size="sm" mb={4}>Tickets por Día</Heading>               <ResponsiveContainer width="100%" height={300}>
            <BarChart data={estadisticas.porFecha}>                             <XAxis dataKey="fecha" />                                         <YAxis />                                                         <Tooltip />
              <Legend />                                                        <Bar dataKey="total" fill="#8884d8" />                          </BarChart>
          </ResponsiveContainer>                                          </Box>                                                          </SimpleGrid>                                                   </Box>
  );                                                              }
