import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, FlaskConical } from "lucide-react";
import { PropertyResult } from "./PropertyResultsTable";
import { useNavigate } from "react-router-dom";

interface ExportActionsProps {
  results: PropertyResult[];
  selectedIds: string[];
}

export function ExportActions({
  results,
  selectedIds,
}: ExportActionsProps) {
  const navigate = useNavigate();
  const selectedResults = results.filter((r) => selectedIds.includes(r.id));
  const exportData = selectedIds.length > 0 ? selectedResults : results;

  const exportToCSV = () => {
    const headers = ["Property Name", "Location", "Price (HKD)", "Size (sqft)", "Bedrooms", "Key Features"];
    const rows = exportData.map((p) => [
      p.name,
      p.location,
      p.price.toString(),
      p.size.toString(),
      p.bedrooms,
      p.features.join("; "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "keynest-properties.csv";
    link.click();
  };

  const exportToPDF = () => {
    // For now, we'll create a simple HTML-based print view
    // In production, you'd use a library like jsPDF or react-pdf
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Keynest AI - Property Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #5c4033; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f5f0e8; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .price { font-weight: bold; color: #5c4033; }
          .feature { display: inline-block; background: #e8e0d5; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin: 2px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Keynest AI Property Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Property Name</th>
              <th>Location</th>
              <th>Price (HKD)</th>
              <th>Size (sqft)</th>
              <th>Bedrooms</th>
              <th>Key Features</th>
            </tr>
          </thead>
          <tbody>
            ${exportData
              .map(
                (p) => `
              <tr>
                <td>${p.name}</td>
                <td>${p.location}</td>
                <td class="price">HK$${(p.price / 1000000).toFixed(1)}M</td>
                <td>${p.size.toLocaleString()}</td>
                <td>${p.bedrooms}</td>
                <td>${p.features.map((f) => `<span class="feature">${f}</span>`).join(" ")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportToResearchCanvas = () => {
    const dataToExport = selectedIds.length > 0 ? selectedResults : results.slice(0, 4);
    // Store in localStorage for cross-page access
    localStorage.setItem('keynest_canvas_import', JSON.stringify(dataToExport));
    navigate('/research-canvas');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-xs"
        onClick={exportToCSV}
        disabled={results.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export to CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-xs"
        onClick={exportToPDF}
        disabled={results.length === 0}
      >
        <FileText className="h-4 w-4" />
        Export to PDF
      </Button>
      <Button
        variant="default"
        size="sm"
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
        onClick={handleExportToResearchCanvas}
        disabled={results.length === 0}
      >
        <FlaskConical className="h-4 w-4" />
        Export to Research Canvas
        {selectedIds.length > 0 && (
          <span className="ml-1 rounded-full bg-accent-foreground/20 px-1.5 text-xs">
            {selectedIds.length}
          </span>
        )}
      </Button>
    </div>
  );
}
