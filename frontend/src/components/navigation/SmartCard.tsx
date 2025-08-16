import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Home, 
  Users, 
  FileText, 
  User,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface SmartCardProps {
  tipo: 'locador' | 'locatario' | 'imovel' | 'contrato';
  dados: any;
  onClick?: () => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Não informado';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const SmartCard: React.FC<SmartCardProps> = ({
  tipo,
  dados,
  onClick,
  className = '',
  showActions = true,
  compact = false
}) => {
  const getCardIcon = () => {
    switch (tipo) {
      case 'locador': return <Users className="w-5 h-5" />;
      case 'locatario': return <User className="w-5 h-5" />;
      case 'imovel': return <Home className="w-5 h-5" />;
      case 'contrato': return <FileText className="w-5 h-5" />;
    }
  };

  const getCardColor = () => {
    switch (tipo) {
      case 'locador': return 'blue';
      case 'locatario': return 'green';
      case 'imovel': return 'purple';
      case 'contrato': return 'amber';
    }
  };

  const renderCardContent = () => {
    if (compact) {
      return renderCompactContent();
    }

    switch (tipo) {
      case 'locador':
        return renderLocadorContent();
      case 'locatario':
        return renderLocatarioContent();
      case 'imovel':
        return renderImovelContent();
      case 'contrato':
        return renderContratoContent();
    }
  };

  const renderCompactContent = () => {
    const title = dados.nome || dados.endereco || dados.titulo || `${tipo} #${dados.id}`;
    const subtitle = tipo === 'locador' ? dados.telefone :
                    tipo === 'locatario' ? dados.cpf_cnpj :
                    tipo === 'imovel' ? formatCurrency(dados.valor_aluguel || 0) :
                    tipo === 'contrato' ? formatCurrency(dados.valor_aluguel || 0) : '';

    return (
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
          {getCardIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{title}</h4>
          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
        </div>
        {onClick && (
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </div>
    );
  };

  const renderLocadorContent = () => (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
            {getCardIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{dados.nome}</h3>
            <p className="text-sm text-muted-foreground">{dados.cpf_cnpj || 'CPF não informado'}</p>
          </div>
        </div>
        <Badge variant={dados.ativo !== false ? 'default' : 'secondary'}>
          {dados.ativo !== false ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
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
        {(dados.endereco_completo || dados.endereco) && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{dados.endereco_completo || dados.endereco}</span>
          </div>
        )}
        {dados.profissao && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{dados.profissao}</span>
          </div>
        )}
        {dados.tipo_recebimento && (
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>Pagamento: {dados.tipo_recebimento}</span>
          </div>
        )}
        {dados.estado_civil && (
          <div className="flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span>{dados.estado_civil} • {dados.nacionalidade || 'Brasileiro'}</span>
          </div>
        )}
      </div>

      {dados.estatisticas && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-primary">{dados.estatisticas.total_imoveis || 0}</p>
            <p className="text-xs text-muted-foreground">Imóveis</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-green-600">{dados.estatisticas.contratos_ativos || 0}</p>
            <p className="text-xs text-muted-foreground">Contratos</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-sm font-bold text-amber-600">
              {formatCurrency(dados.estatisticas.receita_mensal_estimada || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Receita</p>
          </div>
        </div>
      )}
    </>
  );

  const renderLocatarioContent = () => (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
            {getCardIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{dados.nome}</h3>
            <p className="text-sm text-muted-foreground">{dados.cpf_cnpj}</p>
          </div>
        </div>
        <Badge variant={dados.status_contrato_atual === 'ATIVO' ? 'default' : 'secondary'}>
          {dados.status_contrato_atual || 'Sem Contrato'}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {dados.telefone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{dados.telefone}</span>
          </div>
        )}
        {dados.profissao && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{dados.profissao}</span>
          </div>
        )}
        {dados.imovel_atual && (
          <div className="flex items-center space-x-2 text-sm">
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{dados.imovel_atual}</span>
          </div>
        )}
      </div>

      {dados.historico_financeiro && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-green-600">
              {dados.historico_financeiro.percentual_pontualidade?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Pontualidade</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-primary">{dados.total_contratos || 0}</p>
            <p className="text-xs text-muted-foreground">Contratos</p>
          </div>
        </div>
      )}
    </>
  );

  const renderImovelContent = () => (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
            {getCardIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {dados.endereco_completo || dados.endereco || 'Endereço não informado'}
            </h3>
            <p className="text-sm text-muted-foreground">{dados.tipo || 'Tipo não informado'}</p>
          </div>
        </div>
        <Badge variant={dados.status === 'DISPONIVEL' || dados.status === 'Disponível' ? 'default' : 'secondary'}>
          {dados.status || 'Status não informado'}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span>{formatCurrency(dados.valor_aluguel || 0)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Home className="w-4 h-4 text-muted-foreground" />
          <span>
            {dados.area_total ? `${dados.area_total}m²` : 'Área não informada'} • 
            {dados.quartos || 0} quartos • 
            {dados.banheiros || 0} banheiros
          </span>
        </div>
        {dados.vagas_garagem > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{dados.vagas_garagem} vaga(s) de garagem</span>
          </div>
        )}
        {dados.locador && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Proprietário: {dados.locador.nome}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold text-primary">
            {dados.status === 'DISPONIVEL' || dados.status === 'Disponível' ? 'Livre' : 'Ocupado'}
          </p>
          <p className="text-xs text-muted-foreground">Situação</p>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <p className="text-sm font-bold text-amber-600">
            {dados.quartos || 0}/{dados.banheiros || 0}
          </p>
          <p className="text-xs text-muted-foreground">Quartos/Banheiros</p>
        </div>
      </div>
    </>
  );

  const renderContratoContent = () => (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
            {getCardIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Contrato #{dados.id}
            </h3>
            <p className="text-sm text-muted-foreground">{dados.locatario || 'Locatário não informado'}</p>
          </div>
        </div>
        <Badge variant={dados.status === 'ATIVO' ? 'default' : 'secondary'}>
          {dados.status_calculado || dados.status || 'Status não informado'}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span>{formatCurrency(dados.valor_aluguel || 0)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{formatDate(dados.data_inicio)} - {formatDate(dados.data_fim)}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Home className="w-4 h-4 text-muted-foreground" />
          <span className="truncate">{dados.imovel_endereco || dados.imovel?.endereco || 'Imóvel não informado'}</span>
        </div>
        {dados.locador && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>Locador: {dados.locador}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold text-green-600">
            {dados.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
          </p>
          <p className="text-xs text-muted-foreground">Status Contrato</p>
        </div>
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold text-primary">
            {dados.valor_aluguel > 0 ? formatCurrency(dados.valor_aluguel) : 'Não informado'}
          </p>
          <p className="text-xs text-muted-foreground">Valor Mensal</p>
        </div>
      </div>
    </>
  );

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
        {renderCardContent()}
        
        {showActions && onClick && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t">
            <span className="text-sm text-muted-foreground">
              Clique para ver detalhes
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        )}
      </Card>
    </motion.div>
  );
};