import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown,
  Home, 
  Users, 
  FileText, 
  User,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Building,
  Eye,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface EnhancedSmartCardProps {
  tipo: 'locador' | 'locatario' | 'imovel' | 'contrato';
  dados: any;
  onClick?: () => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
  showFullDetails?: boolean;
  onViewDetails?: () => void;
  historico?: any[];
  vinculos?: any;
  estatisticas?: any;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Não informado';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return 'Data inválida';
  }
};

export const EnhancedSmartCardFixed: React.FC<EnhancedSmartCardProps> = ({
  tipo,
  dados,
  onClick,
  className = '',
  showActions = true,
  compact = false,
  showFullDetails = false,
  onViewDetails,
  historico = [],
  vinculos = {},
  estatisticas = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCardIcon = () => {
    switch (tipo) {
      case 'locador': return <Users className="w-5 h-5" />;
      case 'locatario': return <User className="w-5 h-5" />;
      case 'imovel': return <Home className="w-5 h-5" />;
      case 'contrato': return <FileText className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getCardColor = () => {
    switch (tipo) {
      case 'locador': return 'blue';
      case 'locatario': return 'green';
      case 'imovel': return 'purple';
      case 'contrato': return 'amber';
      default: return 'gray';
    }
  };

  const renderBasicInfo = () => {
    if (compact) {
      const title = dados.nome || dados.endereco || dados.titulo || `${tipo} #${dados.id}`;
      const subtitle = tipo === 'locador' ? dados.telefone :
                      tipo === 'locatario' ? dados.cpf_cnpj :
                      tipo === 'imovel' ? formatCurrency(dados.valor_aluguel || 0) :
                      tipo === 'contrato' ? formatCurrency(dados.valor_aluguel || 0) : '';

      return (
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20 flex-shrink-0`}>
            {getCardIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{title}</h4>
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          </div>
          {onClick && (
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          )}
        </div>
      );
    }

    // Renderização expandida para diferentes tipos
    switch (tipo) {
      case 'locador':
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
                  {getCardIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{dados.nome}</h3>
                  <p className="text-sm text-muted-foreground">{dados.cpf_cnpj || 'CPF não informado'}</p>
                </div>
              </div>
              <Badge variant={dados.ativo ? 'default' : 'secondary'}>
                {dados.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground border-b pb-1">Contato</h4>
                {dados.telefone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{dados.telefone}</span>
                  </div>
                )}
                {dados.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{dados.email}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-foreground border-b pb-1">Informações</h4>
                {dados.endereco && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{dados.endereco}</span>
                  </div>
                )}
              </div>
            </div>

            {estatisticas && Object.keys(estatisticas).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-primary">{estatisticas.total_imoveis || 0}</p>
                  <p className="text-xs text-muted-foreground">Imóveis</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{estatisticas.contratos_ativos || 0}</p>
                  <p className="text-xs text-muted-foreground">Contratos</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-bold text-amber-600">
                    {formatCurrency(estatisticas.receita_mensal_bruta || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Receita</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-bold text-purple-600">
                    {formatCurrency(estatisticas.receita_mensal_estimada || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Potencial</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'locatario':
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
                  {getCardIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{dados.nome}</h3>
                  <p className="text-sm text-muted-foreground">{dados.cpf_cnpj || 'CPF não informado'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground border-b pb-1">Contato</h4>
                {dados.telefone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{dados.telefone}</span>
                  </div>
                )}
                {dados.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{dados.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'imovel':
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
                  {getCardIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {dados.endereco || 'Endereço não informado'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{dados.tipo || 'Tipo não informado'}</p>
                </div>
              </div>
              <Badge variant={dados.status === 'DISPONIVEL' || dados.status === 'Disponível' ? 'default' : 'secondary'}>
                {dados.status || 'Status não informado'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-primary">{formatCurrency(dados.valor_aluguel || 0)}</p>
                <p className="text-xs text-muted-foreground">Valor Aluguel</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{dados.quartos || 0}</p>
                <p className="text-xs text-muted-foreground">Quartos</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{dados.banheiros || 0}</p>
                <p className="text-xs text-muted-foreground">Banheiros</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{dados.area_total || 0}m²</p>
                <p className="text-xs text-muted-foreground">Área</p>
              </div>
            </div>
          </div>
        );

      case 'contrato':
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
                  {getCardIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Contrato #{dados.id}</h3>
                  <p className="text-sm text-muted-foreground">{dados.locatario || dados.locatario_nome || 'Locatário não informado'}</p>
                </div>
              </div>
              <Badge variant={dados.status === 'ATIVO' ? 'default' : 'secondary'}>
                {dados.status || 'Status não informado'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{formatCurrency(dados.valor_aluguel || 0)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(dados.data_inicio)} - {formatDate(dados.data_fim)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{dados.imovel_endereco || 'Imóvel não informado'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Tipo de entidade não suportado: {tipo}</p>
          </div>
        );
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group ${className}`}
      >
        <Card 
          className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4 border-l-${getCardColor()}-500 ${
            onClick ? 'hover:shadow-md hover:border-l-8' : ''
          }`}
          onClick={onClick}
        >
          {renderBasicInfo()}
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group ${className}`}
    >
      <Card className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-${getCardColor()}-500`}>
        <div className="p-6">
          {renderBasicInfo()}
          
          {!isExpanded && (showActions || onViewDetails) && (
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                <span>Ver mais</span>
              </Button>
              
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewDetails}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Detalhes</span>
                </Button>
              )}
            </div>
          )}
          
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <div className="space-y-4">
                {historico && historico.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Histórico Recente</h4>
                    <div className="space-y-2">
                      {historico.slice(0, 3).map((evento, index) => (
                        <div key={index} className="p-2 bg-muted/30 rounded text-sm">
                          <p className="font-medium">{evento.descricao}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(evento.data)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center space-x-2"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                  <span>Ver menos</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};