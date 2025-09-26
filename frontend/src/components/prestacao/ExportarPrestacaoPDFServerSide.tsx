import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Download, Loader2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';

interface ExportarPrestacaoPDFServerSideProps {
  prestacaoId: number;
  className?: string;
  variant?: 'default' | 'outline';
}

export const ExportarPrestacaoPDFServerSide: React.FC<ExportarPrestacaoPDFServerSideProps> = ({
  prestacaoId,
  className = "",
  variant = "outline"
}) => {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const handlePreview = async () => {
    try {
      setLoading(true);

      // Buscar o HTML personalizado da COBIMOB populado com dados reais
      const response = await fetch(`/api/prestacao-contas/${prestacaoId}/pdf?preview=html`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();

      // Abrir em nova página com o HTML exato da COBIMOB
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.document.title = `Prestação de Contas - PC-${String(prestacaoId).padStart(3, '0')}`;
      }

    } catch (error) {
      console.error('Erro ao carregar preview:', error);
      toast.error('Erro ao carregar preview do PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      toast.info('Gerando PDF...', { duration: 2000 });

      const response = await fetch(`/api/prestacao-contas/${prestacaoId}/pdf`);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Converter resposta para blob
      const blob = await response.blob();

      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prestacao-${prestacaoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF gerado com sucesso!');

    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value: number) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewData(null);
  };

  return (
    <>
      {/* Só o botão Preview - salva direto na nova página */}
      <Button
        onClick={handlePreview}
        variant={variant}
        disabled={loading}
        className={`flex items-center space-x-2 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        <span>Visualizar PDF</span>
      </Button>

    </>
  );
};

export default ExportarPrestacaoPDFServerSide;