import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportarExcelButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick} className="flex gap-2">
      <Download className="h-4 w-4" />
      Exportar Excel
    </Button>
  );
}
