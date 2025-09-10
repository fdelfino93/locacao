import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Home, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  AlertCircle,
  Building,
  UserCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { SmartCard } from '../navigation/SmartCard';
import { BreadcrumbNavigation } from '../navigation/BreadcrumbNavigation';
import { usePerfilCompleto, useNavigacaoPerfil } from '../../hooks/usePerfilCompleto';

interface PerfilCompletoLocadorProps {
  locadorId: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToEntity?: (tipo: string, id: number, nome: string) => void;
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

export const PerfilCompletoLocador: React.FC<PerfilCompletoLocadorProps> = ({
  locadorId,
  isOpen,
  onClose,
  onNavigateToEntity
}) => {
  const [activeTab, setActiveTab] = useState('resumo');
  const { perfil, isLoading, error, refetch } = usePerfilCompleto('locadores', locadorId, isOpen);
  const { perfilAtual, historico, navegarPara, voltar, limparHistorico, podeVoltar } = useNavigacaoPerfil();

  const handleNavigateToEntity = (tipo: string, id: number, nome: string) => {
    if (onNavigateToEntity) {
      onNavigateToEntity(tipo, id, nome);
    } else {
      navegarPara(tipo, id, nome);
    }
  };

  const handleClose = () => {
    limparHistorico();
    onClose();
  };

  if (!isOpen) return null;

  const dados = perfil?.dados?.locador || {};
  const relacionamentos = perfil?.relacionamentos || {};
  const estatisticas = perfil?.estatisticas || dados.estatisticas || {};

  const breadcrumbItems = [
    {
      tipo: 'locadores',
      id: locadorId,
      nome: dados.nome || `Locador #${locadorId}`,
      onClick: () => {}
    }
  ];

  const renderResumoExecutivo = () => (
    <div className="space-y-6">
      {/* Cabeçalho do Locador */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {dados.nome}
              </h2>
              <p className="text-blue-700 dark:text-blue-300">{dados.cpf_cnpj}</p>
              <div className="flex items-center space-x-4 mt-2">
                {dados.telefone && (
                  <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                    <Phone className="w-4 h-4" />
                    <span>{dados.telefone}</span>
                  </div>
                )}
                {dados.email && (
                  <div className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400">
                    <Mail className="w-4 h-4" />
                    <span>{dados.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Badge variant={dados.ativo ? 'default' : 'secondary'} className="text-lg px-3 py-1">
            {dados.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {dados.endereco_completo && (
          <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
              <MapPin className="w-4 h-4" />
              <span>{dados.endereco_completo}</span>
            </div>
          </div>
        )}
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <Home className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
            {estatisticas.total_imoveis || 0}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">Imóveis Totais</p>
          <div className="mt-1 text-xs text-green-600 dark:text-green-400">
            {estatisticas.imoveis_ocupados || 0} ocupados • {estatisticas.imoveis_disponiveis || 0} disponíveis
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {estatisticas.contratos_ativos || 0}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">Contratos Ativos</p>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            {((estatisticas.contratos_ativos || 0) / Math.max(estatisticas.total_imoveis || 1, 1) * 100).toFixed(1)}% ocupação
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {formatCurrency(estatisticas.receita_mensal_estimada || estatisticas.receita_mensal_bruta || 0)}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">Receita Mensal</p>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Bruta estimada
          </div>
        </Card>

        <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {estatisticas.avaliacao_media ? estatisticas.avaliacao_media.toFixed(1) : '5.0'}
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-300">Avaliação Média</p>
          <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
            ⭐⭐⭐⭐⭐
          </div>
        </Card>
      </div>

      {/* Dados da Empresa (se for PJ) */}
      {dados.tipo_pessoa === 'PJ' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Dados da Empresa</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {dados.razao_social && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Razão Social:</span>
                  <span>{dados.razao_social}</span>
                </div>
              )}
              {dados.nome_fantasia && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Nome Fantasia:</span>
                  <span>{dados.nome_fantasia}</span>
                </div>
              )}
              {dados.inscricao_estadual && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Inscrição Estadual:</span>
                  <span>{dados.inscricao_estadual}</span>
                </div>
              )}
              {dados.inscricao_municipal && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Inscrição Municipal:</span>
                  <span>{dados.inscricao_municipal}</span>
                </div>
              )}
              {dados.atividade_principal && (
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Atividade Principal:</span>
                  <span>{dados.atividade_principal}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {dados.data_constituicao && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Data Constituição:</span>
                  <span>{formatDate(dados.data_constituicao)}</span>
                </div>
              )}
              {dados.capital_social && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Capital Social:</span>
                  <span>{formatCurrency(Number(dados.capital_social))}</span>
                </div>
              )}
              {dados.porte_empresa && (
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Porte da Empresa:</span>
                  <span>{dados.porte_empresa}</span>
                </div>
              )}
              {dados.regime_tributario && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Regime Tributário:</span>
                  <span>{dados.regime_tributario}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Dados do Representante Legal (se for PJ) */}
      {dados.tipo_pessoa === 'PJ' && perfil?.dados?.locador?.representante_legal && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Representante Legal</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {perfil.dados.locador.representante_legal.nome && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Nome:</span>
                  <span>{perfil.dados.locador.representante_legal.nome}</span>
                </div>
              )}
              {perfil.dados.locador.representante_legal.cpf && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">CPF:</span>
                  <span>{perfil.dados.locador.representante_legal.cpf}</span>
                </div>
              )}
              {perfil.dados.locador.representante_legal.rg && (
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">RG:</span>
                  <span>{perfil.dados.locador.representante_legal.rg}</span>
                </div>
              )}
              {perfil.dados.locador.representante_legal.cargo && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cargo:</span>
                  <span>{perfil.dados.locador.representante_legal.cargo}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {perfil.dados.locador.representante_legal.telefone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{perfil.dados.locador.representante_legal.telefone}</span>
                </div>
              )}
              {perfil.dados.locador.representante_legal.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{perfil.dados.locador.representante_legal.email}</span>
                </div>
              )}
              {perfil.dados.locador.representante_legal.endereco && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Endereço:</span>
                  <span>{perfil.dados.locador.representante_legal.endereco}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Dados Pessoais (se for PF) */}
      {dados.tipo_pessoa === 'PF' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Dados Pessoais</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {dados.tipo_recebimento && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Tipo Recebimento:</span>
                  <span>{dados.tipo_recebimento}</span>
                </div>
              )}
              {dados.data_nascimento && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Data Nascimento:</span>
                  <span>{formatDate(dados.data_nascimento)}</span>
                </div>
              )}
              {dados.profissao && (
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Profissão:</span>
                  <span>{dados.profissao}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {dados.estado_civil && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Estado Civil:</span>
                  <span>{dados.estado_civil}</span>
                </div>
              )}
              {dados.nacionalidade && (
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Nacionalidade:</span>
                  <span>{dados.nacionalidade}</span>
                </div>
              )}
              {dados.data_cadastro && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Cliente desde:</span>
                  <span>{formatDate(dados.data_cadastro)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Dados Gerais */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span>Informações Gerais</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {dados.tipo_recebimento && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Tipo Recebimento:</span>
                <span>{dados.tipo_recebimento}</span>
              </div>
            )}
            {dados.data_cadastro && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Cliente desde:</span>
                <span>{formatDate(dados.data_cadastro)}</span>
              </div>
            )}
            {dados.observacoes && (
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Observações:</span>
                <span>{dados.observacoes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderImoveis = () => {
    const imoveis = relacionamentos.imoveis || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Imóveis ({imoveis.length})</span>
          </h3>
          {imoveis.length > 6 && (
            <Button variant="outline" size="sm">
              Ver todos os {imoveis.length} imóveis
            </Button>
          )}
        </div>

        {imoveis.length === 0 ? (
          <Card className="p-8 text-center">
            <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum imóvel cadastrado</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {imoveis.slice(0, 6).map((imovel: any) => (
              <SmartCard
                key={imovel.id}
                tipo="imovel"
                dados={imovel}
                onClick={() => handleNavigateToEntity('imoveis', imovel.id, imovel.endereco)}
                compact={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContratos = () => {
    const contratos = relacionamentos.contratos_ativos || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Contratos Ativos ({contratos.length})</span>
          </h3>
          {contratos.length > 4 && (
            <Button variant="outline" size="sm">
              Ver todos os {contratos.length} contratos
            </Button>
          )}
        </div>

        {contratos.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum contrato ativo</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {contratos.slice(0, 4).map((contrato: any) => (
              <SmartCard
                key={contrato.id}
                tipo="contrato"
                dados={contrato}
                onClick={() => handleNavigateToEntity('contratos', contrato.id, `Contrato #${contrato.id}`)}
                compact={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAnaliseFinanceira = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center space-x-2">
        <TrendingUp className="w-5 h-5" />
        <span>Análise Financeira</span>
      </h3>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Bruta</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(estatisticas.receita_mensal_bruta || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receita Líquida Est.</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency((estatisticas.receita_mensal_bruta || 0) * 0.85)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa Ocupação</p>
              <p className="text-lg font-bold text-purple-600">
                {((estatisticas.contratos_ativos || 0) / Math.max(estatisticas.total_imoveis || 1, 1) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Performance do Portfólio</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Imóveis Ocupados</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${((estatisticas.imoveis_ocupados || 0) / Math.max(estatisticas.total_imoveis || 1, 1) * 100)}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium">
                {estatisticas.imoveis_ocupados || 0}/{estatisticas.total_imoveis || 0}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Contratos Ativos</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: `${((estatisticas.contratos_ativos || 0) / Math.max(estatisticas.total_imoveis || 1, 1) * 100)}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium">{estatisticas.contratos_ativos || 0}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Avaliação Geral</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ 
                    width: `${((estatisticas.avaliacao_media || 5) / 5 * 100)}%` 
                  }}
                />
              </div>
              <span className="text-sm font-medium">
                {estatisticas.avaliacao_media ? estatisticas.avaliacao_media.toFixed(1) : '5.0'}/5.0
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/30 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Perfil Completo - Locador</h1>
                  <p className="text-blue-100">{dados.nome || `Locador #${locadorId}`}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {podeVoltar && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={voltar}
                    className="text-white hover:bg-blue-500/30"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose}
                  className="text-white hover:bg-blue-500/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="px-6 py-3 border-b">
            <BreadcrumbNavigation
              items={breadcrumbItems}
              onVoltar={podeVoltar ? voltar : undefined}
              podeVoltar={podeVoltar}
            />
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                  <p className="text-destructive">Erro ao carregar perfil do locador</p>
                  <Button variant="outline" onClick={refetch} className="mt-2">
                    Tentar novamente
                  </Button>
                </div>
              </div>
            )}

            {perfil && (
              <Tabs defaultValue={activeTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
                  <TabsTrigger value="imoveis">Imóveis ({relacionamentos.imoveis?.length || 0})</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos ({relacionamentos.contratos_ativos?.length || 0})</TabsTrigger>
                  <TabsTrigger value="financeiro">Análise Financeira</TabsTrigger>
                </TabsList>
                
                <TabsContent value="resumo" className="mt-6">
                  {renderResumoExecutivo()}
                </TabsContent>
                
                <TabsContent value="imoveis" className="mt-6">
                  {renderImoveis()}
                </TabsContent>
                
                <TabsContent value="contratos" className="mt-6">
                  {renderContratos()}
                </TabsContent>
                
                <TabsContent value="financeiro" className="mt-6">
                  {renderAnaliseFinanceira()}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};