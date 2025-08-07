import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function ExportarPdfButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="flex gap-2">
      <FileText className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
