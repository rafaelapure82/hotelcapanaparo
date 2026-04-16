export const generateInvoicePDF = async (booking: any, suite: any, exchangeRate: number) => {
  // Dynamic import to avoid SSR errors with jsPDF
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  
  const doc = new jsPDF() as any;
  const companyLogo = '🏨';


  // Header
  doc.setFontSize(22);
  doc.setTextColor(46, 196, 182); // --primary
  doc.text('HOTEL CAPANAPARO SUITES', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('RIF: J-29934822-1 | Urb. El Recreo, San Fernando de Apure', 105, 28, { align: 'center' });
  doc.text('Contacto: +58 412-1234567 | hotelcapanaparo.com', 105, 33, { align: 'center' });

  doc.setDrawColor(200);
  doc.line(20, 40, 190, 40);

  // Invoice Meta
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(`RESERVACIÓN: #${booking.id.toString().padStart(6, '0')}`, 20, 55);
  doc.setFontSize(10);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 150, 55);

  // Customer Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.firstName} ${booking.lastName}`, 20, 75);
  doc.text(booking.email, 20, 80);
  doc.text(booking.phone, 20, 85);

  // Booking Details Table
  const totalUSD = booking.total;
  const totalVES = totalUSD * exchangeRate;

  doc.autoTable({
    startY: 95,
    head: [['Descripción', 'Unidad', 'Precio Unit.', 'Subtotal ($)', 'Subtotal (Bs)']],
    body: [
      [
        `${suite.title}\nEstadía: ${new Date(booking.startDate).toLocaleDateString()} al ${new Date(booking.endDate).toLocaleDateString()}`,
        'Semanas/Días',
        `$${suite.basePrice}`,
        `$${totalUSD.toFixed(2)}`,
        `${totalVES.toLocaleString('es-VE')} Bs.`
      ]
    ],
    headStyles: { fillColor: [46, 196, 182], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 50 },
    alternateRowStyles: { fillColor: [245, 255, 255] },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', 130, finalY + 10);
  doc.setFontSize(16);
  doc.setTextColor(255, 159, 28); // accent color
  doc.text(`$${totalUSD.toFixed(2)}`, 130, finalY + 20);
  doc.setFontSize(11);
  doc.setTextColor(46, 196, 182);
  doc.text(`${totalVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs.`, 130, finalY + 28);

  // Footer / Status
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text('Estado de Pago:', 20, finalY + 10);
  doc.setFontSize(12);
  doc.setTextColor(booking.status === 'confirmed' ? [22, 101, 52] : [146, 64, 14]);
  doc.text(booking.status.toUpperCase(), 20, finalY + 18);

  // Save
  doc.save(`Factura_Capanaparo_${booking.id}.pdf`);
};

export const generateInventoryReport = async (properties: any[]) => {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  const doc = new jsPDF() as any;
  
  doc.setFontSize(20);

  doc.text('REPORTE DE INVENTARIO Y DISPONIBILIDAD', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

  doc.autoTable({
    startY: 40,
    head: [['Propiedad', 'Categoría', 'Precio', 'Vistas', 'Estado']],
    body: properties.map(p => [
      p.title,
      p.homeType || 'Suite',
      `$${p.basePrice}`,
      p.viewCount,
      p.status === 'publish' ? 'Activo' : 'Mantenimiento'
    ]),
    headStyles: { fillColor: [2, 43, 58], textColor: 255 },
  });

  doc.save(`Reporte_Inventario_${Date.now()}.pdf`);
};
