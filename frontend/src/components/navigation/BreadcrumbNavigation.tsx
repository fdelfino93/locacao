import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface BreadcrumbItem {
  tipo: string;
  id: number;
  nome: string;
  onClick?: () => void;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  onVoltar?: () => void;
  podeVoltar?: boolean;
  className?: string;
}

const getEntityIcon = (tipo: string) => {
  const iconMap = {
    'locadores': '👤',
    'locatarios': '🏠',
    'imoveis': '🏢',
    'contratos': '📄'
  };
  return iconMap[tipo] || '📄';
};

const getEntityLabel = (tipo: string) => {
  const labelMap = {
    'locadores': 'Locador',
    'locatarios': 'Locatário', 
    'imoveis': 'Imóvel',
    'contratos': 'Contrato'
  };
  return labelMap[tipo] || tipo;
};

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  items,
  onVoltar,
  podeVoltar = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 py-3 px-4 bg-muted/30 rounded-lg border ${className}`}>
      {/* Botão Voltar */}
      {podeVoltar && onVoltar && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onVoltar}
          className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Button>
      )}

      {/* Home */}
      <button
        onClick={() => items[0]?.onClick?.()}
        className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm">Busca</span>
      </button>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <React.Fragment key={`${item.tipo}-${item.id}`}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          
          <button
            onClick={item.onClick}
            className={`flex items-center space-x-2 text-sm transition-colors ${
              index === items.length - 1 
                ? 'text-foreground font-medium cursor-default' 
                : 'text-muted-foreground hover:text-foreground cursor-pointer'
            }`}
            disabled={index === items.length - 1}
          >
            <span className="text-xs">{getEntityIcon(item.tipo)}</span>
            <span>{getEntityLabel(item.tipo)}</span>
            <span className="font-medium">{item.nome}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};