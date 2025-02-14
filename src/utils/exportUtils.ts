import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "jspdf-autotable";

export const exportarCSV = (headerNames: string[], filteredDatos: any[], fields: string[], entidad: string) => {
  const csvContent = [
    headerNames.join(","),
    ...filteredDatos.map((item) =>
      fields
        .map((field) => {
          const valor = item[field];
          const valorString = typeof valor === "string" ? valor : String(valor);
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

export const exportarPDF = (headerNames: string[], filteredDatos: any[], fields: string[], entidad: string) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text(`Reporte de ${entidad}`, 14, 20);

  // Datos de la tabla
  const tableData = filteredDatos.map((item) =>
    fields.map((field) => item[field])
  );

  // Encabezados
  const tableHeaders = headerNames;

  // Crear la tabla
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 30,
    styles: { fontSize: 6 },
  });

  // Guardar el archivo
  doc.save(`${entidad}.pdf`);
};
