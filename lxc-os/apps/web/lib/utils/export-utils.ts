
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ExportUtils = {
  /**
   * Export JSON data to CSV
   */
  exportToCSV(data: any[], fileName: string) {
    if (!data || data.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export JSON data to Excel (.xlsx)
   */
  exportToExcel(data: any[], fileName: string, sheetName: string = "Report") {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  },

  /**
   * Export data to PDF with professional formatting
   */
  exportToPDF(
    title: string,
    columns: { header: string; dataKey: string }[],
    data: any[],
    fileName: string,
    schoolName: string = "LearnXChain Academy"
  ) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text(schoolName, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report: ${title}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
    
    // Line
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 42, 196, 42);

    autoTable(doc, {
      startY: 48,
      head: [columns.map(c => c.header)],
      body: data.map(item => columns.map(c => item[c.dataKey])),
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 10,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      margin: { top: 48 },
      theme: "striped",
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`${fileName}.pdf`);
  }
};
