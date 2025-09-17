import React from 'react';
import { Button } from '../ui/button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportarPrestacaoPDFProps {
  elementId: string;
  fileName?: string;
  prestacaoData?: {
    id: number;
    mes: string;
    ano: string;
    tipo: string;
  };
  className?: string;
}

export const ExportarPrestacaoPDF: React.FC<ExportarPrestacaoPDFProps> = ({
  elementId,
  fileName,
  prestacaoData,
  className = ""
}) => {
  const handleExportPDF = async () => {
    try {
      // Verificar se as bibliotecas estão disponíveis
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const element = document.getElementById(elementId);
      if (!element) {
        toast.error('Elemento não encontrado para exportação');
        return;
      }

      toast.info('Gerando PDF...', { duration: 2000 });

      // Configurações para melhor qualidade
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Calcular dimensões para o PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Primeira página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Nome do arquivo
      const defaultFileName = prestacaoData
        ? `prestacao-${prestacaoData.id}-${prestacaoData.mes}-${prestacaoData.ano}-${prestacaoData.tipo}.pdf`
        : `prestacao-contas-${new Date().toISOString().split('T')[0]}.pdf`;

      const finalFileName = fileName || defaultFileName;

      // Salvar o PDF
      pdf.save(finalFileName);

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Verifique se as dependências estão instaladas.');
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      variant="outline"
      className={`flex items-center space-x-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>Exportar PDF</span>
    </Button>
  );
};

export default ExportarPrestacaoPDF;