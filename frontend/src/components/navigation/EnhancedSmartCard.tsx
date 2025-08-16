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
  TrendingUp,
  AlertCircle,
  Building,
  Eye,
  History,
  Link,
  Star,
  Activity,
  Clock,
  UserCheck,
  Shield,
  Heart
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

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

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return 'Não informado';
  try {
    return new Date(dateString).toLocaleString('pt-BR');
  } catch {
    return 'Data inválida';
  }
};

export const EnhancedSmartCard: React.FC<EnhancedSmartCardProps> = ({
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
  const [activeTab, setActiveTab] = useState('dados');

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo': case 'disponivel': case 'disponível':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inativo': case 'ocupado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
  };

  const renderDadosPrincipais = () => {
    switch (tipo) {
      case 'locador':
        return renderLocadorDados();
      case 'locatario':
        return renderLocatarioDados();
      case 'imovel':
        return renderImovelDados();
      case 'contrato':
        return renderContratoDados();
      default:
        return (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Tipo de entidade não suportado: {tipo}</p>
            <p className="text-xs text-muted-foreground mt-2">Dados disponíveis: {JSON.stringify(Object.keys(dados))}</p>
          </div>
        );
    }
  };

  const renderLocadorDados = () => (
    <div className="space-y-4">
      {/* Header com informações principais */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-${getCardColor()}-100 dark:bg-${getCardColor()}-900/20`}>
            {getCardIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{dados.nome}</h3>
            <p className="text-sm text-muted-foreground">{dados.cpf_cnpj || 'CPF não informado'}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dados.ativo ? 'ativo' : 'inativo')}`}>
                {dados.ativo ? 'Ativo' : 'Inativo'}
              </span>
              {dados.tipo_pessoa && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {dados.tipo_pessoa}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium text-foreground border-b pb-1">Dados Pessoais</h4>
          
          {dados.telefone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{dados.telefone}</span>
            </div>
          )}
          
          {dados.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{dados.email}</span>
            </div>
          )}
          
          {(dados.endereco_completo || dados.endereco) && (
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="break-words">{dados.endereco_completo || dados.endereco}</span>
            </div>
          )}
          
          {dados.data_nascimento && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Nascimento: {formatDate(dados.data_nascimento)}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-foreground border-b pb-1">Informações Complementares</h4>
          
          {dados.profissao && (
            <div className="flex items-center space-x-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{dados.profissao}</span>
            </div>
          )}
          
          {dados.estado_civil && (
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{dados.estado_civil}</span>
            </div>
          )}
          
          {dados.nacionalidade && (
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{dados.nacionalidade}</span>
            </div>
          )}
          
          {dados.tipo_recebimento && (
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Recebimento: {dados.tipo_recebimento}</span>
            </div>
          )}
          
          {dados.conta_bancaria && (
            <div className="flex items-center space-x-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>Conta: {dados.conta_bancaria}</span>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && Object.keys(estatisticas).length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-foreground border-b pb-2 mb-3">Estatísticas</h4>
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
              <p className="text-xs text-muted-foreground">Receita Atual</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-bold text-purple-600">
                {formatCurrency(estatisticas.receita_mensal_estimada || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Potencial</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLocatarioDados = () => (
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
        
        <div className="space-y-3">
          <h4 className="font-medium text-foreground border-b pb-1">Informações</h4>
          {dados.profissao && (
            <div className="flex items-center space-x-2 text-sm">
              <Building className="w-4 h-4 text-muted-foreground" />
              <span>{dados.profissao}</span>
            </div>
          )}
          {dados.estado_civil && (
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span>{dados.estado_civil}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderImovelDados = () => (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
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

      {dados.locador && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Proprietário:</span>
            <span>{dados.locador.nome || dados.locador_nome}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderContratoDados = () => (
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
          {dados.locador && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Locador: {dados.locador}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistorico = () => {
    if (!historico || historico.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum histórico disponível</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {historico.slice(0, 5).map((evento, index) => (
          <div key={index} className="flex space-x-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{evento.descricao}</p>
                  <p className="text-xs text-muted-foreground">{evento.tipo}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{formatDateTime(evento.data)}</p>
                  {evento.valor && (
                    <p className="text-xs font-medium">{formatCurrency(evento.valor)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {historico.length > 5 && (
          <p className="text-center text-sm text-muted-foreground">
            E mais {historico.length - 5} eventos...
          </p>
        )}
      </div>
    );
  };

  const renderVinculos = () => {
    if (!vinculos || Object.keys(vinculos).length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Link className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum vínculo encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {vinculos.imoveis && vinculos.imoveis.length > 0 && (
          <div>
            <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Imóveis ({vinculos.imoveis.length})</span>
            </h4>
            <div className="space-y-2">
              {vinculos.imoveis.slice(0, 3).map((imovel: any, index: number) => (
                <div key={index} className="p-2 bg-muted/30 rounded border-l-4 border-l-purple-500">
                  <p className="font-medium text-sm">{imovel.endereco}</p>
                  <p className="text-xs text-muted-foreground">
                    {imovel.tipo} • {formatCurrency(imovel.valor_aluguel)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {vinculos.contratos && vinculos.contratos.length > 0 && (
          <div>
            <h4 className="font-medium text-foreground mb-2 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Contratos ({vinculos.contratos.length})</span>
            </h4>
            <div className="space-y-2">
              {vinculos.contratos.slice(0, 3).map((contrato: any, index: number) => (
                <div key={index} className="p-2 bg-muted/30 rounded border-l-4 border-l-amber-500">
                  <p className="font-medium text-sm">Contrato #{contrato.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {contrato.imovel_endereco} • {formatCurrency(contrato.valor_aluguel)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
          {renderCompactContent()}
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
          {showFullDetails ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="dados" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Dados</span>
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="vinculos" className="flex items-center space-x-2">
                  <Link className="w-4 h-4" />
                  <span>Vínculos</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dados" className="mt-0">
                {renderDadosPrincipais()}
              </TabsContent>
              
              <TabsContent value="historico" className="mt-0">
                {renderHistorico()}
              </TabsContent>
              
              <TabsContent value="vinculos" className="mt-0">
                {renderVinculos()}
              </TabsContent>
            </Tabs>
          ) : (
            <>
              {renderDadosPrincipais()}
              
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="historico">Histórico</TabsTrigger>
                      <TabsTrigger value="vinculos">Vínculos</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="historico" className="mt-0">
                      {renderHistorico()}
                    </TabsContent>
                    
                    <TabsContent value="vinculos" className="mt-0">
                      {renderVinculos()}
                    </TabsContent>
                  </Tabs>
                  
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
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
};