import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowLeft,
  History,
  Link,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { BreadcrumbNavigation } from '../navigation/BreadcrumbNavigation';
import { EnhancedSmartCard } from '../navigation/EnhancedSmartCard';

interface EnhancedEntityDetailModalProps {
  entityId: number;
  entityType: string;
  isOpen: boolean;
  onClose: () => void;
  enableNavigation?: boolean;
  onNavigateToEntity?: (tipo: string, id: number, nome: string) => void;
  breadcrumbs?: Array<{tipo: string, id: number, nome: string}>;
}

const EnhancedEntityDetailModal: React.FC<EnhancedEntityDetailModalProps> = ({
  entityId,
  entityType,
  isOpen,
  onClose,
  enableNavigation = false,
  onNavigateToEntity,
  breadcrumbs = []
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [entityData, setEntityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Efeito para carregar dados da entidade
  useEffect(() => {
    if (isOpen && entityId) {
      loadEntityData();
    }
  }, [isOpen, entityId, entityType]);

  // Efeito para bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Efeito para fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const loadEntityData = async () => {
    setIsLoading(true);
    try {
      // Simulação de carregamento de dados - em produção seria uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = getMockEntityData();
      setEntityData(mockData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockEntityData = () => {
    // Dados simulados baseados no tipo de entidade
    if (entityType === 'locador') {
      return {
        dados_principais: {
          id: entityId,
          nome: entityId === 21 ? "Fernando" : "Locador Exemplo",
          cpf_cnpj: "123.456.789-00",
          telefone: "(41) 98439-5029",
          email: "fernando.delfino@hotmail.com",
          endereco: "Rua Martim Afonso, 1168",
          profissao: "Empresário",
          estado_civil: "Solteiro",
          nacionalidade: "Brasileiro",
          tipo_recebimento: "PIX",
          conta_bancaria: "2253-2533",
          ativo: true,
          data_cadastro: "2024-01-15T10:00:00"
        },
        vinculos: {
          imoveis: [
            {
              id: 3,
              endereco: "Rua Martin Afonso, 1168",
              tipo: "Apartamento",
              valor_aluguel: 1000,
              status: "Ativo"
            },
            {
              id: 5,
              endereco: "Imóvel #5",
              tipo: "Apartamento",
              valor_aluguel: 1500,
              status: "Disponível"
            }
          ],
          contratos: [
            {
              id: 1,
              imovel_endereco: "Rua Martin Afonso, 1168",
              valor_aluguel: 1000,
              locatario_nome: "João Silva",
              status: "ATIVO"
            },
            {
              id: 2,
              imovel_endereco: "Rua Martin Afonso, 1168",
              valor_aluguel: 2500,
              locatario_nome: "Maria Santos",
              status: "ATIVO"
            }
          ]
        },
        historico: [
          {
            id: 1,
            data: "2024-01-15T10:00:00",
            tipo: "CADASTRO",
            descricao: "Locador cadastrado no sistema",
            usuario: "Sistema"
          },
          {
            id: 2,
            data: "2024-02-10T14:30:00",
            tipo: "IMOVEL",
            descricao: "Novo imóvel cadastrado",
            usuario: "Admin",
            valor: 1500
          },
          {
            id: 3,
            data: "2024-03-05T09:15:00",
            tipo: "CONTRATO",
            descricao: "Contrato de locação criado",
            usuario: "Sistema",
            valor: 1000
          }
        ],
        estatisticas: {
          total_imoveis: 2,
          imoveis_ocupados: 2,
          imoveis_disponiveis: 0,
          contratos_ativos: 2,
          receita_mensal_bruta: 3500,
          receita_mensal_estimada: 2500,
          avaliacao_media: 4.8
        }
      };
    }

    if (entityType === 'imovel') {
      return {
        dados_principais: {
          id: entityId,
          endereco: "Rua Martin Afonso, 1168",
          tipo: "Apartamento",
          valor_aluguel: 1000,
          status: "Ativo",
          quartos: 2,
          banheiros: 1,
          vagas_garagem: 1,
          area_total: 80,
          locador_nome: "Fernando"
        },
        vinculos: {
          contratos: [
            {
              id: 1,
              valor_aluguel: 1000,
              locatario_nome: "João Silva",
              data_inicio: "2024-01-01",
              data_fim: "2024-12-31",
              status: "ATIVO"
            }
          ]
        },
        historico: [
          {
            id: 1,
            data: "2024-01-15T10:00:00",
            tipo: "CADASTRO",
            descricao: "Imóvel cadastrado no sistema"
          }
        ],
        estatisticas: {
          total_contratos: 1,
          contratos_ativos: 1,
          ocupado: true
        }
      };
    }

    return {
      dados_principais: {},
      vinculos: {},
      historico: [],
      estatisticas: {}
    };
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

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'locador': case 'locadores': return <Users className="w-6 h-6" />;
      case 'locatario': case 'locatarios': return <User className="w-6 h-6" />;
      case 'imovel': case 'imoveis': return <Home className="w-6 h-6" />;
      case 'contrato': case 'contratos': return <FileText className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  const getEntityTitle = (type: string) => {
    switch (type) {
      case 'locador': case 'locadores': return 'Locador';
      case 'locatario': case 'locatarios': return 'Locatário';
      case 'imovel': case 'imoveis': return 'Imóvel';
      case 'contrato': case 'contratos': return 'Contrato';
      default: return 'Entidade';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      );
    }

    if (!entityData) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive">Erro ao carregar dados</p>
          </div>
        </div>
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Dados</span>
          </TabsTrigger>
          <TabsTrigger value="vinculos" className="flex items-center space-x-2">
            <Link className="w-4 h-4" />
            <span>Vínculos</span>
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="estatisticas" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Estatísticas</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-0">
          <EnhancedSmartCard
            tipo={entityType as any}
            dados={entityData.dados_principais}
            showFullDetails={true}
            showActions={false}
            vinculos={entityData.vinculos}
            historico={entityData.historico}
            estatisticas={entityData.estatisticas}
          />
        </TabsContent>
        
        <TabsContent value="vinculos" className="mt-0">
          <div className="space-y-4">
            {entityData.vinculos?.imoveis && entityData.vinculos.imoveis.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Imóveis ({entityData.vinculos.imoveis.length})</span>
                </h3>
                <div className="grid gap-4">
                  {entityData.vinculos.imoveis.map((imovel: any) => (
                    <EnhancedSmartCard
                      key={imovel.id}
                      tipo="imovel"
                      dados={imovel}
                      compact={true}
                      onClick={enableNavigation ? () => onNavigateToEntity?.('imovel', imovel.id, imovel.endereco) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {entityData.vinculos?.contratos && entityData.vinculos.contratos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Contratos ({entityData.vinculos.contratos.length})</span>
                </h3>
                <div className="grid gap-4">
                  {entityData.vinculos.contratos.map((contrato: any) => (
                    <EnhancedSmartCard
                      key={contrato.id}
                      tipo="contrato"
                      dados={contrato}
                      compact={true}
                      onClick={enableNavigation ? () => onNavigateToEntity?.('contrato', contrato.id, `Contrato #${contrato.id}`) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {(!entityData.vinculos || Object.keys(entityData.vinculos).length === 0) && (
              <div className="text-center py-12">
                <Link className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum vínculo encontrado</h3>
                <p className="text-muted-foreground">Esta entidade não possui vínculos cadastrados</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="historico" className="mt-0">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Timeline de Eventos</span>
            </h3>
            
            {entityData.historico && entityData.historico.length > 0 ? (
              <div className="space-y-4">
                {entityData.historico.map((evento: any, index: number) => (
                  <div key={evento.id || index} className="flex space-x-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{evento.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            Por: {evento.usuario || 'Sistema'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{formatDateTime(evento.data)}</p>
                          {evento.valor && (
                            <p className="text-sm font-medium text-green-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(evento.valor)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {evento.tipo}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhum histórico disponível</h3>
                <p className="text-muted-foreground">Ainda não há eventos registrados para esta entidade</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="estatisticas" className="mt-0">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Estatísticas e Métricas</span>
            </h3>
            
            {entityData.estatisticas && Object.keys(entityData.estatisticas).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(entityData.estatisticas).map(([key, value]: [string, any]) => {
                  const formatKey = (k: string) => {
                    const translations: { [key: string]: string } = {
                      'total_imoveis': 'Total de Imóveis',
                      'imoveis_ocupados': 'Imóveis Ocupados',
                      'imoveis_disponiveis': 'Imóveis Disponíveis',
                      'contratos_ativos': 'Termos Ativos',
                      'receita_mensal_bruta': 'Receita Mensal Bruta',
                      'receita_mensal_estimada': 'Receita Estimada',
                      'avaliacao_media': 'Avaliação Média',
                      'total_contratos': 'Total de Termos',
                      'valor_medio_aluguel': 'Valor Médio',
                      'ocupado': 'Status de Ocupação'
                    };
                    return translations[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  };

                  const formatValue = (v: any) => {
                    if (typeof v === 'number') {
                      if (key.includes('receita') || key.includes('valor')) {
                        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
                      }
                      if (key.includes('avaliacao')) {
                        return `${v.toFixed(1)} ⭐`;
                      }
                      return v.toString();
                    }
                    if (typeof v === 'boolean') {
                      return v ? 'Sim' : 'Não';
                    }
                    return v?.toString() || 'N/A';
                  };

                  return (
                    <div key={key} className="p-4 bg-muted/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary mb-1">{formatValue(value)}</p>
                      <p className="text-sm text-muted-foreground">{formatKey(key)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">Nenhuma estatística disponível</h3>
                <p className="text-muted-foreground">Estatísticas serão calculadas conforme os dados são registrados</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  if (!isOpen) return null;

  const modal = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`bg-background rounded-2xl shadow-2xl w-full max-h-[95vh] overflow-hidden ${
            isFullscreen ? 'max-w-7xl h-[95vh]' : 'max-w-4xl max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com z-index alto */}
          <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4 text-primary-foreground relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getEntityIcon(entityType)}
                <div>
                  <h2 className="text-xl font-bold">Detalhes do {getEntityTitle(entityType)}</h2>
                  <p className="text-primary-foreground/80">ID: {entityId}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <div className="px-6 py-3 border-b bg-muted/30">
              <BreadcrumbNavigation
                items={breadcrumbs.map(item => ({
                  ...item, 
                  onClick: () => onNavigateToEntity?.(item.tipo, item.id, item.nome)
                }))}
              />
            </div>
          )}

          {/* Content com scroll */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: isFullscreen ? 'calc(95vh - 140px)' : 'calc(90vh - 140px)' }}>
            {renderContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Renderizar usando Portal para garantir z-index correto
  return createPortal(modal, document.body);
};