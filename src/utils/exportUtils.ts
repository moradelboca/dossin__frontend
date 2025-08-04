import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";
import html2canvas from "html2canvas";

// Helper para acceder a campos anidados
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

export const exportarCSV = (headerNames: string[], filteredDatos: any[], fields: string[], entidad: string) => {
  const csvContent = [
    headerNames.join(","),
    ...filteredDatos.map((item) =>
      fields
        .map((field) => {
          const valor = getNestedValue(item, field);
          const valorString = typeof valor === "string" ? valor : String(valor ?? '');
          return `"${valorString.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${entidad}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportarImagen = async (headerNames: string[], filteredDatos: any[], fields: string[], entidad: string, cargoData?: any) => {
  // Crear un elemento temporal para renderizar el contenido
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '1200px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.padding = '20px';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  // Generar nombre de archivo descriptivo
  let filename = entidad;
  if (cargoData) {
    const fecha = new Date().toISOString().split('T')[0];
    const origen = cargoData.ubicacionCarga?.nombre || 'N/A';
    const destino = cargoData.ubicacionDescarga?.nombre || 'N/A';
    const grano = cargoData.cargamento?.nombre || 'N/A';
    
    const cleanOrigen = origen.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const cleanDestino = destino.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const cleanGrano = grano.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    filename = `turnos_${fecha}_${cleanOrigen}_a_${cleanDestino}_${cleanGrano}`;
  }

  // Crear el contenido HTML
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="font-size: 24px; margin-bottom: 20px; color: #163660;">Reporte de ${entidad}</h1>
  `;

  // Información de la carga
  if (cargoData) {
    htmlContent += `
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; margin-bottom: 10px; color: #163660; font-weight: bold;">Información de Carga y Contrato</h2>
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>Ubicación de Carga:</strong> ${cargoData.ubicacionCarga?.nombre || 'N/A'} - ${cargoData.ubicacionCarga?.localidad?.provincia?.nombre || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Ubicación de Descarga:</strong> ${cargoData.ubicacionDescarga?.nombre || 'N/A'} - ${cargoData.ubicacionDescarga?.localidad?.provincia?.nombre || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Cargamento:</strong> ${cargoData.cargamento?.nombre || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Tarifa:</strong> $${cargoData.tarifa || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Tipo Tarifa:</strong> ${cargoData.tipoTarifa?.nombre || 'N/A'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Kilómetros:</strong> ${cargoData.cantidadKm || 'N/A'} km</p>
        </div>
      </div>
    `;
  }

  // Tabla de datos
  htmlContent += `
    <div style="margin-top: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background-color: #163660; color: white;">
  `;

  headerNames.forEach(header => {
    htmlContent += `<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${header}</th>`;
  });

  htmlContent += `
          </tr>
        </thead>
        <tbody>
  `;

  filteredDatos.forEach((item, index) => {
    htmlContent += `<tr style="background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};">`;
    fields.forEach(field => {
      const value = getNestedValue(item, field);
      htmlContent += `<td style="padding: 6px; border: 1px solid #ddd;">${value || ''}</td>`;
    });
    htmlContent += `</tr>`;
  });

  htmlContent += `
        </tbody>
      </table>
    </div>
  </div>
  `;

  tempDiv.innerHTML = htmlContent;
  document.body.appendChild(tempDiv);

  try {
    // Convertir a imagen
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2, // Mejor calidad
      width: 1200,
      height: tempDiv.scrollHeight,
      useCORS: true,
      allowTaint: true
    });

    // Convertir a blob y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Error al generar imagen:', error);
  } finally {
    // Limpiar el elemento temporal
    document.body.removeChild(tempDiv);
  }
};

/**
 * Exporta datos a PDF con información adicional de carga
 * @param headerNames - Nombres de las columnas del encabezado
 * @param filteredDatos - Datos filtrados a exportar
 * @param fields - Campos de los datos
 * @param entidad - Nombre de la entidad
 * @param cargoData - Datos opcionales de la carga (para turnos)
 */
export const exportarPDF = (
  headerNames: string[], 
  filteredDatos: any[], 
  fields: string[], 
  entidad: string,
  cargoData?: any
) => {
  const doc = new jsPDF({ orientation: "landscape" });

  let currentY = 20;

  // Título principal
  doc.setFontSize(18);
  doc.text(`Reporte de ${entidad}`, 14, currentY);
  currentY += 15;

  // Información de la carga (si está disponible)
  if (cargoData) {
    doc.setFontSize(12);
    doc.setFont("helvetica", 'bold');
    doc.text("Información de Carga y Contrato", 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", 'normal');

    // Datos de la carga
    const cargoInfo = [
      `Ubicación de Carga: ${cargoData.ubicacionCarga?.nombre || 'N/A'} - ${cargoData.ubicacionCarga?.localidad?.provincia?.nombre || 'N/A'}`,
      `Ubicación de Descarga: ${cargoData.ubicacionDescarga?.nombre || 'N/A'} - ${cargoData.ubicacionDescarga?.localidad?.provincia?.nombre || 'N/A'}`,
      `Cargamento: ${cargoData.cargamento?.nombre || 'N/A'}`,
      `Tarifa: $${cargoData.tarifa || 'N/A'}`,
      `Tipo Tarifa: ${cargoData.tipoTarifa?.nombre || 'N/A'}`,
      `Kilómetros: ${cargoData.cantidadKm || 'N/A'} km`,
    ];

    cargoInfo.forEach((info) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(info, 14, currentY);
      currentY += 5;
    });

    currentY += 10;
  }

  // Datos de la tabla
  const tableData = filteredDatos.map((item) =>
    fields.map((field) => getNestedValue(item, field))
  );

  // Encabezados
  const tableHeaders = headerNames;

  // Crear la tabla
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: currentY,
    styles: { fontSize: 6 },
  });

  // Generar nombre de archivo descriptivo
  let filename = entidad;
  
  if (cargoData) {
    const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const origen = cargoData.ubicacionCarga?.nombre || 'N/A';
    const destino = cargoData.ubicacionDescarga?.nombre || 'N/A';
    const grano = cargoData.cargamento?.nombre || 'N/A';
    
    // Limpiar caracteres especiales para el nombre de archivo
    const cleanOrigen = origen.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const cleanDestino = destino.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const cleanGrano = grano.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    
    filename = `turnos_${fecha}_${cleanOrigen}_a_${cleanDestino}_${cleanGrano}`;
  }

  // Guardar el archivo
  doc.save(`${filename}.pdf`);
};
