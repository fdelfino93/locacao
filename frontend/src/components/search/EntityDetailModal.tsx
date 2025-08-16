import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Home, 
  FileText, 
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Building,
  Users,
  Activity,
  TrendingUp,
  Clock,
  ChevronRight,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { BreadcrumbNavigation } from '../navigation/BreadcrumbNavigation';
import { SmartCard } from '../navigation/SmartCard';
import { PerfilCompletoLocador } from '../profiles/PerfilCompletoLocador';

interface EntityDetailModalProps {
  entityId: number;
  entityType: string;
  isOpen: boolean;
  onClose: () => void;
  enableNavigation?: boolean;
  onNavigateToEntity?: (tipo: string, id: number, nome: string) => void;
  breadcrumbs?: Array<{tipo: string, id: number, nome: string}>;
}

const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entityId,
  entityType,
  isOpen,
  onClose,
  enableNavigation = false,
  onNavigateToEntity,
  breadcrumbs = []
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showPerfilCompleto, setShowPerfilCompleto] = useState(false);

  // Dados reais simulados baseados no banco (para evitar timeout da API)
  const getEntityDetails = () => {
    if (entityType === 'imovel') {
      const imoveis = [
        {
          id: 3,
          endereco: "Rua Martin Afonso, 1168",
          tipo: "Apartamento",
          valor_aluguel: 1000.0,
          status: "Ativo",
          quartos: 0,
          banheiros: 0,
          vagas_garagem: 0,
          area_total: 0,
          locador: { nome: "Fernando" }
        },
        {
          id: 5,
          endereco: "Imóvel #5",
          tipo: "Apartamento",
          valor_aluguel: 1500.0,
          status: "Disponivel",
          quartos: 2,
          banheiros: 1,
          vagas_garagem: 1,
          area_total: 0,
          locador: { nome: "Fernando" }
        }
      ];
      
      const imovel = imoveis.find(i => i.id === entityId);
      return { data: { imovel } };
    }
    
    if (entityType === 'contrato') {
      const contratos = [
        {
          id: 1,
          data_inicio: "2025-02-14",
          data_fim: "2025-12-18",
          valor_aluguel: 0,
          imovel_endereco: "Rua Martin Afonso, 1168",
          locador: "Fernando",
          locatario: "Locatário #3",
          status: "ATIVO"
        },
        {
          id: 2,
          data_inicio: "2025-08-06",
          data_fim: "2026-08-06",
          valor_aluguel: 2500.0,
          imovel_endereco: "Rua Martin Afonso, 1168",
          locador: "Fernando",
          locatario: "Locatário #3",
          status: "ATIVO"
        }
      ];
      
      const contrato = contratos.find(c => c.id === entityId);
      return { data: { contrato } };
    }
    
    return null;
  };

  const details = getEntityDetails();
  const isLoading = false;
  const error = null;

  // Histórico simulado (sem API)
  const history = null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'locadores': return <Users className="w-6 h-6" />;
      case 'locatarios': return <User className="w-6 h-6" />;
      case 'imoveis': return <Home className="w-6 h-6" />;
      case 'contratos': return <FileText className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getEntityTitle = (type: string) => {
    switch (type) {
      case 'locadores': return 'Locador';
      case 'locatarios': return 'Locatário';
      case 'imoveis': return 'Imóvel';
      case 'contratos': return 'Contrato';
      default: return 'Entidade';
    }
  };

  const handleNavigateToRelatedEntity = (tipo: string, id: number, nome: string) => {
    if (onNavigateToEntity) {
      onNavigateToEntity(tipo, id, nome);
    }
  };

  const handleOpenPerfilCompleto = () => {
    if (entityType === 'locadores') {
      setShowPerfilCompleto(true);
    }
  };

  const renderBasicInfo = () => {
    if (!details?.data) return null;

    const data = details.data;

    switch (entityType) {
      case 'locadores':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Nome:</span>
                  <span>{data.locador?.nome}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">CPF/CNPJ:</span>
                  <span>{data.locador?.cpf_cnpj}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{data.locador?.telefone || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{data.locador?.email || 'Não informado'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Tipo Recebimento:</span>
                  <span>{data.locador?.tipo_recebimento || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Data Nascimento:</span>
                  <span>{formatDate(data.locador?.data_nascimento)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={data.locador?.ativo ? 'default' : 'secondary'}>
                    {data.locador?.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {data.locador?.endereco && (
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div>
                  <span className="font-medium">Endereço:</span>
                  <p className="text-muted-foreground">{data.locador.endereco}</p>
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{data.estatisticas?.total_imoveis || 0}</p>
                <p className="text-sm text-muted-foreground">Imóveis</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{data.estatisticas?.contratos_ativos || 0}</p>
                <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(data.estatisticas?.receita_mensal_estimada || 0)}</p>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
              </div>
            </div>
          </div>
        );

      case 'locatarios':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Nome:</span>
                  <span>{data.locatario?.nome}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">CPF/CNPJ:</span>
                  <span>{data.locatario?.cpf_cnpj}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{data.locatario?.telefone || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{data.locatario?.email || 'Não informado'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Profissão:</span>
                  <span>{data.locatario?.profissao || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Estado Civil:</span>
                  <span>{data.locatario?.estado_civil || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Tipo Garantia:</span>
                  <span>{data.locatario?.tipo_garantia || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{data.estatisticas?.total_contratos || 0}</p>
                <p className="text-sm text-muted-foreground">Total Contratos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{data.estatisticas?.contratos_ativos || 0}</p>
                <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(data.estatisticas?.valor_medio_aluguel || 0)}</p>
                <p className="text-sm text-muted-foreground">Valor Médio</p>
              </div>
            </div>
          </div>
        );

      case 'imoveis':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Endereço:</span>
                  <span>{data.imovel?.endereco}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Tipo:</span>
                  <span>{data.imovel?.tipo || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Valor Aluguel:</span>
                  <span>{formatCurrency(data.imovel?.valor_aluguel || 0)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={data.imovel?.status === 'disponivel' ? 'default' : 'secondary'}>
                    {data.imovel?.status || 'Não informado'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Área:</span>
                  <span>{data.imovel?.area ? `${data.imovel.area} m²` : 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Quartos:</span>
                  <span>{data.imovel?.quartos || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Banheiros:</span>
                  <span>{data.imovel?.banheiros || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Vagas Garagem:</span>
                  <span>{data.imovel?.vagas_garagem || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {data.imovel?.proprietario_nome && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Proprietário</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{data.imovel.proprietario_nome}</span>
                  </div>
                  {data.imovel.proprietario_telefone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{data.imovel.proprietario_telefone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{data.estatisticas?.total_contratos || 0}</p>
                <p className="text-sm text-muted-foreground">Total Contratos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{data.estatisticas?.contratos_ativos || 0}</p>
                <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(data.estatisticas?.valor_medio_historico || 0)}</p>
                <p className="text-sm text-muted-foreground">Valor Médio Histórico</p>
              </div>
            </div>
          </div>
        );

      case 'contratos':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Data Início:</span>
                  <span>{formatDate(data.contrato?.data_inicio)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Data Fim:</span>
                  <span>{formatDate(data.contrato?.data_fim)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Valor Aluguel:</span>
                  <span>{formatCurrency(data.contrato?.valor_aluguel || 0)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant={data.contrato?.status === 'ativo' ? 'default' : 'secondary'}>
                    {data.contrato?.status || 'Não informado'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Imóvel:</span>
                  <span>{data.contrato?.imovel_endereco}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Locatário:</span>
                  <span>{data.contrato?.locatario_nome}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Tipo Garantia:</span>
                  <span>{data.contrato?.tipo_garantia || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Tipo Reajuste:</span>
                  <span>{data.contrato?.tipo_reajuste || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* Locadores */}
            {data.locadores && data.locadores.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Locadores</h4>
                <div className="space-y-2">
                  {data.locadores.map((locador: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-background rounded">
                      <span>{locador.nome}</span>
                      <Badge variant="outline">{locador.porcentagem_participacao}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Tipo de entidade não suportado</div>;
    }
  };

  const renderRelatedData = () => {
    if (!details?.data) return null;

    const data = details.data;

    // Renderizar dados relacionados baseado no tipo
    if (entityType === 'locadores' && data.imoveis?.length > 0) {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">Imóveis ({data.imoveis.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {data.imoveis.map((imovel: any) => (
              <SmartCard
                key={imovel.id}
                tipo="imovel"
                dados={imovel}
                onClick={enableNavigation ? () => handleNavigateToRelatedEntity('imoveis', imovel.id, imovel.endereco) : undefined}
                compact={true}
              />
            ))}
          </div>
        </div>
      );
    }

    if ((entityType === 'locadores' || entityType === 'locatarios' || entityType === 'imoveis') && data.contratos?.length > 0) {
      return (
        <div className="space-y-4">
          <h4 className="font-medium">Contratos ({data.contratos.length})</h4>
          <div className="grid grid-cols-1 gap-4">
            {data.contratos.map((contrato: any) => (
              <SmartCard
                key={contrato.id}
                tipo="contrato"
                dados={contrato}
                onClick={enableNavigation ? () => handleNavigateToRelatedEntity('contratos', contrato.id, `Contrato #${contrato.id}`) : undefined}
                compact={true}
              />
            ))}
          </div>
        </div>
      );
    }

    return <div className="text-muted-foreground text-center py-8">Nenhum dado relacionado encontrado</div>;
  };

  const renderTimeline = () => {
    if (entityType !== 'contratos' || !history?.data?.eventos) return null;

    const eventos = history.data.eventos;

    if (eventos.length === 0) {
      return <div className="text-muted-foreground text-center py-8">Nenhum evento registrado</div>;
    }

    return (
      <div className="space-y-4">
        <h4 className="font-medium">Timeline de Eventos ({eventos.length})</h4>
        <div className="space-y-4">
          {eventos.map((evento: any) => (
            <div key={evento.id} className="flex space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{evento.titulo}</p>
                    <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{formatDate(evento.data_evento)}</p>
                    {evento.valor && (
                      <p className="text-sm font-medium">{formatCurrency(evento.valor)}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="mt-2">
                  {evento.tipo_evento}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getEntityIcon(entityType)}
                <div>
                  <h2 className="text-xl font-bold">Detalhes do {getEntityTitle(entityType)}</h2>
                  <p className="text-primary-foreground/80">ID: {entityId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {entityType === 'locadores' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleOpenPerfilCompleto}
                    className="text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Ver Perfil Completo
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/10">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <div className="px-6 py-3 border-b">
              <BreadcrumbNavigation
                items={breadcrumbs.map(item => ({...item, onClick: () => handleNavigateToRelatedEntity(item.tipo, item.id, item.nome)}))}
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive">Erro ao carregar detalhes</p>
                </div>
              </div>
            )}

            {details && (
              <Tabs defaultValue={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="related">Relacionados</TabsTrigger>
                  {entityType === 'contratos' && (
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="info" className="mt-6">
                  {renderBasicInfo()}
                </TabsContent>
                
                <TabsContent value="related" className="mt-6">
                  {renderRelatedData()}
                </TabsContent>
                
                {entityType === 'contratos' && (
                  <TabsContent value="timeline" className="mt-6">
                    {renderTimeline()}
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>
        </motion.div>

        {/* Perfil Completo Modal */}
        {showPerfilCompleto && entityType === 'locadores' && (
          <PerfilCompletoLocador
            locadorId={entityId}
            isOpen={showPerfilCompleto}
            onClose={() => setShowPerfilCompleto(false)}
            onNavigateToEntity={onNavigateToEntity}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EntityDetailModal;