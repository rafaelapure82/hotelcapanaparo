export const generateInvoicePDF = async (booking: any, suite: any, exchangeRate: number, officialInvoice?: any) => {
  if (typeof window === 'undefined') return;
  // Dynamic import to avoid SSR errors with jsPDF
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
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
  if (officialInvoice) {
    doc.text(`FACTURA DIGITAL: #${officialInvoice.number}`, 20, 55);
  } else {
    doc.text(`RESERVACIÓN: #${booking.id.toString().padStart(6, '0')}`, 20, 55);
  }
  doc.setFontSize(10);
  doc.text(`Fecha de Emisión: ${new Date(officialInvoice?.createdAt || undefined).toLocaleDateString()}`, 150, 55);

  // Customer Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 20, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`${booking.firstName} ${booking.lastName}`, 20, 75);
  doc.text(booking.email, 20, 80);
  doc.text(booking.phone, 20, 85);

  // Booking Details Table
  const totalUSD = officialInvoice?.amountUSD || booking.total;
  const currentRate = officialInvoice?.exchangeRate || exchangeRate;
  const totalVES = officialInvoice?.amountVES || (totalUSD * currentRate);

  autoTable(doc, {
    startY: 95,
    head: [['Descripción', 'Tasa Ref.', 'Monto ($)', 'Monto (Bs)']],
    body: [
      [
        `${suite?.title || 'Estadía Suite'}\nDesde: ${new Date(booking.startDate).toLocaleDateString()} al ${new Date(booking.endDate).toLocaleDateString()}`,
        `${currentRate.toFixed(2)} Bs/$`,
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
  doc.text('TOTAL PAGADO:', 130, finalY + 10);
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
  doc.setTextColor(22, 101, 52); // Success green for invoices
  doc.text('CONFIRMADO / PAGADO', 20, finalY + 18);

  // Save
  const fileName = officialInvoice ? `Factura_${officialInvoice.number}.pdf` : `Reserva_${booking.id}.pdf`;
  doc.save(fileName);
};

export const generateInventoryReport = async (items: any[]) => {
  if (typeof window === 'undefined') return;
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF() as any;
  
  doc.setFontSize(20);
  doc.setTextColor(46, 196, 182);
  doc.text('ESTADO DE INVENTARIO - HOTEL CAPANAPARO', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

  autoTable(doc, {
    startY: 40,
    head: [['SKU', 'Artículo', 'Categoría', 'Proveedor', 'Precio Costo', 'Existencia', 'Estado']],
    body: items.map(p => [
      p.sku,
      p.item,
      p.category?.name || 'Suministro',
      p.supplier || 'N/A',
      `$${(p.costPrice || 0).toFixed(2)}`,
      `${p.quantity} ${p.unit}`,
      p.status.toUpperCase()
    ]),
    headStyles: { fillColor: [46, 196, 182], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 255, 255] },
  });

  doc.save(`Reporte_Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateBIReport = async (data: any, timeframe: string) => {
  if (typeof window === 'undefined') return;
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF() as any;

  // Header and Branding
  doc.setFontSize(22);
  doc.setTextColor(46, 196, 182);
  doc.text('REPORTE BI ESTRATÉGICO', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Hotel Capanaparo Suites | Periodo: ${timeframe.toUpperCase()}`, 105, 28, { align: 'center' });
  doc.text(`Fecha de Generación: ${new Date().toLocaleString()}`, 105, 33, { align: 'center' });

  // 1. Projections Summary Table
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Resumen de Proyecciones de Ingresos', 20, 45);

  autoTable(doc, {
    startY: 50,
    head: [['Periodo', 'Proyección de Ingresos ($)', 'Estatus Salud']],
    body: [
      ['Semanal', `$${(data.projections.weekly[0]?.total || 0).toFixed(2)}`, 'ÓPTIMO'],
      ['Mensual', `$${(data.projections.monthly[0]?.total || 0).toFixed(2)}`, 'ESTABLE'],
      ['Anual', `$${(data.projections.yearly[0]?.total || 0).toFixed(2)}`, 'PROYECTADO'],
    ],
    headStyles: { fillColor: [46, 196, 182], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 255, 255] },
  });

  // 2. Profitability Details
  const finalY1 = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Índice de Rentabilidad por Categoría', 20, finalY1);

  autoTable(doc, {
    startY: finalY1 + 5,
    head: [['Categoría', 'Ingresos ($)', 'Costos ($)', 'Margen (%)']],
    body: data.profitability.map((p: any) => [
      p.name,
      `$${p.ingresos.toFixed(2)}`,
      `$${p.costos.toFixed(2)}`,
      `${p.margen.toFixed(1)}%`
    ]),
    headStyles: { fillColor: [255, 159, 28], textColor: 255 }, // Accent color
  });

  // 3. Operational Pulse
  const finalY2 = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Pulso Operativo y Eficiencia', 20, finalY2);
  
  doc.setFontSize(11);
  doc.text(`Eficiencia Global: ${data.operational.efficiencyScore}`, 20, finalY2 + 10);
  doc.text(`Tiempo Promedio de Limpieza: ${data.operational.avgCleaningTime} min`, 20, finalY2 + 18);
  doc.text(`Tareas Completadas (Hoy): ${data.operational.tasksCompleted}`, 20, finalY2 + 26);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('Confidencial - Propiedad de Hotel Capanaparo Suites. Producido por Motor BI "God-Level".', 105, 285, { align: 'center' });

  doc.save(`Reporte_BI_${timeframe}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportInventoryToExcel = async (items: any[]) => {
  if (typeof window === 'undefined') return;
  const { utils, writeFile } = await import('xlsx');
  
  const data = items.map(item => ({
    SKU: item.sku,
    Artículo: item.item,
    Categoría: item.category?.name || 'Suministro',
    Proveedor: item.supplier || 'N/A',
    Existencia: item.quantity,
    Unidad: item.unit,
    Precio_Costo_USD: item.costPrice,
    Valor_Total_Inver_USD: (item.quantity * item.costPrice).toFixed(2),
    Estado: item.status.toUpperCase(),
    Ultima_Actualizacion: new Date(item.updatedAt).toLocaleString()
  }));

  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Inventario');

  writeFile(workbook, `Inventario_Hotel_${new Date().toISOString().split('T')[0]}.xlsx`);
};
