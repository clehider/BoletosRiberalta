import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ReporteDiario } from '@/types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generarReportePDF = (reporte: ReporteDiario) => {
  const doc = new jsPDF();
  const fecha = reporte.fechaGeneracion;

  // Título
  doc.setFontSize(20);
  doc.text('Reporte Diario de Ventas', 105, 15, { align: 'center' });
  
  // Información general
  doc.setFontSize(12);
  doc.text(`Fecha: ${fecha}`, 20, 30);
  doc.text(`Total Ventas: ${reporte.totalVentas}`, 20, 40);
  doc.text(`Total Monto: S/. ${reporte.totalMonto.toFixed(2)}`, 20, 50);
  doc.text(`Usuario: ${reporte.usuario}`, 20, 60);
  doc.text(`Hora Apertura: ${reporte.horaApertura}`, 20, 70);
  doc.text(`Hora Cierre: ${reporte.horaCierre}`, 20, 80);

  // Tabla de boletos
  doc.autoTable({
    startY: 90,
    head: [['Vehículo', 'Destino', 'Asiento', 'Pasajero', 'CI', 'Hora', 'Precio']],
    body: reporte.boletos.map(boleto => [
      boleto.vehiculo,
      boleto.destino,
      boleto.asiento,
      boleto.pasajero,
      boleto.ci,
      boleto.hora,
      `S/. ${boleto.precio.toFixed(2)}`
    ]),
  });

  // Resumen por vehículo
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.text('Resumen por Vehículo:', 20, finalY + 10);
  const vehiculosData = Object.entries(reporte.vehiculos).map(([vehiculo, total]) => [
    vehiculo,
    `S/. ${total.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: finalY + 15,
    head: [['Vehículo', 'Total']],
    body: vehiculosData,
  });

  // Resumen por destino
  const destinosData = Object.entries(reporte.destinos).map(([destino, total]) => [
    destino,
    `S/. ${total.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Destino', 'Total']],
    body: destinosData,
  });

  // Guardar PDF
  doc.save(`reporte-${fecha}.pdf`);
};
