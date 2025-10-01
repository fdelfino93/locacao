import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { CurrencyInput } from '../ui/currency-input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  FileText, 
  User, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Percent,
  Heart,
  Banknote,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Upload,
  File,
  Download,
  X,
  Palette,
  TreePine,
  Sparkles,
  Wrench,
  Eye,
  ArrowLeft,
  History,
  Smartphone
} from 'lucide-react';
import type { Contrato, ContratoLocador, ContratoLocatario } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';
import { ContractLandlordsForm } from './ContractLandlordsForm';
import { ContractTenantsForm } from './ContractTenantsForm';
import { ContractPropertyForm } from './ContractPropertyForm';
import HistoricoContrato from '../contrato/HistoricoContrato';
import { getApiUrl } from '../../config/api';

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Inquilino {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Imovel {
  id: number;
  endereco: string;
}

interface ModernContratoFormProps {
  onBack?: () => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

export const ModernContratoForm: React.FC<ModernContratoFormProps> = ({ 
  onBack, 
  isViewing = false, 
  isEditing = false 
}) => {
  console.log('🔥 INICIANDO ModernContratoForm - isViewing:', isViewing, 'isEditing:', isEditing);
  
  // Estados principais (devem vir primeiro)
  const [loading, setLoading] = useState(false);
  
  // Estados para locadores e locatários do contrato (declarar sempre)
  const [locadores, setLocadores] = useState<ContratoLocador[]>([]);
  const [locatarios, setLocatarios] = useState<ContratoLocatario[]>([]);
  const [garantias, setGarantias] = useState<any[]>([]);
  const [planosDisponiveis, setPlanosDisponiveis] = useState<any[]>([]);
  
  // Determinar se os campos devem estar desabilitados (apenas no modo visualizar puro)
  const isReadonly = isViewing; // Em editar (isEditing=true), isReadonly=false
  
  // Estados para carregamento de dados (sempre declarados, usados quando necessário)
  const [loadingData, setLoadingData] = useState(true);
  const [contratoData, setContratoData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dadosInicializados, setDadosInicializados] = useState(false);

  // Estados para animais de estimação
  const [pets, setPets] = useState<Array<{
    nome?: string;
    tipo?: string;
    raca?: string;
    tamanho: string;
    idade?: number;
    vacinacao_em_dia?: boolean;
  }>>([]);

  // Estado principal do formulário
  const [formData, setFormData] = useState<Contrato>({
    id_imovel: 0,
    id_inquilino: 0,
    data_inicio: '',
    data_fim: '',
    data_entrega_chaves: '',
    periodo_contrato: 12,
    taxa_administracao: 0,
    fundo_conservacao: 0,
    tipo_reajuste: '',
    percentual_reajuste: 0,
    vencimento_dia: 1,
    renovacao_automatica: false,
    seguro_obrigatorio: false,
    clausulas_adicionais: '',
    tipo_plano_locacao: '',
    valores_contrato: '',
    data_vigencia_segfianca: '',
    data_vigencia_segincendio: '',
    data_assinatura: '',
    ultimo_reajuste: '',
    proximo_reajuste: '',
    antecipacao_encargos: false,
    aluguel_garantido: false,
    mes_de_referencia: '',
    tipo_garantia: '',
    bonificacao: 0,
    retidos: '',
    info_garantias: '',
    deseja_fci: 'Não',
    deseja_seguro_fianca: 'Não',
    deseja_seguro_incendio: 'Não',
    // Novos campos
    valor_aluguel: 0,
    valor_iptu: 0,
    valor_condominio: 0,
    valor_fci: 0,
    valor_seguro_fianca: 0,
    valor_seguro_incendio: 0,
    tempo_renovacao: 12,
    tempo_reajuste: 12,
    indice_reajuste: 'IPCA',
    proximo_reajuste_automatico: false,
    tem_corretor: false,
    dados_bancarios_corretor: {
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: '',
      chave_pix: ''
    },
    retido_fci: false,
    retido_iptu: false,
    retido_condominio: false,
    retido_seguro_fianca: false,
    retido_seguro_incendio: false,
    antecipa_condominio: false,
    antecipa_seguro_fianca: false,
    antecipa_seguro_incendio: false,
    seguro_fianca_inicio: '',
    seguro_fianca_fim: '',
    seguro_incendio_inicio: '',
    seguro_incendio_fim: '',
    quantidade_pets: 0,
    pets: [],
    
    // Garantias
    fiadores: [],
    caucao: null,
    titulo_capitalizacao: null,
    apolice_seguro_fianca: null
  });

  // Funções de cálculo (devem vir antes de qualquer uso)
  const calcularProximoReajuste = (dataInicio: string, tempoReajuste: number): string => {
    if (!dataInicio || !tempoReajuste) return '';
    
    const inicio = new Date(dataInicio);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horário para comparação apenas de data
    
    // Calcular o primeiro reajuste
    let proximoReajuste = new Date(inicio);
    proximoReajuste.setMonth(proximoReajuste.getMonth() + tempoReajuste);
    
    // Se a data já passou, continuar adicionando períodos até encontrar uma data futura
    while (proximoReajuste <= hoje) {
      proximoReajuste.setMonth(proximoReajuste.getMonth() + tempoReajuste);
    }
    
    return proximoReajuste.toISOString().split('T')[0];
  };

  const calcularDataFim = (dataInicio: string, periodoMeses: number): string => {
    if (!dataInicio || !periodoMeses) return '';
    const inicio = new Date(dataInicio);
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + periodoMeses);
    return fim.toISOString().split('T')[0];
  };

  // Função para carregar planos disponíveis (fora dos useEffects)
  const carregarPlanosDisponiveis = async () => {
    try {
      const response = await apiService.listarPlanos();
      if (response && response.success && Array.isArray(response.data)) {
        setPlanosDisponiveis(response.data);
      } else {
        // Fallback: tentar usar o response direto caso seja uma estrutura diferente
        if (Array.isArray(response)) {
          setPlanosDisponiveis(response);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  // useEffect para carregar dados quando estiver em modo de visualização/edição  
  useEffect(() => {
    console.log('�Ys? useEffect de carregamento INICIADO');
    console.log('isViewing:', isViewing, 'isEditing:', isEditing);
    console.log('URL atual:', window.location.pathname);
    
    // Para cadastro, não precisa carregar dados do contrato
    if (!isViewing && !isEditing) {
      console.log('📝 Modo cadastro - não carregando dados');
      setLoadingData(false);
      return;
    }
    
    const loadContrato = async () => {
        try {
          setLoadingData(true);
          setApiError(null);
          
          // Extrair ID da URL
          const path = window.location.pathname;
          console.log('🔍 Analisando path:', path);
          const contratoIdMatch = path.match(/\/contrato\/(visualizar|editar)\/(\d+)/);
          console.log('🔍 Match encontrado:', contratoIdMatch);
          
          if (contratoIdMatch) {
            const contratoId = parseInt(contratoIdMatch[2]);
            console.log('Carregando contrato ID:', contratoId);
            console.log('🌐 Fazendo chamada para:', getApiUrl(`/contratos/${contratoId}`));
            
            const response = await fetch(getApiUrl(`/contratos/${contratoId}`), {
              signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                console.log('🔍 DADOS CARREGADOS DO CONTRATO:', data.data);
                console.log('🏠 ID do imóvel carregado:', data.data.id_imovel);
                console.log('🏠 Tipo do id_imovel:', typeof data.data.id_imovel);
                console.log('🔍 tipo_garantia no contrato:', data.data.tipo_garantia);
                
                // GARANTIR que id_imovel seja um número válido
                if (data.data.id_imovel) {
                  data.data.id_imovel = parseInt(data.data.id_imovel);
                  console.log('🔧 id_imovel convertido para número:', data.data.id_imovel);
                }
                
                console.log('📝 CHAMANDO setContratoData com:', data.data);
                console.log('📝 Especificamente id_imovel:', data.data.id_imovel);
                
                setContratoData(data.data);
                
                // Carregar TODOS os dados relacionados de uma vez
                const carregarTodosOsDados = async () => {
                  try {
                    console.log('🔄 Carregando TODOS os dados relacionados para contrato', contratoId);
                    
                    // Fazer todas as chamadas em paralelo para melhor performance
                    const [
                      responseLocadores,
                      responseLocatarios,
                      responsePets,
                      responseGarantias,
                      responsePlano,
                      responseDadosBancariosCorretor
                    ] = await Promise.all([
                      fetch(getApiUrl(`/contratos/${contratoId}/locadores`)),
                      fetch(getApiUrl(`/contratos/${contratoId}/locatarios`)),
                      fetch(getApiUrl(`/contratos/${contratoId}/pets`)),
                      fetch(getApiUrl(`/contratos/${contratoId}/garantias`)),
                      fetch(getApiUrl(`/contratos/${contratoId}/plano`)),
                      fetch(getApiUrl(`/contratos/${contratoId}/corretor/dados-bancarios`))
                    ]);

                    // Carregar locadores
                    if (responseLocadores.ok) {
                      const dataLocadores = await responseLocadores.json();
                      if (dataLocadores.success && dataLocadores.data && dataLocadores.data.length > 0) {
                        console.log('📤 Locadores carregados:', dataLocadores.data);
                        setLocadores(dataLocadores.data);
                      } else {
                        console.log('⚠️ Nenhum locador encontrado');
                      }
                    }
                    
                    // Carregar locatários
                    if (responseLocatarios.ok) {
                      const dataLocatarios = await responseLocatarios.json();
                      if (dataLocatarios.success && dataLocatarios.data && dataLocatarios.data.length > 0) {
                        console.log('📤 Locatários carregados:', dataLocatarios.data);
                        setLocatarios(dataLocatarios.data);
                      } else {
                        console.log('⚠️ Nenhum locatário encontrado');
                      }
                    }

                    // Carregar pets
                    if (responsePets.ok) {
                      const dataPets = await responsePets.json();
                      if (dataPets.success && dataPets.data && dataPets.data.length > 0) {
                        console.log('🐕 Pets carregados:', dataPets.data);
                        
                        // Converter dados de pets para o formato do formulário
                        const petsFormatted = dataPets.data.map((pet: any) => ({
                          nome: pet.nome || '',
                          tipo: pet.especie || '',
                          raca: pet.raca || '',
                          tamanho: pet.tamanho || 'pequeno',
                          idade: pet.idade || 0,
                          vacinacao_em_dia: pet.vacinado || false
                        }));

                        setPets(petsFormatted);
                        setFormData(prev => ({
                          ...prev,
                          quantidade_pets: petsFormatted.length,
                          pets: petsFormatted
                        }));
                        
                        // Atualizar contratoData também para campos condicionais funcionarem
                        if (isViewing || isEditing) {
                          setContratoData(prev => ({
                            ...prev,
                            quantidade_pets: petsFormatted.length,
                            pets: petsFormatted,
                            pets_racas: petsFormatted.map(p => p.raca).filter(r => r).join(', '),
                            pets_tamanhos: petsFormatted.map(p => p.tamanho).filter(t => t).join(', ')
                          }));
                        }
                      } else {
                        console.log('⚠️ Nenhum pet encontrado');
                      }
                    }

                    // Carregar garantias
                    console.log('📡 Buscando garantias para contrato:', contratoId);
                    if (responseGarantias.ok) {
                      const dataGarantias = await responseGarantias.json();
                      console.log('📦 Resposta de garantias:', dataGarantias);
                      if (dataGarantias.success && dataGarantias.data && dataGarantias.data.length > 0) {
                        console.log('🛡️ Garantias carregadas:', dataGarantias.data);
                        setGarantias(dataGarantias.data);
                        
                        // Processar primeira garantia para definir tipo
                        const garantia = dataGarantias.data[0];
                        let tipoGarantia = '';
                        
                        if (garantia.tipo_garantia) {
                          // Priorizar o tipo baseado nos dados preenchidos (mais confiável)
                          if (garantia.caucao_tipo || garantia.caucao_descricao) {
                            tipoGarantia = 'Caução';
                          } else if (garantia.titulo_seguradora || garantia.titulo_numero) {
                            tipoGarantia = 'Título de Capitalização';
                          } else if (garantia.apolice_seguradora || garantia.apolice_numero) {
                            tipoGarantia = 'Seguro-fiança';
                          } else if (garantia.fiador_nome || garantia.fiador_cpf) {
                            tipoGarantia = 'Fiador';
                          } else {
                            // Se não há dados específicos, usar o tipo_garantia do banco
                            switch (garantia.tipo_garantia) {
                              case 'FIADOR':
                              case 'MULTIPLA':
                                tipoGarantia = 'Fiador';
                                break;
                              case 'CAUCAO':
                                tipoGarantia = 'Caução';
                                break;
                              case 'TITULO':
                                tipoGarantia = 'Título de Capitalização';
                                break;
                              case 'APOLICE':
                                tipoGarantia = 'Seguro-fiança';
                                break;
                            }
                          }
                          
                          if (tipoGarantia) {
                            console.log('🛡️ Definindo tipo_garantia:', tipoGarantia);
                            setFormData(prev => ({
                              ...prev,
                              tipo_garantia: tipoGarantia
                            }));
                            
                            // Atualizar contratoData também para campos condicionais funcionarem
                            if (isViewing || isEditing) {
                              let camposEspecificos = {};
                              
                              // Adicionar campos específicos baseado no tipo detectado
                              if (tipoGarantia === 'Caução') {
                                camposEspecificos = {
                                  caucao_tipo: garantia.caucao_tipo || '',
                                  caucao_descricao: garantia.caucao_descricao || '',
                                  caucao_data_devolucao: garantia.caucao_data_devolucao || '',
                                  valor_garantia: garantia.valor_garantia || 0
                                };
                              } else if (tipoGarantia === 'Fiador') {
                                camposEspecificos = {
                                  fiador_nome: garantia.fiador_nome || '',
                                  fiador_cpf: garantia.fiador_cpf || '',
                                  fiador_telefone: garantia.fiador_telefone || '',
                                  fiador_endereco: garantia.fiador_endereco || ''
                                };
                              } else if (tipoGarantia === 'Título de Capitalização') {
                                camposEspecificos = {
                                  titulo_seguradora: garantia.titulo_seguradora || '',
                                  titulo_numero: garantia.titulo_numero || '',
                                  titulo_valor: garantia.titulo_valor || 0,
                                  titulo_vencimento: garantia.titulo_vencimento || ''
                                };
                              } else if (tipoGarantia === 'Seguro-fiança') {
                                camposEspecificos = {
                                  apolice_seguradora: garantia.apolice_seguradora || '',
                                  apolice_numero: garantia.apolice_numero || '',
                                  apolice_valor_cobertura: garantia.apolice_valor_cobertura || 0,
                                  apolice_vigencia_inicio: garantia.apolice_vigencia_inicio || '',
                                  apolice_vigencia_fim: garantia.apolice_vigencia_fim || ''
                                };
                              }
                              
                              setContratoData(prev => ({
                                ...prev,
                                tipo_garantia: tipoGarantia,
                                ...camposEspecificos
                              }));
                            }
                          }
                        }
                      } else {
                        console.log('⚠️ Nenhuma garantia encontrada para contrato', contratoId);
                        console.log('📊 Dados recebidos:', dataGarantias);
                      }
                    } else {
                      console.log('❌ Erro ao buscar garantias. Status:', responseGarantias.status);
                      const errorText = await responseGarantias.text();
                      console.log('❌ Resposta de erro:', errorText);
                    }

                    // Carregar plano
                    if (responsePlano.ok) {
                      const dataPlano = await responsePlano.json();
                      if (dataPlano.success && dataPlano.data) {
                        console.log('📋 Plano carregado:', dataPlano.data);
                        
                        const plano = dataPlano.data;
                        console.log('📋 Dados do plano da tabela PlanosLocacao:', plano);
                        
                        // Salvar dados do plano para a aba Plano
                        setFormData(prev => ({
                          ...prev,
                          // Dados do plano (da tabela PlanosLocacao)
                          plano_id: plano.plano_id || null,
                          plano_codigo: plano.plano_codigo || '',
                          plano_nome: plano.plano_nome || '',
                          plano_categoria: plano.plano_categoria || '', // COMPLETO/BASICO
                          plano_opcao: plano.plano_opcao || '',
                          plano_taxa_primeiro_aluguel: plano.plano_taxa_primeiro_aluguel || 0,
                          plano_taxa_demais_alugueis: plano.plano_taxa_demais_alugueis || 0,
                          plano_taxa_administracao: plano.plano_taxa_administracao || 0,
                          plano_aplica_taxa_unica: plano.plano_aplica_taxa_unica || false
                        }));
                        
                        // Atualizar contratoData também
                        if (isViewing || isEditing) {
                          setContratoData(prev => ({
                            ...prev,
                            plano_id: plano.plano_id || null,
                            plano_codigo: plano.plano_codigo || '',
                            plano_nome: plano.plano_nome || '',
                            plano_categoria: plano.plano_categoria || '',
                            plano_opcao: plano.plano_opcao || '',
                            plano_taxa_primeiro_aluguel: plano.plano_taxa_primeiro_aluguel || 0,
                            plano_taxa_demais_alugueis: plano.plano_taxa_demais_alugueis || 0,
                            plano_taxa_administracao: plano.plano_taxa_administracao || 0,
                            plano_aplica_taxa_unica: plano.plano_aplica_taxa_unica || false
                          }));
                        }
                      } else {
                        console.log('⚠️ Nenhum plano encontrado');
                      }
                    }

                    // Carregar dados bancários do corretor
                    if (responseDadosBancariosCorretor.ok) {
                      const dataDadosBancarios = await responseDadosBancariosCorretor.json();
                      if (dataDadosBancarios.success && dataDadosBancarios.data) {
                        console.log('🏦 Dados bancários do corretor carregados:', dataDadosBancarios.data);
                        
                        // Atualizar contratoData com os dados bancários
                        if (isViewing || isEditing) {
                          setContratoData(prev => ({
                            ...prev,
                            dados_bancarios_corretor: {
                              banco: dataDadosBancarios.data.banco || '',
                              agencia: dataDadosBancarios.data.agencia || '',
                              conta: dataDadosBancarios.data.conta || '',
                              tipo_conta: dataDadosBancarios.data.tipo_conta || '',
                              chave_pix: dataDadosBancarios.data.chave_pix || '',
                              titular: dataDadosBancarios.data.titular || ''
                            }
                          }));
                        }
                      } else {
                        console.log('⚠️ Nenhum dado bancário do corretor encontrado');
                      }
                    }

                    console.log('✅ Todos os dados relacionados carregados com sucesso');
                  } catch (error) {
                    console.error('❌ Erro ao carregar dados relacionados:', error);
                  }
                };
                
                await carregarTodosOsDados();
              } else {
                setApiError('Termo não encontrado');
              }
            } else {
              setApiError('Erro ao carregar termo');
            }
          } else {
            setApiError('ID do termo não encontrado na URL');
          }
        } catch (error) {
          console.error('Erro:', error);
          setApiError('Erro de conexão');
        } finally {
          setLoadingData(false);
        }
      };

      loadContrato();
    }, []);

  // Carregar planos disponíveis sempre (para cadastro e edição)
  useEffect(() => {
    carregarPlanosDisponiveis();
  }, []);

  // Inicializar estados dos locadores e locatários quando contratoData for carregado (apenas na primeira vez)
  useEffect(() => {
    console.log('🔄 useEffect inicialização chamado:');
    console.log('contratoData:', contratoData);
    console.log('contratoData?.id_imovel:', contratoData?.id_imovel);
    console.log('dadosInicializados:', dadosInicializados);
    
    if (contratoData && (isViewing || isEditing) && !dadosInicializados) {
        // REMOVIDO: Inicialização antiga que só carregava 1 locador
        // Agora os locadores são carregados pela função carregarLocadoresLocatarios()
        // que busca da tabela ContratoLocadores e suporta múltiplos locadores

        // REMOVIDO: Inicialização antiga que só carregava 1 locatário
        // Agora os locatários são carregados pela função carregarLocadoresLocatarios()
        // que busca da tabela ContratoLocatarios e suporta múltiplos locatários
        
        setDadosInicializados(true); // Marcar como inicializado para não reinicializar
      }
    }, [contratoData, dadosInicializados]);

    // Função para atualizar dados do contrato no modo editar
    const handleContratoInputChange = (field: string, value: any) => {
      // Mapear campos do frontend para nomes corretos do banco
      const fieldMappings: { [key: string]: string } = {
        'multa_atraso': 'percentual_multa_atraso',
        'data_inicio_seguro_fianca': 'seguro_fianca_inicio',
        'data_fim_seguro_fianca': 'seguro_fianca_fim',
        'data_inicio_seguro_incendio': 'seguro_incendio_inicio',
        'data_fim_seguro_incendio': 'seguro_incendio_fim'
      };
      
      const actualField = fieldMappings[field] || field;
      
      console.log(`�Y"" MUDAN�?A DE CAMPO: ${field} -> ${actualField} = ${value}`);
      
      setContratoData(prev => {
        const newData = {
          ...(prev || {}),
          [actualField]: value
        };
        
        // Se mudou imóvel, logar detalhes
        if (actualField === 'id_imovel') {
          console.log('�Y�� MUDAN�?A DE IM�"VEL DETECTADA:');
          console.log('Valor anterior:', prev?.id_imovel);
          console.log('Novo valor:', value);
          console.log('Dados atualizados:', newData);
        }
        
        return newData;
      });
    };

    // Função para atualizar dados bancários do corretor
    const handleBancarioCorretor = (field: string, value: any) => {
      setContratoData(prev => ({
        ...(prev || {}),
        dados_bancarios_corretor: {
          ...(prev?.dados_bancarios_corretor || {}),
          [field]: value
        }
      }));
    };

    // Função para calcular data fim baseada na data início e número de parcelas (meses)
    const calcularDataFimPorParcelas = (dataInicio: string, numeroParcelas: number): string => {
      if (!dataInicio || !numeroParcelas || numeroParcelas <= 0) return '';
      
      const data = new Date(dataInicio + 'T00:00:00');
      data.setMonth(data.getMonth() + numeroParcelas);
      
      return data.toISOString().split('T')[0];
    };

    // Função para selecionar um plano
    const handleSelecionarPlano = (planoId: string) => {
      const planoSelecionado = planosDisponiveis.find(p => p.id.toString() === planoId);
      if (planoSelecionado) {
        setContratoData(prev => ({
          ...prev,
          id_plano_locacao: planoSelecionado.id,
          plano_nome: planoSelecionado.nome,
          plano_categoria: planoSelecionado.categoria,
          plano_taxa_administracao: planoSelecionado.taxa_administracao,
          plano_taxa_primeiro_aluguel: planoSelecionado.taxa_primeiro_aluguel,
          plano_taxa_demais_alugueis: planoSelecionado.taxa_demais_alugueis
        }));
      }
    };

    // Função para atualizar dados da caução
    const handleCaucao = (field: string, value: any) => {
      setContratoData(prev => ({
        ...prev,
        caucao: {
          ...prev.caucao,
          [field]: value
        }
      }));
    };

    // Função para recarregar dados do contrato
    const recarregarDados = async () => {
      try {
        setLoadingData(true);
        setApiError(null);
        
        // Extrair ID da URL
        const path = window.location.pathname;
        const contratoIdMatch = path.match(/\/contrato\/(visualizar|editar)\/(\d+)/);
        
        if (contratoIdMatch) {
          const contratoId = parseInt(contratoIdMatch[2]);
          console.log('Recarregando dados do contrato ID:', contratoId);
          
          const response = await fetch(getApiUrl(`/contratos/${contratoId}`), {
            signal: AbortSignal.timeout(10000) // 10 segundos timeout
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setContratoData(data.data);
              
              // Resetar flag de inicialização para permitir reinicialização dos arrays
              setDadosInicializados(false);
              
              console.log('✅ Dados recarregados com sucesso');
            } else {
              setApiError('Contrato não encontrado');
            }
          } else {
            setApiError('Erro ao recarregar termo');
          }
        }
      } catch (error) {
        console.error('Erro ao recarregar:', error);
        setApiError('Erro de conexão ao recarregar');
      } finally {
        setLoadingData(false);
      }
    };

    // Função para cadastrar novo contrato
    const handleCreateContract = async (e) => {
      e.preventDefault(); // Impedir reload da página
      
      console.log('=== CADASTRANDO NOVO CONTRATO ===');
      console.log('Dados do contrato:', contratoData);
      console.log('Locadores:', locadores);
      console.log('Locatários:', locatarios);
      
      // Validações básicas (igual ao handleSaveContract)
      if (!contratoData?.id_imovel) {
        alert('❌ Erro: Selecione um imóvel antes de cadastrar o termo.');
        return;
      }
      
      if (!contratoData?.data_inicio) {
        alert('❌ Erro: Defina a data de início do termo.');
        return;
      }
      
      if (!contratoData?.data_fim) {
        alert('❌ Erro: Defina a data de fim do termo.');
        return;
      }
      
      if (!contratoData?.valor_aluguel || contratoData?.valor_aluguel <= 0) {
        alert('❌ Erro: Defina o valor do aluguel.');
        return;
      }
      
      if (!contratoData?.vencimento_dia) {
        alert('❌ Erro: Defina o dia de vencimento.');
        return;
      }
      
      if (!contratoData?.tipo_garantia) {
        alert('❌ Erro: Selecione o tipo de garantia.');
        return;
      }
      
      if (!locatarios || locatarios.length === 0) {
        alert('❌ Erro: Adicione pelo menos um locatário.');
        return;
      }
      
      // Verificar se há locatários inválidos (igual ao handleSaveContract)
      const locatariosInvalidos = locatarios.filter(loc => !loc.locatario_id || loc.locatario_id <= 0);
      if (locatariosInvalidos.length > 0) {
        alert(`�O Erro: ${locatariosInvalidos.length} locatário(s) não foram selecionados. Selecione todos os locatários antes de cadastrar.`);
        return;
      }
      
      setLoading(true);
      
      try {
        // Debug: Verificar dados antes de enviar (igual ao handleSaveContract)
        console.log('📤 DADOS ENVIADOS PARA API:');
        console.log('Dados completos:', JSON.stringify(contratoData, null, 2));
        
        // Garantir que o id_locatario está correto (primeiro locatário)
        const contratoCompleto = {
          ...contratoData,
          id_locatario: locatarios[0].locatario_id,
          status: "ativo"
        };
        
        // 1. Criar dados básicos do contrato (usando contratoCompleto como handleSaveContract)
        const responseContrato = await fetch(getApiUrl('/contratos'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contratoCompleto), // IGUAL AO handleSaveContract - usa objeto completo
          signal: AbortSignal.timeout(30000) // 30 segundos timeout (igual ao handleSaveContract)
        });
        
        if (!responseContrato.ok) {
          const errorData = await responseContrato.json();
          console.error('❌ Erro na resposta do servidor:', errorData);
          throw new Error(`Erro ao criar contrato: ${errorData.detail || 'Erro desconhecido'}`);
        }
        
        const resultContrato = await responseContrato.json();
        console.log('✅ Resposta do servidor para contrato:', resultContrato); // Igual ao handleSaveContract
        const contratoId = resultContrato.id;
        
        // 2. Salvar locadores usando novo endpoint (igual ao handleSaveContract)
        if (locadores && locadores.length > 0) {
          console.log('Salvando locadores...'); // Igual ao handleSaveContract
          console.log('📤 Dados dos locadores enviados:', JSON.stringify(locadores, null, 2));
          const responseLocadores = await fetch(getApiUrl(`/contratos/${contratoId}/locadores`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locadores: locadores }),
            signal: AbortSignal.timeout(15000) // 15 segundos timeout (igual ao handleSaveContract)
          });
          
          if (!responseLocadores.ok) {
            const errorData = await responseLocadores.json();
            console.warn('Erro ao salvar locadores:', errorData);
          } else {
            console.log('✅ Locadores salvos com sucesso');
          }
        }
        
        // 3. Salvar locatários usando novo endpoint (igual ao handleSaveContract)
        if (locatarios && locatarios.length > 0) {
          console.log('Salvando locatários...'); // Igual ao handleSaveContract
          console.log('📤 Dados dos locatários enviados:', JSON.stringify(locatarios, null, 2));
          
          // Validar dados antes de enviar (igual ao handleSaveContract)
          const locatariosValidos = locatarios.filter(l => l.locatario_id > 0);
          const locatariosInvalidos = locatarios.filter(l => l.locatario_id <= 0);
          
          console.log(`📊 Locatários válidos: ${locatariosValidos.length}`);
          console.log(`❌ Locatários inválidos: ${locatariosInvalidos.length}`);
          
          if (locatariosInvalidos.length > 0) {
            console.log('⚠️ Locatários com ID inválido:', locatariosInvalidos);
            alert(`Erro: ${locatariosInvalidos.length} locatário(s) não foram selecionados. Selecione todos os locatários antes de salvar.`);
            return;
          }
          
          const responseLocatarios = await fetch(getApiUrl(`/contratos/${contratoId}/locatarios`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locatarios: locatarios }),
            signal: AbortSignal.timeout(15000) // 15 segundos timeout (igual ao handleSaveContract)
          });
          
          if (!responseLocatarios.ok) {
            const errorData = await responseLocatarios.json();
            console.warn('Erro ao salvar locatários:', errorData);
          } else {
            console.log('✅ Locatários salvos com sucesso');
          }
        }
        
        // 4. Salvar garantias (fiador, caução, título, apólice)
        const garantiasData = {
          fiador_nome: contratoData?.fiador_nome,
          fiador_cpf: contratoData?.fiador_cpf,
          fiador_telefone: contratoData?.fiador_telefone,
          caucao_tipo: contratoData?.caucao_tipo,
          caucao_valor: contratoData?.caucao_valor,
          titulo_banco: contratoData?.titulo_banco,
          titulo_valor: contratoData?.titulo_valor,
          apolice_numero: contratoData?.seguro_apolice,
          apolice_valor_cobertura: contratoData?.seguro_valor_cobertura
        };
        
        const temGarantias = Object.values(garantiasData).some(valor => valor !== null && valor !== undefined && valor !== '');
        
        if (temGarantias) {
          console.log('4. Salvando garantias...');
          const responseGarantias = await fetch(getApiUrl(`/contratos/${contratoId}/garantias`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(garantiasData),
            signal: AbortSignal.timeout(15000)
          });
          
          if (!responseGarantias.ok) {
            const errorData = await responseGarantias.json();
            console.warn('Erro ao salvar garantias:', errorData);
          } else {
            console.log('✅ Garantias salvas com sucesso');
          }
        }
        
        // 5. Salvar pets
        const petsData = {
          quantidade_pets: contratoData?.quantidade_pets || 0,
          pets_racas: contratoData?.pets_racas,
          pets_tamanhos: contratoData?.pets_tamanhos
        };
        
        const temPets = contratoData?.quantidade_pets > 0;
        
        if (temPets) {
          console.log('5. Salvando pets...');
          const responsePets = await fetch(getApiUrl(`/contratos/${contratoId}/pets`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(petsData),
            signal: AbortSignal.timeout(15000)
          });
          
          if (!responsePets.ok) {
            const errorData = await responsePets.json();
            console.warn('Erro ao salvar pets:', errorData);
          } else {
            console.log('✅ Pets salvos com sucesso');
          }
        }
        
        alert(`✅ Termo cadastrado com sucesso! ID: ${contratoId}`);
        console.log('�o. SUCESSO: Contrato criado no banco com ID:', contratoId);
        
        // Limpar formulário após sucesso
        setContratoData({});
        setLocadores([]);
        setLocatarios([]);
        
        // Opcional: redirecionar para lista de contratos
        // window.location.href = '/contratos';
        
      } catch (error) {
        console.error('❌ Erro ao cadastrar:', error);
        if (error.name === 'TimeoutError') {
          alert('❌ Timeout: A operação demorou muito para ser concluída. Tente novamente.');
        } else {
          alert(`❌ Erro ao cadastrar termo: ${error.message || 'Erro de conexão'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    // Função simples para salvar (apenas para modo editar)
    const handleSaveContract = async () => {
      if (!isEditing || !contratoData?.id) return;
      
      console.log('=== SALVANDO CONTRATO ===');
      console.log('ID do contrato:', contratoData?.id);
      console.log('Dados do contrato:', contratoData);
      console.log('Locadores:', locadores);
      console.log('Locatários:', locatarios);
      
      setLoading(true); // Ativar loading
      
      try {
        // Debug: Verificar dados antes de enviar
        console.log('📤 DADOS ENVIADOS PARA API:');
        console.log('ID do contrato:', contratoData?.id);
        console.log('ID do imóvel atual:', contratoData?.id_imovel);
        console.log('Dados completos:', JSON.stringify(contratoData, null, 2));
        
        // 1. Salvar dados básicos do contrato
        const responseContrato = await fetch(getApiUrl(`/contratos/${contratoData?.id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contratoData),
          signal: AbortSignal.timeout(30000) // 30 segundos timeout
        });
        
        if (!responseContrato.ok) {
          const errorData = await responseContrato.json();
          console.error('❌ Erro na resposta do servidor:', errorData);
          throw new Error(`Erro ao salvar contrato: ${errorData.detail || 'Erro desconhecido'}`);
        }
        
        const resultContrato = await responseContrato.json();
        console.log('✅ Resposta do servidor para contrato:', resultContrato); // Igual ao handleSaveContract
        
        // 2. Salvar locadores usando novo endpoint
        if (locadores && locadores.length > 0) {
          console.log('Salvando locadores...');
          console.log('📤 Dados dos locadores enviados:', JSON.stringify(locadores, null, 2));
          const responseLocadores = await fetch(getApiUrl(`/contratos/${contratoData?.id}/locadores`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locadores: locadores }),
            signal: AbortSignal.timeout(15000) // 15 segundos timeout
          });
          
          if (!responseLocadores.ok) {
            const errorData = await responseLocadores.json();
            console.warn('Erro ao salvar locadores:', errorData);
          } else {
            console.log('✅ Locadores salvos com sucesso');
          }
        }
        
        // 3. Salvar locatários usando novo endpoint
        if (locatarios && locatarios.length > 0) {
          console.log('Salvando locatários...');
          console.log('📤 Dados dos locatários enviados:', JSON.stringify(locatarios, null, 2));
          
          // Validar dados antes de enviar
          const locatariosValidos = locatarios.filter(l => l.locatario_id > 0);
          const locatariosInvalidos = locatarios.filter(l => l.locatario_id <= 0);
          
          console.log(`📊 Locatários válidos: ${locatariosValidos.length}`);
          console.log(`❌ Locatários inválidos: ${locatariosInvalidos.length}`);
          
          if (locatariosInvalidos.length > 0) {
            console.log('⚠️ Locatários com ID inválido:', locatariosInvalidos);
            alert(`Erro: ${locatariosInvalidos.length} locatário(s) não foram selecionados. Selecione todos os locatários antes de salvar.`);
            return;
          }
          
          const responseLocatarios = await fetch(getApiUrl(`/contratos/${contratoData?.id}/locatarios`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locatarios: locatarios }),
            signal: AbortSignal.timeout(15000) // 15 segundos timeout
          });
          
          if (!responseLocatarios.ok) {
            const errorData = await responseLocatarios.json();
            console.warn('Erro ao salvar locatários:', errorData);
          } else {
            console.log('✅ Locatários salvos com sucesso');
          }
        }
        
        // 4. Salvar garantias (fiador, caução, título, apólice)
        const garantiasData = {
          fiador_nome: contratoData?.fiador_nome,
          fiador_cpf: contratoData?.fiador_cpf,
          fiador_telefone: contratoData?.fiador_telefone,
          fiador_endereco: contratoData?.fiador_endereco,
          caucao_tipo: contratoData?.caucao_tipo,
          caucao_descricao: contratoData?.caucao_descricao,
          titulo_numero: contratoData?.titulo_numero,
          titulo_valor: contratoData?.titulo_valor,
          apolice_numero: contratoData?.seguro_apolice,
          apolice_valor_cobertura: contratoData?.seguro_valor_cobertura
        };
        
        // Verificar se há dados de garantias para salvar
        const temGarantias = Object.values(garantiasData).some(valor => valor !== null && valor !== undefined && valor !== '');
        
        if (temGarantias) {
          console.log('Salvando garantias...');
          const responseGarantias = await fetch(getApiUrl(`/contratos/${contratoData?.id}/garantias`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(garantiasData),
            signal: AbortSignal.timeout(15000)
          });
          
          if (!responseGarantias.ok) {
            const errorData = await responseGarantias.json();
            console.warn('Erro ao salvar garantias:', errorData);
          } else {
            console.log('✅ Garantias salvas com sucesso');
          }
        }
        
        // 5. Salvar pets
        const petsData = {
          quantidade_pets: contratoData?.quantidade_pets || 0,
          pets_racas: contratoData?.pets_racas,
          pets_tamanhos: contratoData?.pets_tamanhos
        };
        
        if (petsData.quantidade_pets > 0) {
          console.log('Salvando pets...');
          const responsePets = await fetch(getApiUrl(`/contratos/${contratoData?.id}/pets`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(petsData),
            signal: AbortSignal.timeout(15000)
          });
          
          if (!responsePets.ok) {
            const errorData = await responsePets.json();
            console.warn('Erro ao salvar pets:', errorData);
          } else {
            console.log('✅ Pets salvos com sucesso');
          }
        }
        
        alert('✅ Termo atualizado com sucesso!');
        console.log('✅ SUCESSO: Todas as alterações salvas no banco');
        
        // REMOVIDO: Recarregamento automático para evitar loop infinito
        // await recarregarDados();
        
      } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        if (error.name === 'TimeoutError') {
          alert('❌ Timeout: A operação demorou muito para ser concluída. Tente novamente.');
        } else {
          alert(`❌ Erro ao salvar termo: ${error.message || 'Erro de conexão'}`);
        }
      } finally {
        setLoading(false); // Desativar loading
      }
    };

  // Se estiver em modo de visualização/edição, mostrar telas de loading/erro
  if ((isViewing || isEditing) && loadingData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
                <h1 className="text-2xl font-bold text-primary-foreground">
                  Carregando Contrato...
                </h1>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-foreground">Carregando dados...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

  // Se estiver em modo de visualização/edição, mostrar tela de erro
  if ((isViewing || isEditing) && apiError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-destructive to-destructive/90 px-8 py-6">
                <h1 className="text-2xl font-bold text-destructive-foreground">
                  Erro ao Carregar
                </h1>
              </div>
              <div className="p-8">
                <p className="text-foreground mb-4">{apiError}</p>
                {onBack && (
                  <Button onClick={onBack}>
                    Voltar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

  // Mostrar tela principal (funciona para todos os modos)
  if (true) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">
                    {isViewing ? 'Visualizar Termo' : isEditing ? 'Editar Termo' : 'Cadastrar Novo Termo'}
                  </h1>
                  {contratoData && (
                    <p className="text-primary-foreground/80">
                      Contrato #{contratoData?.id}
                    </p>
                  )}
                </div>
                
                {onBack && (
                  <Button 
                    variant="outline" 
                    onClick={onBack}
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                )}
              </div>
            </div>
            <div className="p-8">
              {/* Status do contrato */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${contratoData?.ativo !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">
                    Status: {contratoData?.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {contratoData?.data_fim && (
                  <span className="text-muted-foreground">
                    Válido até: {contratoData?.data_fim}
                  </span>
                )}
              </div>

              {(contratoData || (!isViewing && !isEditing)) && (
                <form className="space-y-8" onSubmit={!isViewing && !isEditing ? handleCreateContract : undefined}>
                  <Tabs defaultValue="partes" className="w-full">
                    <TabsList className={`grid w-full ${isViewing || isEditing ? 'grid-cols-7' : 'grid-cols-6'}`}>
                      <TabsTrigger value="partes">Partes</TabsTrigger>
                      <TabsTrigger value="datas">Datas e Reajustes</TabsTrigger>
                      <TabsTrigger value="valores">Valores e Encargos</TabsTrigger>
                      <TabsTrigger value="garantias">Garantias</TabsTrigger>
                      <TabsTrigger value="plano">Planos</TabsTrigger>
                      <TabsTrigger value="clausulas">Cláusulas</TabsTrigger>
                      {(isViewing || isEditing) && (
                        <TabsTrigger value="historico">Histórico</TabsTrigger>
                      )}
                    </TabsList>

                    {/* Aba 1: Partes do Termo */}
                    <TabsContent value="partes" className="space-y-8">
                      {/* Header da Seção */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center space-y-4"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Users className="w-6 h-6 text-white" />
                          </motion.div>
                          <div>
                            <h2 className="text-2xl font-bold text-foreground">
                              Partes do Termo
                            </h2>
                            <p className="text-muted-foreground">
                              Definir as partes envolvidas no contrato
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Campo básico para mostrar dados */}
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <Label>Número do Contrato</Label>
                          <InputWithIcon
                            value={contratoData?.id || ''}
                            disabled={true}
                            icon={FileText}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">Identificação única do contrato no sistema</p>
                        </div>
                      </div>

                      {/* Seção de Locadores (Proprietários) */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <ContractLandlordsForm 
                          locadores={locadores}
                          onChange={setLocadores}
                          readonly={isReadonly}
                        />
                      </motion.div>
                      
                      {/* Seção de Locatários */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <ContractTenantsForm 
                          locatarios={locatarios}
                          onChange={setLocatarios}
                          readonly={isReadonly}
                        />
                      </motion.div>
                      
                      {/* Seleção de Imóvel */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        {/* Mostrar ContractPropertyForm sempre, mas com valores padrão no cadastro */}
                        {(contratoData || (!isViewing && !isEditing)) && (
                          <ContractPropertyForm 
                            imovelId={(() => {
                              const imovel = contratoData?.id_imovel;
                              console.log('🎯 PASSANDO PARA ContractPropertyForm:');
                              console.log('contratoData?.id_imovel:', imovel);
                              console.log('tipo:', typeof imovel);
                              return imovel || 0;
                            })()}
                            utilizacaoImovel={contratoData?.tipo_plano_locacao ? contratoData?.tipo_plano_locacao.toLowerCase() : ""}
                            onChange={(imovelId) => {
                              console.log('🔄 ContractPropertyForm onChange chamado com:', imovelId);
                              handleContratoInputChange('id_imovel', imovelId);
                            }}
                            onUtilizacaoChange={(utilizacao) => handleContratoInputChange('tipo_plano_locacao', utilizacao.charAt(0).toUpperCase() + utilizacao.slice(1))}
                            locadoresSelecionados={(() => {
                              // Sempre usar os locadores do estado (array N:N), não importa o modo
                              const locadorIds = locadores.map(loc => loc.locador_id).filter(id => id > 0);
                              
                              // Log detalhado para debug
                              console.log('🏠 MODO:', isEditing ? 'EDIÇÃO' : isViewing ? 'VISUALIZAÇÃO' : 'CADASTRO');
                              console.log('🏠 LOCADORES SELECIONADOS:', locadorIds);
                              console.log('🏠 LOCADORES ESTADO COMPLETO:', locadores);
                              
                              // Se não tem locadores no array (não deveria acontecer), tentar fallback
                              if (locadorIds.length === 0 && contratoData?.locador_id) {
                                console.log('⚠️ FALLBACK: Usando locador_id antigo:', contratoData.locador_id);
                                return [contratoData.locador_id];
                              }
                              
                              return locadorIds;
                            })()}
                            readonly={isReadonly}
                          />
                        )}
                        
                        {(!contratoData && (isViewing || isEditing)) && (
                          <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do contrato...</p>
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>

                    {/* Outras abas - implementar nas próximas etapas */}
                    <TabsContent value="datas" className="space-y-8">
                      {/* Datas do Termo - EXATO COMO NO CADASTRO */}
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
                            <Calendar className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Datas do Termo
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Configure as datas importantes do termo, incluindo período de vigência e cálculo automático.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="data_assinatura">Data de Assinatura *</Label>
                            <InputWithIcon
                              id="data_assinatura"
                              type="date"
                              icon={Calendar}
                              value={contratoData?.data_assinatura || ''}
                              onChange={(e) => handleContratoInputChange('data_assinatura', e.target.value)}
                              disabled={isReadonly}
                            />
                            <p className="text-xs text-muted-foreground">Não pode ser uma data futura</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_entrega_chaves">Data de Entrega das Chaves</Label>
                            <InputWithIcon
                              id="data_entrega_chaves"
                              type="date"
                              icon={Calendar}
                              value={contratoData?.data_entrega_chaves || ''}
                              onChange={(e) => handleContratoInputChange('data_entrega_chaves', e.target.value)}
                              disabled={isReadonly}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="vencimento_dia">Dia do Vencimento do Aluguel</Label>
                            <InputWithIcon
                              id="vencimento_dia"
                              type="number"
                              min="1"
                              max="31"
                              icon={Calendar}
                              value={contratoData?.vencimento_dia || ''}
                              onChange={(e) => handleContratoInputChange('vencimento_dia', e.target.value)}
                              disabled={isReadonly}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_inicio">Data de Início do Termo *</Label>
                            <InputWithIcon
                              id="data_inicio"
                              type="date"
                              icon={Calendar}
                              value={contratoData?.data_inicio || ''}
                              onChange={(e) => {
                                const novaDataInicio = e.target.value;
                                handleContratoInputChange('data_inicio', novaDataInicio);
                                
                                // Calcular data de fim automaticamente se houver período definido
                                if (novaDataInicio && contratoData?.periodo_contrato) {
                                  const dataFimCalculada = calcularDataFim(novaDataInicio, contratoData?.periodo_contrato);
                                  handleContratoInputChange('data_fim', dataFimCalculada);
                                }
                                
                                // Calcular próximo reajuste automaticamente se houver período de reajuste
                                if (novaDataInicio && contratoData?.tempo_reajuste) {
                                  const proximoReajuste = calcularProximoReajuste(novaDataInicio, contratoData?.tempo_reajuste);
                                  handleContratoInputChange('proximo_reajuste', proximoReajuste);
                                }
                              }}
                              disabled={isReadonly}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="periodo_contrato">Período do Termo (meses)</Label>
                            <Select 
                              value={contratoData?.periodo_contrato?.toString()}
                              onValueChange={(value) => {
                                const periodo = parseInt(value);
                                handleContratoInputChange('periodo_contrato', periodo);
                                
                                // Calcular data de fim automaticamente se houver data de início
                                if (contratoData?.data_inicio && periodo) {
                                  const dataFimCalculada = calcularDataFim(contratoData?.data_inicio, periodo);
                                  handleContratoInputChange('data_fim', dataFimCalculada);
                                }
                              }}
                              disabled={isReadonly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData?.periodo_contrato ? `${contratoData?.periodo_contrato} meses` : "12 meses"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="indeterminado">Indeterminado</SelectItem>
                                <SelectItem value="6">6 meses</SelectItem>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="20">20 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                                <SelectItem value="30">30 meses</SelectItem>
                                <SelectItem value="36">36 meses</SelectItem>
                                <SelectItem value="48">48 meses</SelectItem>
                                <SelectItem value="60">60 meses</SelectItem>
                                <SelectItem value="120">120 meses</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Duração total do termo</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="data_fim">Data de Fim do Termo</Label>
                            <InputWithIcon
                              id="data_fim"
                              type="date"
                              icon={Calendar}
                              value={contratoData?.data_fim || ''}
                              disabled={true}
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Seção de Reajustes - FALTAVA ESTA SEÇÃO */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <ArrowUp className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Reajustes e Renovação
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Configure periodicidade e índices de reajuste
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="tempo_renovacao">Período de Renovação (meses)</Label>
                            <Select 
                              value={contratoData?.tempo_renovacao?.toString()}
                              onValueChange={(value) => handleContratoInputChange('tempo_renovacao', parseInt(value))}
                              disabled={isReadonly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData?.tempo_renovacao ? `${contratoData?.tempo_renovacao} meses` : "12 meses"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                                <SelectItem value="36">36 meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tempo_reajuste">Período de Reajuste (meses)</Label>
                            <Select 
                              value={contratoData?.tempo_reajuste?.toString()}
                              onValueChange={(value) => {
                                const tempoReajuste = parseInt(value);
                                handleContratoInputChange('tempo_reajuste', tempoReajuste);
                                
                                // Calcular próximo reajuste automaticamente se houver data de início
                                if (contratoData?.data_inicio && tempoReajuste) {
                                  const proximoReajuste = calcularProximoReajuste(contratoData?.data_inicio, tempoReajuste);
                                  handleContratoInputChange('proximo_reajuste', proximoReajuste);
                                }
                              }}
                              disabled={isReadonly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData?.tempo_reajuste ? `${contratoData?.tempo_reajuste} meses` : "12 meses"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="6">6 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Intervalo para aplicar reajuste de aluguel</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="indice_reajuste">Índice de Reajuste</Label>
                            <Select 
                              value={contratoData?.indice_reajuste}
                              onValueChange={(value) => handleContratoInputChange('indice_reajuste', value)}
                              disabled={isReadonly}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={contratoData?.indice_reajuste || "IPCA"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IPCA">IPCA</SelectItem>
                                <SelectItem value="IGPM">IGP-M</SelectItem>
                                <SelectItem value="INPC">INPC</SelectItem>
                                <SelectItem value="IPC">IPC</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="percentual_reajuste">Percentual de Reajuste (%)</Label>
                            <InputWithIcon
                              id="percentual_reajuste"
                              type="number"
                              step="0.01"
                              min="0"
                              icon={Percent}
                              value={contratoData?.percentual_reajuste || ''}
                              onChange={(e) => handleContratoInputChange('percentual_reajuste', e.target.value)}
                              disabled={isReadonly}
                            />
                            <p className="text-xs text-muted-foreground">Percentual aplicado no reajuste</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="ultimo_reajuste">Data do �sltimo Reajuste</Label>
                            <InputWithIcon
                              id="ultimo_reajuste"
                              type="date"
                              icon={Calendar}
                              value={contratoData?.ultimo_reajuste || ''}
                              onChange={(e) => handleContratoInputChange('ultimo_reajuste', e.target.value)}
                              disabled={isReadonly}
                            />
                            <p className="text-xs text-muted-foreground">�sltimo reajuste aplicado ao contrato</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="proximo_reajuste">Próximo Reajuste</Label>
                            <InputWithIcon
                              id="proximo_reajuste"
                              type="date"
                              icon={Calendar}
                              value={contratoData?.proximo_reajuste || ''}
                              disabled={true}
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground text-blue-600">
                              ✓ Calculado automaticamente: Data de Início + Período de Reajuste
                            </p>
                          </div>
                        </div>

                        {/* Checkboxes de Renovação */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="renovacao_automatica"
                              checked={contratoData?.renovacao_automatica || false}
                              onCheckedChange={(checked) => handleContratoInputChange('renovacao_automatica', !!checked)}
                              disabled={isReadonly}
                            />
                            <Label htmlFor="renovacao_automatica" className="flex items-center gap-2">
                              <ArrowUp className="w-4 h-4" />
                              Renovação Automática
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="proximo_reajuste_automatico"
                              checked={contratoData?.proximo_reajuste_automatico || false}
                              onCheckedChange={(checked) => handleContratoInputChange('proximo_reajuste_automatico', !!checked)}
                              disabled={isReadonly}
                            />
                            <Label htmlFor="proximo_reajuste_automatico" className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Reajuste Automático
                            </Label>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="valores" className="space-y-8">
                      {/* Valores e Encargos - EXATO COMO NO CADASTRO */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Valores e Encargos
                          </h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Configure todos os valores financeiros do termo, incluindo seguros, taxas e parcelamentos.
                        </p>

                        {/* Valores Principais */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <CreditCard className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Valores Mensais
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Valores recorrentes mensais do contrato
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="valor_aluguel">Aluguel *</Label>
                              <InputWithIcon
                                id="valor_aluguel"
                                type="number"
                                step="0.01"
                                min="0"
                                value={contratoData?.valor_aluguel || ''}
                                onChange={(e) => handleContratoInputChange('valor_aluguel', parseFloat(e.target.value) || 0)}
                                disabled={isReadonly}
                                placeholder="1500.00"
                                icon={DollarSign}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="valor_condominio">Condomínio</Label>
                              <InputWithIcon
                                id="valor_condominio"
                                type="number"
                                step="0.01"
                                min="0"
                                value={contratoData?.valor_condominio || ''}
                                onChange={(e) => handleContratoInputChange('valor_condominio', parseFloat(e.target.value) || 0)}
                                disabled={isReadonly}
                                placeholder="350.00"
                                icon={DollarSign}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="valor_fci">FCI</Label>
                              <InputWithIcon
                                id="valor_fci"
                                type="number"
                                step="0.01"
                                min="0"
                                value={contratoData?.valor_fci || ''}
                                onChange={(e) => handleContratoInputChange('valor_fci', parseFloat(e.target.value) || 0)}
                                disabled={isReadonly}
                                placeholder="R$ 0,00"
                                icon={DollarSign}
                              />
                              <p className="text-xs text-muted-foreground">Fundo de Conservação de Imóveis</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="taxa_administracao">Taxa de Administração (%)</Label>
                              <InputWithIcon
                                id="taxa_administracao"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                icon={Percent}
                                value={contratoData?.taxa_administracao || ''}
                                onChange={(e) => handleContratoInputChange('taxa_administracao', e.target.value)}
                                disabled={isReadonly}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="bonificacao">Bonificação</Label>
                              <InputWithIcon
                                id="bonificacao"
                                type="number"
                                step="0.01"
                                min="0"
                                value={contratoData?.bonificacao || ''}
                                onChange={(e) => handleContratoInputChange('bonificacao', parseFloat(e.target.value) || 0)}
                                disabled={isReadonly}
                                placeholder="R$ 0,00"
                                icon={DollarSign}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="multa_atraso">Multa por Atraso (%)</Label>
                              <InputWithIcon
                                id="multa_atraso"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                icon={Percent}
                                value={contratoData?.percentual_multa_atraso || ''}
                                onChange={(e) => handleContratoInputChange('multa_atraso', e.target.value)}
                                disabled={isReadonly}
                              />
                              <p className="text-xs text-muted-foreground">Percentual aplicado sobre o valor em atraso</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Seção de Seguros - FALTAVA ESTA SEÇÃO */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Seguros e IPTU
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Configure valores, datas e parcelamentos
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Seguro Fiança */}
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-blue-200 dark:border-blue-700">
                                <Shield className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-semibold text-foreground">Seguro Fiança</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_seguro_fianca">Valor Total</Label>
                                  <InputWithIcon
                                    id="valor_seguro_fianca"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={contratoData?.valor_seguro_fianca || ''}
                                    onChange={(e) => handleContratoInputChange('valor_seguro_fianca', parseFloat(e.target.value) || 0)}
                                    disabled={isReadonly}
                                    placeholder="0.00"
                                    icon={DollarSign}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_inicio_seguro_fianca">Data Início</Label>
                                  <InputWithIcon
                                    id="data_inicio_seguro_fianca"
                                    type="date"
                                    value={contratoData?.seguro_fianca_inicio || ''}
                                    onChange={(e) => {
                                      const novaDataInicio = e.target.value;
                                      handleContratoInputChange('data_inicio_seguro_fianca', novaDataInicio);
                                      
                                      // Calcular automaticamente a data fim se há parcelas definidas
                                      if (novaDataInicio && contratoData?.parcelas_seguro_fianca) {
                                        const dataFimCalculada = calcularDataFimPorParcelas(novaDataInicio, contratoData.parcelas_seguro_fianca);
                                        handleContratoInputChange('data_fim_seguro_fianca', dataFimCalculada);
                                      }
                                    }}
                                    disabled={isReadonly}
                                    icon={Calendar}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_fim_seguro_fianca">Data Fim</Label>
                                  <InputWithIcon
                                    id="data_fim_seguro_fianca"
                                    type="date"
                                    value={contratoData?.seguro_fianca_fim || ''}
                                    disabled={true}
                                    icon={Calendar}
                                    className="bg-muted/30"
                                  />
                                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="parcelas_seguro_fianca">Parcelas (meses)</Label>
                                  <InputWithIcon
                                    id="parcelas_seguro_fianca"
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={contratoData?.parcelas_seguro_fianca || ''}
                                    onChange={(e) => {
                                      const novasParcelas = parseInt(e.target.value) || 0;
                                      handleContratoInputChange('parcelas_seguro_fianca', novasParcelas);
                                      
                                      // Calcular automaticamente a data fim se há data início definida
                                      if (contratoData?.seguro_fianca_inicio && novasParcelas > 0) {
                                        const dataFimCalculada = calcularDataFimPorParcelas(contratoData.seguro_fianca_inicio, novasParcelas);
                                        handleContratoInputChange('data_fim_seguro_fianca', dataFimCalculada);
                                      }
                                    }}
                                    disabled={isReadonly}
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* Seguro Incêndio */}
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-orange-200 dark:border-orange-700">
                                <Shield className="w-4 h-4 text-orange-600" />
                                <h4 className="text-sm font-semibold text-foreground">Seguro Incêndio</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_seguro_incendio">Valor Total</Label>
                                  <InputWithIcon
                                    id="valor_seguro_incendio"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={contratoData?.valor_seguro_incendio || ''}
                                    onChange={(e) => handleContratoInputChange('valor_seguro_incendio', parseFloat(e.target.value) || 0)}
                                    disabled={isReadonly}
                                    placeholder="0.00"
                                    icon={DollarSign}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_inicio_seguro_incendio">Data Início</Label>
                                  <InputWithIcon
                                    id="data_inicio_seguro_incendio"
                                    type="date"
                                    value={contratoData?.seguro_incendio_inicio || ''}
                                    onChange={(e) => {
                                      const novaDataInicio = e.target.value;
                                      handleContratoInputChange('data_inicio_seguro_incendio', novaDataInicio);
                                      
                                      // Calcular automaticamente a data fim se há parcelas definidas
                                      if (novaDataInicio && contratoData?.parcelas_seguro_incendio) {
                                        const dataFimCalculada = calcularDataFimPorParcelas(novaDataInicio, contratoData.parcelas_seguro_incendio);
                                        handleContratoInputChange('data_fim_seguro_incendio', dataFimCalculada);
                                      }
                                    }}
                                    disabled={isReadonly}
                                    icon={Calendar}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="data_fim_seguro_incendio">Data Fim</Label>
                                  <InputWithIcon
                                    id="data_fim_seguro_incendio"
                                    type="date"
                                    value={contratoData?.seguro_incendio_fim || ''}
                                    disabled={true}
                                    icon={Calendar}
                                    className="bg-muted/30"
                                  />
                                  <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="parcelas_seguro_incendio">Parcelas (meses)</Label>
                                  <InputWithIcon
                                    id="parcelas_seguro_incendio"
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={contratoData?.parcelas_seguro_incendio || ''}
                                    onChange={(e) => {
                                      const novasParcelas = parseInt(e.target.value) || 0;
                                      handleContratoInputChange('parcelas_seguro_incendio', novasParcelas);
                                      
                                      // Calcular automaticamente a data fim se há data início definida
                                      if (contratoData?.seguro_incendio_inicio && novasParcelas > 0) {
                                        const dataFimCalculada = calcularDataFimPorParcelas(contratoData.seguro_incendio_inicio, novasParcelas);
                                        handleContratoInputChange('data_fim_seguro_incendio', dataFimCalculada);
                                      }
                                    }}
                                    disabled={isReadonly}
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                                </div>
                              </div>
                            </motion.div>

                            {/* IPTU */}
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-700">
                                <Building className="w-4 h-4 text-green-600" />
                                <h4 className="text-sm font-semibold text-foreground">IPTU</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2">
                                  <Label htmlFor="valor_iptu">Valor Total</Label>
                                  <InputWithIcon
                                    id="valor_iptu"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={contratoData?.valor_iptu || ''}
                                    onChange={(e) => handleContratoInputChange('valor_iptu', parseFloat(e.target.value) || 0)}
                                    disabled={isReadonly}
                                    placeholder="0.00"
                                    icon={DollarSign}
                                  />
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="data_inicio_iptu">Data Início</Label>
                                    <InputWithIcon
                                      id="data_inicio_iptu"
                                      type="date"
                                      value={contratoData?.data_inicio_iptu || ''}
                                      onChange={(e) => {
                                        const novaDataInicio = e.target.value;
                                        handleContratoInputChange('data_inicio_iptu', novaDataInicio);
                                        
                                        // Calcular automaticamente a data fim se há parcelas definidas
                                        if (novaDataInicio && contratoData?.parcelas_iptu) {
                                          const dataFimCalculada = calcularDataFimPorParcelas(novaDataInicio, contratoData.parcelas_iptu);
                                          handleContratoInputChange('data_fim_iptu', dataFimCalculada);
                                        }
                                      }}
                                      disabled={isReadonly}
                                      icon={Calendar}
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="data_fim_iptu">Data Fim</Label>
                                    <InputWithIcon
                                      id="data_fim_iptu"
                                      type="date"
                                      value={contratoData?.data_fim_iptu || ''}
                                      disabled={true}
                                      icon={Calendar}
                                      className="bg-muted/30"
                                    />
                                    <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="parcelas_iptu">Parcelas (meses)</Label>
                                  <InputWithIcon
                                    id="parcelas_iptu"
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={contratoData?.parcelas_iptu || ''}
                                    onChange={(e) => {
                                      const novasParcelas = parseInt(e.target.value) || 0;
                                      handleContratoInputChange('parcelas_iptu', novasParcelas);
                                      
                                      // Calcular automaticamente a data fim se há data início definida
                                      if (contratoData?.data_inicio_iptu && novasParcelas > 0) {
                                        const dataFimCalculada = calcularDataFimPorParcelas(contratoData.data_inicio_iptu, novasParcelas);
                                        handleContratoInputChange('data_fim_iptu', dataFimCalculada);
                                      }
                                    }}
                                    disabled={isReadonly}
                                    icon={CreditCard}
                                  />
                                  <p className="text-xs text-muted-foreground">Cada parcela = 1 mês de cobertura</p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Seção Retidos e Antecipação - FALTAVA */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Clock className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Retidos e Antecipação
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Configure quais valores serão retidos ou antecipados
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Valores Retidos */}
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.4 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-red-200 dark:border-red-700">
                                <ArrowDown className="w-4 h-4 text-red-600" />
                                <h4 className="text-sm font-semibold text-foreground">Valores Retidos</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4">
                                Valores descontados do aluguel do proprietário
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_fci"
                                    checked={contratoData?.retido_fci || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('retido_fci', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <DollarSign className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">FCI</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_iptu"
                                    checked={contratoData?.retido_iptu || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('retido_iptu', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Building className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">IPTU</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_condominio"
                                    checked={contratoData?.retido_condominio || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('retido_condominio', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Building className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">Condomínio</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_seguro_fianca"
                                    checked={contratoData?.retido_seguro_fianca || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('retido_seguro_fianca', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Fiança</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="retido_seguro_incendio"
                                    checked={contratoData?.retido_seguro_incendio || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('retido_seguro_incendio', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Incêndio</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>

                            {/* Valores Antecipados */}
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                              className="space-y-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex items-center gap-2 pb-2 border-b border-green-200 dark:border-green-700">
                                <ArrowUp className="w-4 h-4 text-green-600" />
                                <h4 className="text-sm font-semibold text-foreground">Valores Antecipados</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-4">
                                Valores pagos antecipadamente pelo inquilino
                              </p>
                              
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="antecipa_condominio"
                                    checked={contratoData?.antecipa_condominio || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('antecipa_condominio', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Building className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium flex-1">Condomínio</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="antecipa_seguro_fianca"
                                    checked={contratoData?.antecipa_seguro_fianca || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('antecipa_seguro_fianca', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Fiança</span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                                  <Checkbox
                                    id="antecipa_seguro_incendio"
                                    checked={contratoData?.antecipa_seguro_incendio || false}
                                    onCheckedChange={(checked) => handleContratoInputChange('antecipa_seguro_incendio', !!checked)}
                                    disabled={isReadonly}
                                  />
                                  <div className="flex items-center gap-2 flex-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium flex-1">Seguro Incêndio</span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </TabsContent>

                    <TabsContent value="garantias" className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Garantias do Contrato
                          </h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Configure o tipo de garantia e forneça as informações necessárias conforme a modalidade escolhida.
                        </p>

                        {/* Seleção do Tipo de Garantia */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <motion.div 
                              className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">
                                Tipo de Garantia
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Selecione a modalidade de garantia
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Tipo de Garantia *</Label>
                            <Select 
                              value={contratoData?.tipo_garantia || ''}
                              disabled={isReadonly}
                              onValueChange={!isReadonly ? (value) => handleContratoInputChange('tipo_garantia', value) : undefined}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de garantia..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Fiador">Fiador</SelectItem>
                                <SelectItem value="Caução">Caução</SelectItem>
                                <SelectItem value="Seguro-fiança">Seguro Fiança</SelectItem>
                                <SelectItem value="Título de Capitalização">Título de Capitalização</SelectItem>
                                <SelectItem value="Sem garantia">Sem Garantia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </motion.div>

                        {/* Formulários dinâmicos baseados no tipo de garantia */}
                        {contratoData?.tipo_garantia === 'Fiador' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <User className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Fiadores
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações dos fiadores do contrato
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              {/* Dados básicos do fiador */}
                              {isViewing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Nome do Fiador</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData?.fiador_nome || 'Não informado'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <IdCard className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData?.fiador_cpf || 'Não informado'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData?.fiador_telefone || 'Não informado'}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">{contratoData?.fiador_email || 'Não informado'}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_nome">Nome do Fiador</Label>
                                    <InputWithIcon
                                      id="fiador_nome"
                                      type="text"
                                      value={contratoData?.fiador_nome || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_nome', e.target.value)}
                                      placeholder="Nome completo do fiador"
                                      icon={User}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_cpf">CPF/CNPJ</Label>
                                    <InputWithIcon
                                      id="fiador_cpf"
                                      type="text"
                                      value={contratoData?.fiador_cpf || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_cpf', e.target.value)}
                                      placeholder="000.000.000-00"
                                      icon={IdCard}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_telefone">Telefone</Label>
                                    <InputWithIcon
                                      id="fiador_telefone"
                                      type="text"
                                      value={contratoData?.fiador_telefone || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_telefone', e.target.value)}
                                      placeholder="(00) 00000-0000"
                                      icon={Phone}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="fiador_email">E-mail</Label>
                                    <InputWithIcon
                                      id="fiador_email"
                                      type="email"
                                      value={contratoData?.fiador_email || ''}
                                      onChange={(e) => handleContratoInputChange('fiador_email', e.target.value)}
                                      placeholder="email@exemplo.com"
                                      icon={Mail}
                                    />
                                  </div>
                                </div>
                              )}

                              {isViewing ? (
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-muted-foreground">Endereço Completo</Label>
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                                    <span className="text-sm text-foreground">{contratoData?.fiador_endereco || 'Não informado'}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor="fiador_endereco">Endereço Completo</Label>
                                  <Textarea
                                    id="fiador_endereco"
                                    value={contratoData?.fiador_endereco || ''}
                                    onChange={(e) => handleContratoInputChange('fiador_endereco', e.target.value)}
                                    placeholder="Endereço completo do fiador..."
                                    rows={3}
                                    disabled={isReadonly}
                                  />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {contratoData?.tipo_garantia === 'Caução' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-yellow-500 to-orange-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Banknote className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Caução
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações sobre a caução
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="caucao_tipo">Tipo de Caução</Label>
                                  <Select 
                                    value={contratoData?.caucao_tipo || ''}
                                    disabled={isReadonly}
                                    onValueChange={!isReadonly ? (value) => handleContratoInputChange('caucao_tipo', value) : undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                      <SelectItem value="titulo">Título/Aplicação</SelectItem>
                                      <SelectItem value="imovel">Imóvel</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="caucao_valor">Valor da Caução</Label>
                                  <InputWithIcon
                                    id="caucao_valor"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={contratoData?.caucao_valor || ''}
                                    onChange={(e) => handleContratoInputChange('caucao_valor', parseFloat(e.target.value) || 0)}
                                    disabled={isReadonly}
                                    placeholder="0.00"
                                    icon={DollarSign}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="caucao_descricao">Descrição</Label>
                                <Textarea
                                  id="caucao_descricao"
                                  value={contratoData?.caucao_descricao || ''}
                                  disabled={isReadonly}
                                  onChange={!isReadonly ? (e) => handleContratoInputChange('caucao_descricao', e.target.value) : undefined}
                                  placeholder="Detalhes sobre a caução..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {contratoData?.tipo_garantia === 'Seguro-fiança' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Shield className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Seguro Fiança
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações sobre o seguro fiança
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="seguro_seguradora">Seguradora</Label>
                                  <InputWithIcon
                                    id="seguro_seguradora"
                                    type="text"
                                    value={contratoData?.seguro_seguradora || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('seguro_seguradora', e.target.value) : undefined}
                                    placeholder="Nome da seguradora"
                                    icon={Building}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="seguro_apolice">Número da Apólice</Label>
                                  <InputWithIcon
                                    id="seguro_apolice"
                                    type="text"
                                    value={contratoData?.seguro_apolice || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('seguro_apolice', e.target.value) : undefined}
                                    placeholder="Número da apólice"
                                    icon={FileText}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="seguro_valor_cobertura">Valor da Cobertura</Label>
                                  <InputWithIcon
                                    id="seguro_valor_cobertura"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={contratoData?.seguro_valor_cobertura || ''}
                                    onChange={(e) => handleContratoInputChange('seguro_valor_cobertura', parseFloat(e.target.value) || 0)}
                                    disabled={isReadonly}
                                    placeholder="0.00"
                                    icon={DollarSign}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="seguro_vigencia">Vigência</Label>
                                  <InputWithIcon
                                    id="seguro_vigencia"
                                    type="date"
                                    value={contratoData?.seguro_vigencia || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('seguro_vigencia', e.target.value) : undefined}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {contratoData?.tipo_garantia === 'Título de Capitalização' && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <motion.div 
                                className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-indigo-500 to-blue-500"
                                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <CreditCard className="w-5 h-5 text-white" />
                              </motion.div>
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  Título de Capitalização
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Informações sobre o título de capitalização
                                </p>
                              </div>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="titulo_empresa">Empresa Emissora</Label>
                                  <InputWithIcon
                                    id="titulo_empresa"
                                    type="text"
                                    value={contratoData?.titulo_empresa || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('titulo_empresa', e.target.value) : undefined}
                                    placeholder="Nome da empresa"
                                    icon={Building}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="titulo_numero">Número do Título</Label>
                                  <InputWithIcon
                                    id="titulo_numero"
                                    type="text"
                                    value={contratoData?.titulo_numero || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('titulo_numero', e.target.value) : undefined}
                                    placeholder="Número do título"
                                    icon={FileText}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="titulo_valor">Valor do Título</Label>
                                  <InputWithIcon
                                    id="titulo_valor"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={contratoData?.titulo_valor || ''}
                                    onChange={(e) => handleContratoInputChange('titulo_valor', parseFloat(e.target.value) || 0)}
                                    disabled={isReadonly}
                                    placeholder="0.00"
                                    icon={DollarSign}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="titulo_vencimento">Data de Vencimento</Label>
                                  <InputWithIcon
                                    id="titulo_vencimento"
                                    type="date"
                                    value={contratoData?.titulo_vencimento || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('titulo_vencimento', e.target.value) : undefined}
                                    icon={Calendar}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      </div>
                    </TabsContent>

                    <TabsContent value="plano" className="space-y-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <FileText className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Taxas e Comissões
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Insira diretamente os valores das taxas aplicáveis ao contrato
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="plano_taxa_administracao">Taxa de Administração (%)</Label>
                              <InputWithIcon
                                id="plano_taxa_administracao"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                icon={Percent}
                                value={contratoData?.taxa_administracao || ''}
                                onChange={(e) => handleContratoInputChange('taxa_administracao', parseFloat(e.target.value) || 0)}
                                disabled={isReadonly}
                                placeholder="Ex: 10.00"
                              />
                              <p className="text-xs text-muted-foreground">Taxa percentual aplicada sobre o valor do aluguel</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="taxa_locacao_calculada">Taxa de Locação (%)</Label>
                              <InputWithIcon
                                id="taxa_locacao_calculada"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                icon={Percent}
                                value={contratoData?.taxa_locacao_calculada || ''}
                                onChange={(e) => handleContratoInputChange('taxa_locacao_calculada', parseFloat(e.target.value) || 0)}
                                disabled={isReadonly}
                                placeholder="Ex: 5.00"
                              />
                              <p className="text-xs text-muted-foreground">Taxa percentual de locação</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="tem_corretor"
                              checked={contratoData?.tem_corretor || false}
                              disabled={isReadonly}
                              onCheckedChange={!isReadonly ? (checked) => handleContratoInputChange('tem_corretor', !!checked) : undefined}
                            />
                            <Label htmlFor="tem_corretor" className="cursor-pointer text-foreground">
                              Há corretor nesta locação
                            </Label>
                          </div>

                          {/* Dados Bancários do Corretor - Aparece quando tem_corretor é true */}
                          {contratoData?.tem_corretor && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4 pt-4 border-t border-border"
                            >
                              <h4 className="text-sm font-semibold text-foreground">
                                Dados do Corretor
                              </h4>

                              {/* Dados Pessoais do Corretor */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="corretor_nome">Nome do Corretor</Label>
                                  <InputWithIcon
                                    id="corretor_nome"
                                    type="text"
                                    value={contratoData?.corretor_nome || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('corretor_nome', e.target.value) : undefined}
                                    placeholder="Nome completo do corretor"
                                    icon={User}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_cpf">CPF do Corretor</Label>
                                  <InputWithIcon
                                    id="corretor_cpf"
                                    type="text"
                                    value={contratoData?.corretor_cpf || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('corretor_cpf', e.target.value) : undefined}
                                    placeholder="000.000.000-00"
                                    icon={IdCard}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_creci">CRECI</Label>
                                  <InputWithIcon
                                    id="corretor_creci"
                                    type="text"
                                    value={contratoData?.corretor_creci || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('corretor_creci', e.target.value) : undefined}
                                    placeholder="Número do CRECI"
                                    icon={Shield}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_telefone">Telefone do Corretor</Label>
                                  <InputWithIcon
                                    id="corretor_telefone"
                                    type="text"
                                    value={contratoData?.corretor_telefone || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('corretor_telefone', e.target.value) : undefined}
                                    placeholder="(00) 00000-0000"
                                    icon={Phone}
                                  />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="corretor_email">Email do Corretor</Label>
                                  <InputWithIcon
                                    id="corretor_email"
                                    type="email"
                                    value={contratoData?.corretor_email || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => handleContratoInputChange('corretor_email', e.target.value) : undefined}
                                    placeholder="email@exemplo.com"
                                    icon={Mail}
                                  />
                                </div>
                              </div>

                              {/* Dados Bancários do Corretor */}
                              <div className="space-y-4 pt-4 border-t border-border">
                                <h5 className="text-sm font-semibold text-foreground">
                                  Dados Bancários do Corretor
                                </h5>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="corretor_banco">Banco</Label>
                                  <InputWithIcon
                                    id="corretor_banco"
                                    type="text"
                                    value={contratoData?.dados_bancarios_corretor?.banco || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => {
                                      const dados = { ...(contratoData?.dados_bancarios_corretor || {}) };
                                      dados.banco = e.target.value;
                                      handleContratoInputChange('dados_bancarios_corretor', dados);
                                    } : undefined}
                                    placeholder="Nome do banco"
                                    icon={Building}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_agencia">Agência</Label>
                                  <InputWithIcon
                                    id="corretor_agencia"
                                    type="text"
                                    value={contratoData?.dados_bancarios_corretor?.agencia || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => {
                                      const dados = { ...(contratoData?.dados_bancarios_corretor || {}) };
                                      dados.agencia = e.target.value;
                                      handleContratoInputChange('dados_bancarios_corretor', dados);
                                    } : undefined}
                                    placeholder="0000"
                                    icon={MapPin}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_conta">Conta</Label>
                                  <InputWithIcon
                                    id="corretor_conta"
                                    type="text"
                                    value={contratoData?.dados_bancarios_corretor?.conta || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => {
                                      const dados = { ...(contratoData?.dados_bancarios_corretor || {}) };
                                      dados.conta = e.target.value;
                                      handleContratoInputChange('dados_bancarios_corretor', dados);
                                    } : undefined}
                                    placeholder="00000-0"
                                    icon={CreditCard}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_tipo_conta">Tipo de Conta</Label>
                                  <Select
                                    value={contratoData?.dados_bancarios_corretor?.tipo_conta || ''}
                                    disabled={isReadonly}
                                    onValueChange={!isReadonly ? (value) => {
                                      const dados = { ...(contratoData?.dados_bancarios_corretor || {}) };
                                      dados.tipo_conta = value;
                                      handleContratoInputChange('dados_bancarios_corretor', dados);
                                    } : undefined}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo de conta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                                      <SelectItem value="salario">Conta Salário</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_chave_pix">Chave PIX</Label>
                                  <InputWithIcon
                                    id="corretor_chave_pix"
                                    type="text"
                                    value={contratoData?.dados_bancarios_corretor?.chave_pix || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => {
                                      const dados = { ...(contratoData?.dados_bancarios_corretor || {}) };
                                      dados.chave_pix = e.target.value;
                                      handleContratoInputChange('dados_bancarios_corretor', dados);
                                    } : undefined}
                                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                                    icon={Smartphone}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="corretor_titular">Titular da Conta</Label>
                                  <InputWithIcon
                                    id="corretor_titular"
                                    type="text"
                                    value={contratoData?.dados_bancarios_corretor?.titular || ''}
                                    disabled={isReadonly}
                                    onChange={!isReadonly ? (e) => {
                                      const dados = { ...(contratoData?.dados_bancarios_corretor || {}) };
                                      dados.titular = e.target.value;
                                      handleContratoInputChange('dados_bancarios_corretor', dados);
                                    } : undefined}
                                    placeholder="Nome completo do titular"
                                    icon={User}
                                  />
                                </div>
                              </div>
                            </div>
                            </motion.div>
                          )}
                        </div>

                      </motion.div>
                    </TabsContent>

                    <TabsContent value="clausulas" className="space-y-8">


                      {/* Animais de Estimação */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-pink-500 to-purple-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Animais de Estimação
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Registro de pets permitidos no imóvel
                            </p>
                          </div>
                        </div>

                        {isViewing ? (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-muted-foreground">Quantidade de Pets Permitidos</Label>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                <Heart className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">
                                  {contratoData?.quantidade_pets || 0} {contratoData?.quantidade_pets === 1 ? 'pet' : 'pets'}
                                </span>
                              </div>
                            </div>

                            {(contratoData?.quantidade_pets > 0) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 border border-border rounded-xl bg-muted/20 space-y-4"
                              >
                                <h4 className="text-lg font-semibold text-foreground">Informações dos Pets</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Raças dos Animais</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Heart className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">
                                        {contratoData?.pets_racas || 'Não informado'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Tamanhos dos Animais</Label>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                      <Heart className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-foreground">
                                        {contratoData?.pets_tamanhos || 'Não informado'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label>Quantidade de Pets</Label>
                              <InputWithIcon
                                type="number"
                                min="0"
                                max="10"
                                value={contratoData?.quantidade_pets || 0}
                                onChange={(e) => handleContratoInputChange('quantidade_pets', parseInt(e.target.value) || 0)}
                                icon={Heart}
                              />
                            </div>

                            {/* Lista detalhada de pets individuais */}
                            {(contratoData?.quantidade_pets > 0) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                              >
                                {Array.from({ length: contratoData.quantidade_pets || 0 }, (_, index) => (
                                  <div 
                                    key={index}
                                    className="p-4 border border-border rounded-xl bg-muted/20 space-y-4"
                                  >
                                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                      <Heart className="w-5 h-5 text-pink-500" />
                                      Pet #{index + 1}
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Nome do Pet</Label>
                                        <InputWithIcon
                                          type="text"
                                          value={contratoData?.pets?.[index]?.nome || ''}
                                          onChange={(e) => {
                                            const newPets = [...(contratoData?.pets || [])];
                                            if (!newPets[index]) newPets[index] = {};
                                            newPets[index].nome = e.target.value;
                                            handleContratoInputChange('pets', newPets);
                                          }}
                                          placeholder="Nome do animal"
                                          icon={Heart}
                                          disabled={isReadonly}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Espécie</Label>
                                        <Select 
                                          value={contratoData?.pets?.[index]?.tipo || ''}
                                          disabled={isReadonly}
                                          onValueChange={(value) => {
                                            const newPets = [...(contratoData?.pets || [])];
                                            if (!newPets[index]) newPets[index] = {};
                                            newPets[index].tipo = value;
                                            handleContratoInputChange('pets', newPets);
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione a espécie" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Cão">Cão</SelectItem>
                                            <SelectItem value="Gato">Gato</SelectItem>
                                            <SelectItem value="Pássaro">Pássaro</SelectItem>
                                            <SelectItem value="Peixe">Peixe</SelectItem>
                                            <SelectItem value="Outro">Outro</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Raça</Label>
                                        <InputWithIcon
                                          type="text"
                                          value={contratoData?.pets?.[index]?.raca || ''}
                                          onChange={(e) => {
                                            const newPets = [...(contratoData?.pets || [])];
                                            if (!newPets[index]) newPets[index] = {};
                                            newPets[index].raca = e.target.value;
                                            handleContratoInputChange('pets', newPets);
                                          }}
                                          placeholder="Ex: Labrador, SRD"
                                          icon={Heart}
                                          disabled={isReadonly}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Tamanho</Label>
                                        <Select 
                                          value={contratoData?.pets?.[index]?.tamanho || ''}
                                          disabled={isReadonly}
                                          onValueChange={(value) => {
                                            const newPets = [...(contratoData?.pets || [])];
                                            if (!newPets[index]) newPets[index] = {};
                                            newPets[index].tamanho = value;
                                            handleContratoInputChange('pets', newPets);
                                          }}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tamanho" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Pequeno">Pequeno</SelectItem>
                                            <SelectItem value="Médio">Médio</SelectItem>
                                            <SelectItem value="Grande">Grande</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Idade</Label>
                                        <InputWithIcon
                                          type="number"
                                          min="0"
                                          max="30"
                                          value={contratoData?.pets?.[index]?.idade || 0}
                                          onChange={(e) => {
                                            const newPets = [...(contratoData?.pets || [])];
                                            if (!newPets[index]) newPets[index] = {};
                                            newPets[index].idade = parseInt(e.target.value) || 0;
                                            handleContratoInputChange('pets', newPets);
                                          }}
                                          placeholder="Idade em anos"
                                          icon={Heart}
                                          disabled={isReadonly}
                                        />
                                      </div>

                                      <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`pet_vacinacao_${index}`}
                                            checked={contratoData?.pets?.[index]?.vacinacao_em_dia || false}
                                            disabled={isReadonly}
                                            onCheckedChange={(checked) => {
                                              const newPets = [...(contratoData?.pets || [])];
                                              if (!newPets[index]) newPets[index] = {};
                                              newPets[index].vacinacao_em_dia = !!checked;
                                              handleContratoInputChange('pets', newPets);
                                            }}
                                          />
                                          <Label htmlFor={`pet_vacinacao_${index}`} className="text-sm font-medium">
                                            Vacinação em dia
                                          </Label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )}
                      </motion.div>

                      {/* Informações Adicionais */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <motion.div 
                            className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                            transition={{ duration: 0.3 }}
                          >
                            <FileText className="w-6 h-6 text-white" />
                          </motion.div>
                          <h2 className="text-xl font-semibold text-foreground">
                            Informações Adicionais
                          </h2>
                        </div>

                        {isViewing ? (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Cláusulas Adicionais</Label>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                              <span className="text-sm text-foreground">
                                {contratoData?.clausulas_adicionais || 'Nenhuma cláusula adicional definida'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Cláusulas Adicionais</Label>
                            <Textarea
                              value={contratoData?.clausulas_adicionais || ''}
                              onChange={(e) => handleContratoInputChange('clausulas_adicionais', e.target.value)}
                              placeholder="Cláusulas especiais do contrato..."
                              rows={4}
                              disabled={isReadonly}
                            />
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>

                    {/* Aba 7: Histórico (apenas em visualização/edição) */}
                    {(isViewing || isEditing) && (
                      <TabsContent value="historico" className="space-y-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                        >
                          <HistoricoContrato contratoId={contratoData?.id} />
                        </motion.div>
                      </TabsContent>
                    )}
                  </Tabs>

                  {/* Botão Salvar Alterações (apenas em modo editar) */}
                  {isEditing && (
                    <div className="pt-6 border-t">
                      <Button 
                        type="button"
                        onClick={handleSaveContract}
                        disabled={loading}
                        className="w-full btn-gradient py-4 text-lg font-semibold rounded-xl border-0 shadow-xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Salvando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>Salvar Alterações</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Botão Cadastrar Termo (apenas em modo cadastro) */}
                  {(!isViewing && !isEditing) && (
                    <div className="pt-6 border-t">
                      <Button 
                        type="submit"
                        disabled={loading}
                        className="w-full btn-gradient py-4 text-lg font-semibold rounded-xl border-0 shadow-xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            <span>Cadastrando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span>Cadastrar Termo</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
};
