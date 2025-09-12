import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Building, 
  AlertCircle,
  CheckCircle,
  MapPin,
  Home,
  DollarSign
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Imovel {
  id: number;
  endereco: string;
  tipo?: string;
  valor_aluguel?: number;
  status?: string;
  id_cliente?: number;
  locador_nome?: string;
  locador_telefone?: string;
}

interface ContractPropertyFormProps {
  imovelId: number;
  utilizacaoImovel?: 'residencial' | 'comercial';
  onChange: (imovelId: number) => void;
  onUtilizacaoChange?: (utilizacao: 'residencial' | 'comercial') => void;
  locadoresSelecionados?: number[];
  readonly?: boolean;
}

export const ContractPropertyForm: React.FC<ContractPropertyFormProps> = ({
  imovelId,
  utilizacaoImovel,
  onChange,
  onUtilizacaoChange,
  locadoresSelecionados = [],
  readonly = false
}) => {
  console.log('🏠 === ContractPropertyForm RENDERIZADO ===');
  console.log('🏠 imovelId recebido:', imovelId, 'tipo:', typeof imovelId);
  console.log('🏠 locadoresSelecionados:', locadoresSelecionados);
  console.log('🏠 readonly:', readonly);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(false);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [locadoresMap, setLocadoresMap] = useState<Record<string, number>>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    // Primeiro carregar locadores para ter o mapeamento
    await carregarLocadores();
    // Depois carregar imóveis
    await carregarImoveis();
  };

  const carregarLocadores = async () => {
    try {
      const response = await apiService.listarLocadores();
      if (response.success && response.data) {
        // Criar mapeamento nome -> id
        const mapeamento: Record<string, number> = {};
        response.data.forEach((locador: any) => {
          mapeamento[locador.nome] = locador.id;
        });
        setLocadoresMap(mapeamento);
        return mapeamento;
      }
    } catch (error) {
      console.error('Erro ao carregar locadores:', error);
    }
    return {};
  };

  // Filtrar imóveis baseado nos locadores selecionados
  useEffect(() => {
    console.log('🔧 === INICIANDO FILTRO DE IMÓVEIS ===');
    console.log('🔧 Locadores selecionados:', locadoresSelecionados);
    console.log('🏠 Imóvel atual do contrato (imovelId):', imovelId);
    console.log('📦 Total de imóveis disponíveis:', imoveis.length);
    console.log('📦 Imóveis detalhados:', imoveis.map(i => `ID:${i.id} - ${i.endereco} - Locador:${i.id_cliente}`));
    
    if (locadoresSelecionados.length === 0) {
      // Se nenhum locador selecionado, mostrar todos os imóveis
      console.log('📋 Nenhum locador selecionado - mostrando todos os imóveis');
      setImoveisFiltrados(imoveis);
    } else {
      // Filtrar imóveis dos locadores selecionados
      console.log('🔍 Filtrando por locadores:', locadoresSelecionados);
      let imoveisFiltradosPorLocador = imoveis.filter(imovel => {
        // Verificar se o imóvel tem locadores_ids (array N:N)
        if (imovel.locadores_ids && Array.isArray(imovel.locadores_ids)) {
          // Verificar se algum dos locadores do imóvel está na lista selecionada
          const isMatch = imovel.locadores_ids.some(locId => locadoresSelecionados.includes(locId));
          console.log(`🔍 Imóvel ${imovel.id} - Locadores: [${imovel.locadores_ids}] - Selecionados: [${locadoresSelecionados}] - Match: ${isMatch}`);
          return isMatch;
        }
        // Fallback para estrutura antiga (id_cliente ou id_locador)
        const locadorId = imovel.id_cliente || imovel.id_locador;
        const isMatch = locadorId && locadoresSelecionados.includes(locadorId);
        console.log(`🔍 Imóvel ${imovel.id} - Locador antigo: ${locadorId} - Match: ${isMatch}`);
        return isMatch;
      });
      
      console.log('🔍 Imóveis após filtro por locador:', imoveisFiltradosPorLocador.length);
      
      // IMPORTANTE: Sempre incluir o imóvel atual do contrato, mesmo que não seja do locador
      if (imovelId > 0) {
        const imovelAtual = imoveis.find(i => i.id === imovelId);
        if (imovelAtual && !imoveisFiltradosPorLocador.find(i => i.id === imovelId)) {
          console.log('✅ Adicionando imóvel atual do contrato à lista:', imovelAtual.endereco);
          imoveisFiltradosPorLocador.unshift(imovelAtual); // Adicionar no início da lista
        }
      }
      
      console.log('📋 RESULTADO FINAL - Imóveis filtrados:', imoveisFiltradosPorLocador.length);
      console.log('📋 Lista final:', imoveisFiltradosPorLocador.map(i => `${i.id}: ${i.endereco}`));
      setImoveisFiltrados(imoveisFiltradosPorLocador);
    }
    console.log('🔧 === FIM DO FILTRO DE IMÓVEIS ===');
  }, [imoveis, locadoresSelecionados, imovelId]);

  // Recarregar imóveis quando locadores selecionados mudarem
  useEffect(() => {
    // Sempre usar carregarImoveis() - a filtragem é feita pelo useEffect de filtros
    if (imoveis.length === 0) {
      carregarImoveis();
    }
  }, [locadoresSelecionados]);

  useEffect(() => {
    console.log('🔍 ContractPropertyForm useEffect - buscando imóvel:', imovelId);
    console.log('🔍 Mode readonly:', readonly);
    console.log('📋 Imóveis filtrados disponíveis:', imoveisFiltrados.map(i => `${i.id}: ${i.endereco}`));
    
    if (imovelId > 0) {
      const imovel = imoveisFiltrados.find(i => i.id === imovelId);
      console.log('🏠 Imóvel encontrado na lista:', imovel ? `${imovel.id}: ${imovel.endereco}` : 'NÃO ENCONTRADO');
      setImovelSelecionado(imovel || null);
      
      // CORREÇÃO: Se o imóvel selecionado não está na lista filtrada, resetar seleção APENAS se:
      // 1. Não estiver em modo readonly
      // 2. E se a lista de imóveis não estiver vazia (evita reset durante carregamento)
      // 3. E há locadores selecionados que devem filtrar a lista
      if (!imovel && locadoresSelecionados.length > 0 && !readonly && imoveisFiltrados.length > 0) {
        console.log('⚠️ Imóvel não encontrado na lista filtrada, resetando seleção');
        console.log('📋 Condições para reset: readonly=', readonly, ', locadores=', locadoresSelecionados.length, ', imoveis=', imoveisFiltrados.length);
        onChange(0);
      }
    } else {
      setImovelSelecionado(null);
    }
  }, [imovelId, imoveisFiltrados, locadoresSelecionados, onChange, readonly]);

  const carregarImoveis = async () => {
    try {
      setLoading(true);
      console.log('📦 Carregando todos os imóveis...');
      
      // Usar o endpoint correto de imóveis
      const response = await apiService.listarImoveis();
      
      if (response.success && response.data) {
        console.log('📦 Imóveis recebidos do backend:', response.data.length);
        
        // Transformar os dados para o formato esperado
        const imoveisFormatados = response.data.map((imovel: any) => ({
          id: imovel.id,
          endereco: imovel.endereco,
          tipo: imovel.tipo,
          valor_aluguel: imovel.valor_aluguel,
          status: imovel.status,
          // O campo correto no banco é id_locador, não id_cliente
          id_cliente: imovel.id_locador,
          id_locador: imovel.id_locador,
          // NOVO: Array de locadores da tabela N:N
          locadores_ids: imovel.locadores_ids || [],
          locador_nome: '', // Será preenchido depois se necessário
          locador_telefone: ''
        }));
        
        console.log('🏠 Imóveis formatados:', imoveisFormatados.map(i => `ID:${i.id} - ${i.endereco} (Locador:${i.id_cliente})`));
        setImoveis(imoveisFormatados);
      } else {
        console.error('Erro na resposta da API de imóveis:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleImovelChange = (value: string) => {
    const novoImovelId = parseInt(value);
    onChange(novoImovelId);
  };

  const getStatusValidacao = () => {
    if (imovelId === 0) {
      return { 
        tipo: 'error', 
        mensagem: 'É obrigatório selecionar um imóvel',
        icone: AlertCircle,
        cor: 'text-red-600'
      };
    }

    if (!utilizacaoImovel) {
      return {
        tipo: 'warning',
        mensagem: 'Defina a utilização do imóvel',
        icone: AlertCircle,
        cor: 'text-yellow-600'
      };
    }

    return {
      tipo: 'success',
      mensagem: 'Configuração do imóvel completa!',
      icone: CheckCircle,
      cor: 'text-green-600'
    };
  };

  const status = getStatusValidacao();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            Imóvel do Contrato
          </h2>
        </div>

        <p className="text-sm text-muted-foreground">
          {locadoresSelecionados.length > 0 
            ? `Mostrando apenas os imóveis dos ${locadoresSelecionados.length} locador${locadoresSelecionados.length > 1 ? 'es' : ''} selecionado${locadoresSelecionados.length > 1 ? 's' : ''}.`
            : "Selecione primeiro um locador para filtrar os imóveis disponíveis."
          }
        </p>

        {/* Indicador de Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card-glass rounded-xl p-4 border ${
            status.tipo === 'success' 
              ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
              : status.tipo === 'warning'
              ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
              : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <status.icone className={`w-5 h-5 ${status.cor}`} />
              <span className={`font-medium ${status.cor}`}>
                {status.mensagem}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold text-purple-600">
                  {imovelId > 0 ? '1' : '0'}
                </span>
                <span className="text-sm text-muted-foreground">
                  selecionado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {imoveisFiltrados.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  disponível{imoveisFiltrados.length !== 1 ? 'eis' : ''}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Seleção do Imóvel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div 
            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500"
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <Building className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Seleção do Imóvel
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Imóvel *</Label>
            <Select 
              value={(() => {
                const valorSelect = imovelId > 0 ? imovelId.toString() : "";
                console.log('🎯 Valor do Select:', valorSelect, 'para imovelId:', imovelId);
                console.log('🎯 Imóveis disponíveis no Select:', imoveisFiltrados.map(i => `${i.id}: ${i.endereco}`));
                return valorSelect;
              })()}
              onValueChange={readonly ? undefined : handleImovelChange}
              disabled={readonly}
            >
              <SelectTrigger className="bg-muted/50 border-border text-foreground w-full">
                <SelectValue 
                  className="truncate max-w-full"
                  placeholder={
                    loading 
                      ? "Carregando imóveis..." 
                      : imoveisFiltrados.length === 0
                      ? locadoresSelecionados.length > 0 
                        ? "Nenhum imóvel disponível para os locadores selecionados"
                        : "Nenhum imóvel disponível"
                      : "Selecione um imóvel..."
                  } 
                />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {loading ? (
                  <SelectItem value="0" disabled>Carregando...</SelectItem>
                ) : imoveisFiltrados.length === 0 ? (
                  <SelectItem value="0" disabled>
                    {locadoresSelecionados.length > 0 
                      ? "Nenhum imóvel encontrado para os locadores selecionados"
                      : "Nenhum imóvel encontrado"
                    }
                  </SelectItem>
                ) : (
                  imoveisFiltrados.map((imovel) => (
                    <SelectItem key={imovel.id} value={imovel.id.toString()} className="text-foreground hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <div className="flex flex-col">
                          <span className="font-medium">{imovel.endereco}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {imovel.tipo && <span>{imovel.tipo}</span>}
                            {imovel.locador_nome && (
                              <>
                                {imovel.tipo && <span>•</span>}
                                <span>Locador: {imovel.locador_nome}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Utilização *</Label>
            <Select 
              value={utilizacaoImovel || ""}
              onValueChange={readonly ? undefined : (value) => onUtilizacaoChange?.(value as 'residencial' | 'comercial')}
              disabled={readonly}
            >
              <SelectTrigger className="bg-muted/50 border-border text-foreground">
                <SelectValue placeholder="Selecione a utilização..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="residencial" className="text-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    <span>Residencial</span>
                  </div>
                </SelectItem>
                <SelectItem value="comercial" className="text-foreground hover:bg-accent">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-600" />
                    <span>Comercial</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Informações do Imóvel Selecionado */}
        {imovelSelecionado && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-600" />
              Informações do Imóvel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <div>
                  <span className="text-muted-foreground block">Endereço:</span>
                  <span className="font-semibold text-foreground">{imovelSelecionado.endereco}</span>
                </div>
              </div>
              {imovelSelecionado.tipo && (
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-muted-foreground block">Tipo:</span>
                    <span className="font-semibold text-foreground">{imovelSelecionado.tipo}</span>
                  </div>
                </div>
              )}
              {imovelSelecionado.valor_aluguel && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="text-muted-foreground block">Valor Sugerido:</span>
                    <span className="font-semibold text-foreground">
                      R$ {imovelSelecionado.valor_aluguel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};