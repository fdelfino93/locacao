import React, { useState, useEffect } from 'react';
import '../../styles/imoveis-override.css';
import { getApiUrl } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Input } from '../ui/input';
import { InputMask } from '../ui/input-mask';
import { CurrencyInput } from '../ui/currency-input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, type RadioOption } from '../ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { FileUpload } from '../ui/file-upload';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  FileText,
  UserCheck,
  Home,
  Users,
  Car,
  Flame,
  PawPrint,
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  Receipt,
  Bed,
  Bath,
  Sofa,
  ChefHat,
  Building,
  Plus,
  Trash2,
  Mail,
  Phone,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import type { Imovel, Endereco, InformacoesIPTU, InformacoesCondominio, DadosGeraisImovel } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';

const estadosBrasil = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' }, { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' }, { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' }, { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' }, { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' }, { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' }, { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' }, { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' }, { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' }, { value: 'TO', label: 'TO' }
];

const mobiliadoOptions: RadioOption[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'parcialmente', label: 'Parcialmente' }
];

const simNaoOptions: RadioOption[] = [
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' }
];

interface ModernImovelFormV2Props {
  onBack?: () => void;
  isEditing?: boolean;
  isViewing?: boolean;
}

export const ModernImovelFormV2: React.FC<ModernImovelFormV2Props> = ({ onBack, isEditing = false, isViewing = false }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Controle de modo de visualização
  const isReadOnly = isViewing;

  // Estados separados para melhor organização
  const [endereco, setEndereco] = useState<Endereco>({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'PR',
    cep: ''
  });

  const [informacoesIPTU, setInformacoesIPTU] = useState<InformacoesIPTU>({
    titular: '',
    inscricao_imobiliaria: '',
    indicacao_fiscal: ''
  });

  const [informacoesCondominio, setInformacoesCondominio] = useState<InformacoesCondominio>({
    nome_condominio: '',
    sindico_condominio: '',
    cnpj_condominio: '',
    email_condominio: '',
    telefone_condominio: ''
  });

  const [dadosGerais, setDadosGerais] = useState<DadosGeraisImovel>({
    quartos: 0,
    suites: 0,
    banheiros: 0,
    salas: 0,
    cozinha: 0,
    tem_garagem: false,
    qtd_garagem: 0,
    tem_sacada: false,
    qtd_sacada: undefined,
    tem_churrasqueira: false,
    qtd_churrasqueira: undefined,
    mobiliado: 'nao',
    permite_pets: false,
    area_total: '',
    area_construida: '',
    area_privativa: '',
    ano_construcao: '',
    elevador: false,
    andar: '',
    caracteristicas: ''
  });
  
  // Estado para proprietários com responsabilidade principal
  const [proprietarios, setProprietarios] = useState<Array<{
    cliente_id: number;
    responsabilidade_principal: boolean;
  }>>([]);
  
  const [clientesSelecionados, setClientesSelecionados] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<Omit<Imovel, 'endereco' | 'informacoes_iptu' | 'informacoes_condominio' | 'dados_gerais'>>({
    id_cliente: 0,
    id_inquilino: 0,
    tipo: '',
    status: '',
    valor_aluguel: 0,
    iptu: 0,
    condominio: 0,
    taxa_incendio: 0,
    matricula_imovel: '',
    area_imovel: '',
    permite_pets: false,
    info_iptu: '',
    observacoes_condominio: '',
    copel_unidade_consumidora: '',
    sanepar_matricula: '',
    tem_gas: false,
    info_gas: '',
    boleto_condominio: false,
    observacoes: ''
  });

  // Estado separado para controlar se tem condomínio
  const [temCondominio, setTemCondominio] = useState(false);

  // Sincronizar estado do condomínio com os dados existentes
  useEffect(() => {
    setTemCondominio(formData.condominio > 0 || formData.observacoes_condominio !== '' || formData.boleto_condominio);
  }, [formData.condominio, formData.observacoes_condominio, formData.boleto_condominio]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      setApiError(null);
      
      try {
        await apiService.healthCheck();
        
        const [locadoresResponse, locatariosResponse] = await Promise.all([
          apiService.listarLocadores().catch(() => ({ success: false, data: [] })),
          apiService.listarLocatarios().catch(() => ({ success: false, data: [] }))
        ]);

        if (locadoresResponse.success && locadoresResponse.data) {
          setClientes(locadoresResponse.data);
        }

        if (locatariosResponse.success && locatariosResponse.data) {
          setInquilinos(locatariosResponse.data);
        }

        if ((!locadoresResponse.success || !locadoresResponse.data) && 
            (!locatariosResponse.success || !locatariosResponse.data)) {
          setApiError('Alguns dados podem não estar disponíveis.');
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setApiError('API não está disponível. Inicie o backend.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Hook para carregar dados do imóvel quando em modo de edição ou visualização
  useEffect(() => {
    if (isEditing || isViewing) {
      const pathParts = window.location.pathname.split('/');
      const imovelId = pathParts[pathParts.length - 1];
      if (imovelId && imovelId !== 'editar' && imovelId !== 'visualizar') {
        carregarDadosImovel(parseInt(imovelId));
      }
    }
  }, [isEditing, isViewing]);

  const carregarDadosImovel = async (imovelId: number) => {
    setLoadingData(true);
    try {
      console.log('🔍 Carregando imóvel ID:', imovelId);
      
      // Primeiro tentar API específica por ID
      let response = await fetch(getApiUrl(`/imoveis/${imovelId}`));
      
      if (!response.ok) {
        // Se não funcionar, usar busca geral e filtrar pelo ID exato
        console.log('⚠️ API específica falhou, usando busca geral');
        response = await fetch(getApiUrl('/imoveis'));
      }
      
      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      
      let imovel = null;
      
      if (data.success) {
        if (data.data && !Array.isArray(data.data)) {
          // Resposta da API específica
          imovel = data.data;
        } else if (data.data && Array.isArray(data.data)) {
          // Resposta da busca geral - filtrar pelo ID exato
          imovel = data.data.find((im: any) => im.id === imovelId);
        }
      }
      
      if (imovel) {
        console.log('✅ Imóvel encontrado:', imovel);
        preencherFormularioComDados(imovel);
      } else {
        console.error('❌ Imóvel não encontrado');
        setApiError(`Imóvel com ID ${imovelId} não foi encontrado.`);
      }
    } catch (error) {
      console.error('💥 Erro ao carregar imóvel:', error);
      setApiError('Erro ao carregar dados do imóvel.');
    } finally {
      setLoadingData(false);
    }
  };

  const preencherFormularioComDados = (imovel: any) => {
    // Preencher endereço se disponível
    if (imovel.endereco_estruturado) {
      // Priorizar endereço estruturado com campos separados
      setEndereco({
        rua: imovel.endereco_estruturado.rua || '',
        numero: imovel.endereco_estruturado.numero || '',
        complemento: imovel.endereco_estruturado.complemento || '',
        bairro: imovel.endereco_estruturado.bairro || '',
        cidade: imovel.endereco_estruturado.cidade || '',
        estado: imovel.endereco_estruturado.estado || 'PR',
        cep: imovel.endereco_estruturado.cep || ''
      });
    } else if (imovel.endereco) {
      // Se endereco é uma string, usar apenas como rua
      if (typeof imovel.endereco === 'string') {
        setEndereco(prev => ({
          ...prev,
          rua: imovel.endereco
        }));
      } else {
        // Se endereco é um objeto, usar todos os campos
        setEndereco({
          rua: imovel.endereco.rua || '',
          numero: imovel.endereco.numero || '',
          complemento: imovel.endereco.complemento || '',
          bairro: imovel.endereco.bairro || '',
          cidade: imovel.endereco.cidade || '',
          estado: imovel.endereco.estado || 'PR',
          cep: imovel.endereco.cep || ''
        });
      }
    }

    // Preencher dados gerais do imóvel
    setDadosGerais({
      quartos: imovel.quartos || 0,
      suites: imovel.suites || 0,
      banheiros: imovel.banheiros || 0,
      salas: imovel.salas || 0,
      cozinha: imovel.cozinha || 0,
      tem_garagem: (imovel.vagas_garagem && imovel.vagas_garagem > 0) || false,
      qtd_garagem: imovel.vagas_garagem || 0,
      area_total: imovel.area_total || '',
      area_construida: imovel.metragem_construida || imovel.area_construida || '',
      area_privativa: imovel.area_privativa || '',
      ano_construcao: imovel.ano_construcao || '',
      elevador: imovel.elevador === true || imovel.elevador === 'true' || imovel.elevador === 'True',
      andar: imovel.andar || '',
      mobiliado: (() => {
        // ✅ CORREÇÃO: Tratar diferentes tipos que podem vir do backend
        const mobiliado = imovel.mobiliado;
        if (mobiliado === true || mobiliado === 'true' || mobiliado === 'True' || mobiliado === 1 || mobiliado === '1') {
          return 'sim';
        } else if (mobiliado === false || mobiliado === 'false' || mobiliado === 'False' || mobiliado === 0 || mobiliado === '0') {
          return 'nao';
        }
        // Default para 'nao' se valor for indefinido
        return 'nao';
      })(),
      permite_pets: imovel.aceita_pets === true || imovel.aceita_pets === 'true' || imovel.permite_pets === true || imovel.permite_pets === 'true',
      tem_sacada: imovel.tem_sacada === true || imovel.tem_sacada === 'true' || imovel.tem_sacada === 'True',
      qtd_sacada: imovel.qtd_sacada || undefined,
      tem_churrasqueira: imovel.tem_churrasqueira === true || imovel.tem_churrasqueira === 'true' || imovel.tem_churrasqueira === 'True',
      qtd_churrasqueira: imovel.qtd_churrasqueira || undefined,
      caracteristicas: imovel.caracteristicas || imovel.dados_imovel || ''
    });

    // Preencher informações do IPTU - CORREÇÃO: usar campos diretos do banco
    setInformacoesIPTU({
      titular: imovel.titular_iptu || '',
      inscricao_imobiliaria: imovel.inscricao_imobiliaria || '',
      indicacao_fiscal: imovel.indicacao_fiscal || ''
    });

    // Preencher informações do Condomínio
    setInformacoesCondominio({
      nome_condominio: imovel.nome_condominio || '',
      sindico_condominio: imovel.sindico_condominio || '',
      cnpj_condominio: imovel.cnpj_condominio || '',
      email_condominio: imovel.email_condominio || '',
      telefone_condominio: imovel.telefone_condominio || ''
    });

    // Preencher dados principais do formulário
    setFormData({
      id_cliente: imovel.id_locador || 0,
      id_inquilino: imovel.id_locatario || 0,
      tipo: imovel.tipo || 'Apartamento',
      status: imovel.status || 'Disponível',
      valor_aluguel: imovel.valor_aluguel || 0,
      iptu: imovel.iptu || 0,
      condominio: imovel.condominio || 0,
      taxa_incendio: imovel.taxa_incendio || 0,
      observacoes_condominio: imovel.observacoes_condominio || '',
      boleto_condominio: imovel.boleto_condominio || false,
      matricula_imovel: imovel.matricula_imovel || '',
      area_imovel: imovel.area_imovel || '',
      permite_pets: imovel.aceita_pets || imovel.permite_pets || false,
      copel_unidade_consumidora: imovel.copel_unidade_consumidora || '',
      sanepar_matricula: imovel.sanepar_matricula || '',
      tem_gas: imovel.tem_gas === true || imovel.tem_gas === 'true' || imovel.tem_gas === 'True',
      info_gas: imovel.info_gas || '',
      info_iptu: imovel.info_iptu || '',
      observacoes: imovel.observacoes || ''
    });

    // ✅ CORREÇÃO: Configurar proprietários múltiplos se disponível
    if (imovel.locadores && imovel.locadores.length > 0) {
      const novosProprietarios = imovel.locadores.map((locador: any) => ({
        cliente_id: locador.locador_id,
        responsabilidade_principal: locador.responsabilidade_principal || false
      }));
      
      setProprietarios(novosProprietarios);
      setClientesSelecionados(novosProprietarios.map(p => p.cliente_id));
      
      // Definir id_cliente como o proprietário principal
      const principal = novosProprietarios.find(p => p.responsabilidade_principal);
      if (principal) {
        setFormData(prev => ({...prev, id_cliente: principal.cliente_id}));
      }
    } else if (imovel.id_locador) {
      // Fallback para compatibilidade com dados antigos
      setProprietarios([{
        cliente_id: imovel.id_locador,
        responsabilidade_principal: true
      }]);
      
      setClientesSelecionados([imovel.id_locador]);
    }

    console.log('✅ Formulário preenchido com dados do imóvel');
  };

  const handleEnderecoChange = (field: keyof Endereco, value: string) => {
    setEndereco(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIPTUChange = (field: keyof InformacoesIPTU, value: string) => {
    setInformacoesIPTU(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCondominioChange = (field: keyof InformacoesCondominio, value: string) => {
    setInformacoesCondominio(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDadosGeraisChange = (field: keyof DadosGeraisImovel, value: any) => {
    setDadosGerais(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFormDataChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para gerenciar proprietários
  const adicionarProprietario = () => {
    const novoProprietario = {
      cliente_id: 0, // Sem cliente selecionado inicialmente
      responsabilidade_principal: proprietarios.length === 0 // Primeiro é sempre principal
    };
    const novosProprietarios = [...proprietarios, novoProprietario];
    setProprietarios(novosProprietarios);
    // Não atualizar clientesSelecionados até que um cliente seja realmente selecionado
  };

  const removerProprietario = (clienteId: number) => {
    const novosProprietarios = proprietarios.filter(p => p.cliente_id !== clienteId);
    
    // Se removeu o principal e ainda há proprietários, torna o primeiro como principal
    if (novosProprietarios.length > 0) {
      const temPrincipal = novosProprietarios.some(p => p.responsabilidade_principal);
      if (!temPrincipal) {
        novosProprietarios[0].responsabilidade_principal = true;
      }
      // Atualizar o cliente principal
      const principal = novosProprietarios.find(p => p.responsabilidade_principal);
      if (principal) {
        handleFormDataChange('id_cliente', principal.cliente_id);
      }
    } else {
      handleFormDataChange('id_cliente', 0);
    }
    
    setProprietarios(novosProprietarios);
    setClientesSelecionados(novosProprietarios.map(p => p.cliente_id));
  };

  const definirResponsavelPrincipal = (clienteId: number) => {
    const novosProprietarios = proprietarios.map(p => ({
      ...p,
      responsabilidade_principal: p.cliente_id === clienteId
    }));
    setProprietarios(novosProprietarios);
    handleFormDataChange('id_cliente', clienteId);
  };

  const validateCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
  };

  // ✅ Hook para detectar dados preenchidos em cada seção
  const sectionsData = useFormSectionsData({...formData, endereco, informacoesIPTU, informacoesCondominio, dadosGerais}, {
    responsaveis: ['id_cliente'],
    endereco: ['endereco', 'rua', 'numero', 'bairro', 'cidade', 'uf', 'cep', 'tipo', 'status', 'area_imovel', 'matricula_imovel', 'dados_imovel'],
    encargos: ['iptu', 'condominio', 'taxa_incendio', 'titular', 'inscricao_imobiliaria', 'indicacao_fiscal', 'nome_condominio', 'sindico_condominio', 'cnpj_condominio', 'email_condominio', 'telefone_condominio'],
    valores: ['valor_aluguel']
  });

  const validateForm = (): string | null => {
    if (proprietarios.length === 0) {
      return 'É obrigatório ter pelo menos um proprietário.';
    }
    
    const temPrincipal = proprietarios.some(p => p.responsabilidade_principal);
    if (!temPrincipal) {
      return 'Defina um proprietário como responsável principal.';
    }
    
    if (!formData.tipo) {
      return 'Selecione o tipo do imóvel.';
    }

    if (!endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade) {
      return 'Preencha todos os campos obrigatórios do endereço.';
    }

    if (!validateCEP(endereco.cep)) {
      return 'CEP deve ter formato válido (12345-678).';
    }

    if (formData.valor_aluguel <= 0) {
      return 'Valor do aluguel deve ser maior que zero.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({type: 'error', text: validationError});
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // ✅ CORREÇÃO: Enviar campos diretamente em vez de aninhados em dados_gerais
      const imovelData = {
        ...formData,
        endereco,
        // ✅ CORREÇÃO ENCARGOS: Enviar campos IPTU diretamente (não aninhados)
        titular_iptu: informacoesIPTU.titular,
        inscricao_imobiliaria: informacoesIPTU.inscricao_imobiliaria,
        indicacao_fiscal: informacoesIPTU.indicacao_fiscal,
        // ✅ CORREÇÃO ENCARGOS: Enviar campos Condomínio diretamente (não aninhados)
        nome_condominio: informacoesCondominio.nome_condominio,
        sindico_condominio: informacoesCondominio.sindico_condominio,
        cnpj_condominio: informacoesCondominio.cnpj_condominio,
        email_condominio: informacoesCondominio.email_condominio,
        telefone_condominio: informacoesCondominio.telefone_condominio,
        // ✅ HELPER: Função para converter valores seguros para inteiros
        ...(function() {
          const safeInt = (value: any) => {
            if (value === null || value === undefined || value === '') return null;
            const num = parseInt(value);
            return isNaN(num) ? null : num;
          };
          
          const safeFloat = (value: any) => {
            if (value === null || value === undefined || value === '') return null;
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
          };
          
          const safeString = (value: any) => {
            if (value === null || value === undefined) return null;
            return value === '' ? null : String(value);
          };
          
          return {
            // Campos inteiros
            quartos: safeInt(dadosGerais.quartos),
            banheiros: safeInt(dadosGerais.banheiros),
            salas: safeInt(dadosGerais.salas),
            // ✅ LÓGICA PARA TEM_GARAGEM: Se não tem garagem, vagas = 0, se tem, manter valor
            vagas_garagem: dadosGerais.tem_garagem === false ? 0 : safeInt(dadosGerais.qtd_garagem),
            suites: safeInt(dadosGerais.suites),
            cozinha: safeInt(dadosGerais.cozinha),
            qtd_sacada: safeInt(dadosGerais.qtd_sacada),
            qtd_churrasqueira: safeInt(dadosGerais.qtd_churrasqueira),
            andar: safeInt(dadosGerais.andar),
            ano_construcao: safeInt(dadosGerais.ano_construcao),
            
            // Campos string (podem ser null se vazios)
            area_total: safeString(dadosGerais.area_total),
            area_privativa: safeString(dadosGerais.area_privativa),
            caracteristicas: safeString(dadosGerais.caracteristicas),
            // ✅ MOBILIADO: converter para boolean (tipo correto do banco)
            mobiliado: dadosGerais.mobiliado === 'sim',
            metragem_construida: safeString(dadosGerais.area_construida),
            
            // Campos booleanos
            // ✅ PERMITE_PETS: enviar como booleano direto
            permite_pets: dadosGerais.permite_pets,
            aceita_pets: dadosGerais.permite_pets, // ✅ Sincronizar ambos os campos
            tem_sacada: dadosGerais.tem_sacada,
            tem_churrasqueira: dadosGerais.tem_churrasqueira,
            elevador: dadosGerais.elevador
          };
        })(),
        // ✅ CORREÇÃO: Enviar lista de locadores/proprietários
        locadores: proprietarios.map(prop => ({
          locador_id: prop.cliente_id,
          porcentagem: 100.00 / proprietarios.length, // Distribuir igualmente por enquanto
          responsabilidade_principal: prop.responsabilidade_principal
        })),
        // Adicionar campo id_locador para compatibilidade com API (usar o principal)
        id_locador: proprietarios.find(p => p.responsabilidade_principal)?.cliente_id || 
                   proprietarios[0]?.cliente_id || 0
      };

      // DEBUG: Log dos dados sendo enviados
      console.log('🚀 === DADOS SENDO ENVIADOS ===');
      console.log('📋 formData:', formData);
      console.log('🏠 endereco:', endereco);
      console.log('📄 informacoesIPTU:', informacoesIPTU);
      console.log('🏢 informacoesCondominio:', informacoesCondominio);
      console.log('📊 dadosGerais:', dadosGerais);
      console.log('👥 proprietarios:', proprietarios);
      console.log('📦 imovelData completo:', imovelData);
      
      // 🔍 DEBUG ESPECÍFICO PARA LOCADORES
      console.log('🔍 === DEBUG ESPECÍFICO LOCADORES ===');
      console.log('🔢 Quantidade de proprietários:', proprietarios.length);
      console.log('📝 proprietarios array:', JSON.stringify(proprietarios, null, 2));
      console.log('📤 locadores sendo enviados:', JSON.stringify(imovelData.locadores, null, 2));
      console.log('✅ imovelData.locadores existe?', 'locadores' in imovelData);
      console.log('✅ imovelData.locadores é array?', Array.isArray(imovelData.locadores));
      console.log('✅ imovelData.locadores.length:', imovelData.locadores?.length);

      let response;
      
      if (isEditing) {
        // Modo edição - obter ID da URL
        const pathParts = window.location.pathname.split('/');
        const imovelId = pathParts[pathParts.length - 1];
        console.log('💾 Salvando alterações do imóvel ID:', imovelId);
        
        // 🚀 DEBUG: Log do JSON exato sendo enviado para a API
        console.log('🚀 === JSON SENDO ENVIADO PARA API ===');
        console.log('📡 JSON.stringify(imovelData):', JSON.stringify(imovelData));
        console.log('🎯 URL destino:', getApiUrl(`/imoveis/${imovelId}`));
        
        // Chamar API de atualização
        response = await apiService.atualizarImovel(parseInt(imovelId), imovelData);
      } else {
        // Modo cadastro
        response = await apiService.criarImovel(imovelData as Imovel);
      }
      
      if (response.success) {
        const mensagem = isEditing 
          ? (response.message || 'Alterações salvas com sucesso!') 
          : (response.message || 'Imóvel cadastrado com sucesso!');
          
        setMessage({ type: 'success', text: mensagem });
        
        // Reset form apenas no cadastro
        if (!isEditing) {
          resetForm();
        }
      }
    } catch (error) {
      const mensagem = isEditing ? 'Erro ao salvar alterações.' : 'Erro ao cadastrar imóvel.';
      setMessage({type: 'error', text: mensagem});
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_cliente: 0,
      id_inquilino: 0,
      tipo: '',
      valor_aluguel: 0,
      iptu: 0,
      condominio: 0,
      taxa_incendio: 0,
      status: '',
      matricula_imovel: '',
      area_imovel: '',
      info_iptu: '',
      observacoes_condominio: '',
      copel_unidade_consumidora: '',
      sanepar_matricula: '',
      tem_gas: false,
      info_gas: '',
      boleto_condominio: false
    });
    setEndereco({
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: 'PR',
      cep: ''
    });
    setInformacoesIPTU({
      titular: '',
      inscricao_imobiliaria: '',
      indicacao_fiscal: ''
    });
    setInformacoesCondominio({
      nome_condominio: '',
      sindico_condominio: '',
      cnpj_condominio: '',
      email_condominio: '',
      telefone_condominio: ''
    });
    setDadosGerais({
      quartos: 0,
      suites: 0,
      banheiros: 0,
      salas: 0,
      cozinha: 0,
      tem_garagem: false,
      qtd_garagem: 0,
      tem_sacada: false,
      qtd_sacada: undefined,
      tem_churrasqueira: false,
      qtd_churrasqueira: undefined,
      mobiliado: 'nao',
      permite_pets: false,
      area_total: '',
      area_construida: '',
      area_privativa: '',
      ano_construcao: '',
      elevador: false,
      andar: '',
      caracteristicas: ''
    });
    setTemCondominio(false);
  };

  return (
    <div className="imoveis-page min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-foreground/20 rounded-xl">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {isViewing ? 'Visualizar Imóvel' : isEditing ? 'Editar Imóvel' : 'Cadastro de Imóvel'}
                </h1>
              </div>
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-200 pointer-events-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Loading State */}
            {loadingData && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados...</span>
                </div>
              </div>
            )}

            {/* API Error */}
            {apiError && (
              <div className="p-4 rounded-xl mb-6 border status-warning">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {message && (
              <div
                data-initial={{ opacity: 0, scale: 0.95 }}
                data-animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl mb-6 border ${
                  message.type === 'success' 
                    ? 'status-success' 
                    : 'status-error'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-foreground" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-foreground" />
                  )}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            {!loadingData && (
              <form onSubmit={handleSubmit} className={`space-y-8 ${isReadOnly ? 'pointer-events-none opacity-75' : ''}`}>
                <Tabs defaultValue="responsaveis" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 pointer-events-auto opacity-100">
                    <TabsTrigger value="responsaveis" hasData={sectionsData.responsaveis}>Responsáveis</TabsTrigger>
                    <TabsTrigger value="endereco" hasData={sectionsData.endereco}>Endereço</TabsTrigger>
                    <TabsTrigger value="encargos" hasData={sectionsData.encargos}>Encargos</TabsTrigger>
                    <TabsTrigger value="valores" hasData={sectionsData.valores}>Valores</TabsTrigger>
                    <TabsTrigger value="documentos" hasData={false}>Documentos</TabsTrigger>
                  </TabsList>

                  {/* Aba 1: Responsáveis */}
                  <TabsContent value="responsaveis" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Responsáveis do Imóvel
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Defina os proprietários responsáveis pelo imóvel
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Seção de Proprietários */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Users className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Proprietários do Imóvel
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione os proprietários responsáveis pelo imóvel
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            O primeiro proprietário será automaticamente definido como responsável principal.
                          </p>
                          <Button 
                            type="button"
                            onClick={adicionarProprietario}
                            disabled={isReadOnly}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 border-primary"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Proprietário
                          </Button>
                        </div>


                        {/* Indicador de Status */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`card-glass rounded-xl p-4 border ${
                            proprietarios.length > 0 && proprietarios.some(p => p.responsabilidade_principal)
                              ? 'border-border bg-card text-card-foreground' 
                              : proprietarios.length > 0 && !proprietarios.some(p => p.responsabilidade_principal)
                              ? 'border-border bg-card text-card-foreground'
                              : 'border-border bg-card text-card-foreground'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {proprietarios.length > 0 && proprietarios.some(p => p.responsabilidade_principal) ? (
                                <CheckCircle className="w-5 h-5 text-foreground" />
                              ) : proprietarios.length > 0 && !proprietarios.some(p => p.responsabilidade_principal) ? (
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                              )}
                              <span className="font-medium text-foreground">
                                {proprietarios.length === 0 
                                  ? 'É obrigatório ter pelo menos um proprietário'
                                  : !proprietarios.some(p => p.responsabilidade_principal)
                                  ? 'Defina um proprietário como responsável principal'
                                  : 'Configuração de proprietários válida!'
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-lg font-bold text-foreground">
                                {proprietarios.length}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                proprietário{proprietarios.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      {/* Lista de Proprietários */}
                      <div className="space-y-6">
                          {proprietarios.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20"
                            >
                              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                Nenhum proprietário adicionado
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Selecione um proprietário da lista abaixo para começar
                              </p>
                              <Button 
                                type="button" 
                                onClick={adicionarProprietario} 
                                disabled={isReadOnly}
                                className="btn-gradient"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Primeiro Proprietário
                              </Button>
                            </motion.div>
                          ) : (
                            <AnimatePresence>
                              {proprietarios.map((proprietario, index) => {
                                const cliente = clientes.find(c => c.id === proprietario.cliente_id);
                                // Mostrar o campo mesmo se não há cliente selecionado (cliente_id: 0)
                                
                                return (
                                  <motion.div
                                    key={`proprietario-${index}`} // Usar index como key
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                                  >
                                    <div className="flex items-center justify-between mb-6">
                                      <div className="flex items-center gap-3">
                                        <motion.div 
                                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <Users className="w-5 h-5 text-white" />
                                        </motion.div>
                                        <div>
                                          <h3 className="text-lg font-semibold text-foreground">
                                            Proprietário {index + 1}
                                            {proprietario.responsabilidade_principal && (
                                              <UserCheck className="w-4 h-4 text-foreground inline ml-2" title="Responsável Principal" />
                                            )}
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                            {cliente ? `${cliente.nome} - ${cliente.cpf_cnpj}` : 'Selecione um cliente'}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button 
                                          onClick={() => removerProprietario(proprietario.cliente_id)}
                                          variant="outline"
                                          size="sm"
                                          className="text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                                          disabled={isReadOnly}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </motion.div>
                                    </div>

                                    {/* Campos adicionais */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label>Cliente *</Label>
                                        <Select 
                                          value={proprietario.cliente_id > 0 ? proprietario.cliente_id.toString() : ""}
                                          onValueChange={(value) => {
                                            const clienteId = parseInt(value);
                                            const novosProprietarios = [...proprietarios];
                                            const proprietarioIndex = novosProprietarios.findIndex((_, i) => i === index);
                                            if (proprietarioIndex >= 0) {
                                              novosProprietarios[proprietarioIndex] = {
                                                ...novosProprietarios[proprietarioIndex],
                                                cliente_id: clienteId
                                              };
                                              setProprietarios(novosProprietarios);
                                              setClientesSelecionados(novosProprietarios.map(p => p.cliente_id).filter(id => id > 0));
                                              
                                              // Se for o primeiro/principal, atualizar formData
                                              if (novosProprietarios[proprietarioIndex].responsabilidade_principal) {
                                                handleFormDataChange('id_cliente', clienteId);
                                              }
                                            }
                                          }}
                                          disabled={isReadOnly}
                                        >
                                          <SelectTrigger className="bg-muted/50 border-border text-foreground">
                                            <SelectValue placeholder="Selecione o cliente" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-card border-border">
                                            {clientes
                                              .filter(c => !proprietarios.some((p, i) => i !== index && p.cliente_id === c.id))
                                              .map((clienteOpt) => (
                                              <SelectItem key={clienteOpt.id} value={clienteOpt.id.toString()} className="text-foreground hover:bg-accent">
                                                {clienteOpt.nome} - {clienteOpt.cpf_cnpj}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Campo de Responsabilidade */}
                                      <div>
                                        <Label>Responsabilidade</Label>
                                        <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                                          <input
                                            type="checkbox"
                                            id={`principal_${proprietario.cliente_id}`}
                                            checked={proprietario.responsabilidade_principal || false}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                definirResponsavelPrincipal(proprietario.cliente_id);
                                              }
                                            }}
                                            className="rounded border-gray-300"
                                            disabled={isReadOnly}
                                          />
                                          <Label htmlFor={`principal_${proprietario.cliente_id}`} className="text-sm font-normal cursor-pointer">
                                            Responsável Principal
                                          </Label>
                                        </div>
                                      </div>

                                      {/* Status */}
                                      <div className="md:col-span-3">
                                        <Label>Status</Label>
                                        <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted/30">
                                          <span className="text-sm text-muted-foreground">
                                            {proprietario.responsabilidade_principal ? 'Principal' : 'Adicional'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          )}

                      </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 2: Endereço */}
                  <TabsContent value="endereco" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Localização e Endereço
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Informações de endereço e localização do imóvel
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Seção de Endereço */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Endereço do Imóvel
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Localização completa e detalhada do imóvel
                          </p>
                        </div>
                      </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Label htmlFor="rua" className="text-sm font-medium text-foreground">Rua/Logradouro *</Label>
                        <InputWithIcon
                          id="rua"
                          type="text"
                          value={endereco.rua}
                          onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                          placeholder="Rua das Flores"
                          icon={MapPin}
                          required
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="numero" className="text-sm font-medium text-foreground">Número *</Label>
                        <InputWithIcon
                          id="numero"
                          type="text"
                          value={endereco.numero}
                          onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                          placeholder="123"
                          icon={Home}
                          required
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="complemento" className="text-sm font-medium text-foreground">Complemento</Label>
                        <InputWithIcon
                          id="complemento"
                          type="text"
                          value={endereco.complemento}
                          onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                          placeholder="Apto 45"
                          icon={Building}
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bairro" className="text-sm font-medium text-foreground">Bairro *</Label>
                        <InputWithIcon
                          id="bairro"
                          type="text"
                          value={endereco.bairro}
                          onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                          placeholder="Centro"
                          icon={MapPin}
                          required
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cidade" className="text-sm font-medium text-foreground">Cidade *</Label>
                        <InputWithIcon
                          id="cidade"
                          type="text"
                          value={endereco.cidade}
                          onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                          placeholder="Curitiba"
                          icon={Building2}
                          required
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="estado" className="text-sm font-medium text-foreground">Estado *</Label>
                        <Select 
                          value={endereco.estado} 
                          onValueChange={(value) => handleEnderecoChange('estado', value)}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {estadosBrasil.map((estado) => (
                              <SelectItem key={estado.value} value={estado.value}>
                                {estado.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cep" className="text-sm font-medium text-foreground">CEP *</Label>
                        <InputWithIcon
                          id="cep"
                          type="text"
                          value={endereco.cep}
                          onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                          placeholder="00000-000"
                          icon={MapPin}
                          maxLength={9}
                          required
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                    </motion.div>

                    {/* Seção de Informações Básicas */}
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
                          <Building2 className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações Básicas
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Tipo, status e dados fundamentais do imóvel
                          </p>
                        </div>
                      </div>
                        
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="tipo" className="text-sm font-medium text-foreground">Tipo do Imóvel *</Label>
                            <Select value={formData.tipo || ''} onValueChange={(value) => handleFormDataChange('tipo', value)} disabled={isReadOnly}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Apartamento">Apartamento</SelectItem>
                                <SelectItem value="Casa">Casa</SelectItem>
                                <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
                                <SelectItem value="Galpão">Galpão</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
                            <Select value={formData.status || ''} onValueChange={(value) => handleFormDataChange('status', value)} disabled={isReadOnly}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Disponível">Disponível</SelectItem>
                                <SelectItem value="Ocupado">Ocupado</SelectItem>
                                <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                                <SelectItem value="Inativo">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="matricula_imovel" className="text-sm font-medium text-foreground">Matrícula do Imóvel</Label>
                            <InputWithIcon
                              id="matricula_imovel"
                              type="text"
                              icon={FileText}
                              value={formData.matricula_imovel}
                              onChange={(e) => handleFormDataChange('matricula_imovel', e.target.value)}
                              placeholder="000123456789"
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="area_total" className="text-sm font-medium text-foreground">Área Total</Label>
                            <InputWithIcon
                              id="area_total"
                              type="text"
                              icon={Home}
                              value={dadosGerais.area_total || ''}
                              onChange={(e) => handleDadosGeraisChange('area_total', e.target.value)}
                              placeholder="80m²"
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="area_privativa" className="text-sm font-medium text-foreground">Área Privativa</Label>
                            <InputWithIcon
                              id="area_privativa"
                              type="text"
                              icon={Home}
                              value={dadosGerais.area_privativa || ''}
                              onChange={(e) => handleDadosGeraisChange('area_privativa', e.target.value)}
                              placeholder="65m²"
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label htmlFor="quartos" className="text-sm font-medium text-foreground">Quartos</Label>
                              <InputWithIcon
                                id="quartos"
                                type="number"
                                min="0"
                                placeholder="3"
                                icon={Bed}
                                value={dadosGerais.quartos || ''}
                                onChange={(e) => handleDadosGeraisChange('quartos', parseInt(e.target.value) || 0)}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="banheiros" className="text-sm font-medium text-foreground">Banheiros</Label>
                              <InputWithIcon
                                id="banheiros"
                                type="number"
                                min="0"
                                placeholder="2"
                                icon={Bath}
                                value={dadosGerais.banheiros || ''}
                                onChange={(e) => handleDadosGeraisChange('banheiros', parseInt(e.target.value) || 0)}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="salas" className="text-sm font-medium text-foreground">Salas</Label>
                              <InputWithIcon
                                id="salas"
                                type="number"
                                min="0"
                                placeholder="1"
                                icon={Sofa}
                                value={dadosGerais.salas || ''}
                                onChange={(e) => handleDadosGeraisChange('salas', parseInt(e.target.value) || 0)}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="vagas_garagem" className="text-sm font-medium text-foreground">Vagas Garagem</Label>
                              <InputWithIcon
                                id="vagas_garagem"
                                type="number"
                                min="0"
                                placeholder="2"
                                icon={Car}
                                value={dadosGerais.qtd_garagem || ''}
                                onChange={(e) => handleDadosGeraisChange('qtd_garagem', parseInt(e.target.value) || 0)}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-foreground">Permite Animais</Label>
                                <Select 
                                  value={dadosGerais.permite_pets ? 'Sim' : 'Não'} 
                                  onValueChange={(value) => handleDadosGeraisChange('permite_pets', value === 'Sim')}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Sim">Sim</SelectItem>
                                    <SelectItem value="Não">Não</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Mobiliado</Label>
                                <Select 
                                  value={dadosGerais.mobiliado} 
                                  onValueChange={(value) => handleDadosGeraisChange('mobiliado', value)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="nao">Não</SelectItem>
                                    <SelectItem value="sim">Sim</SelectItem>
                                    <SelectItem value="parcialmente">Parcialmente</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-sm font-medium text-foreground">Tem Garagem</Label>
                                <Select 
                                  value={dadosGerais.tem_garagem ? 'Sim' : 'Não'} 
                                  onValueChange={(value) => handleDadosGeraisChange('tem_garagem', value === 'Sim')}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Sim">Sim</SelectItem>
                                    <SelectItem value="Não">Não</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="caracteristicas" className="text-sm font-medium text-foreground">Características Gerais</Label>
                              <Textarea
                                id="caracteristicas"
                                placeholder="Ex: cozinha americana, área de serviço, sacada..."
                                rows={6}
                                className="resize-none"
                                value={dadosGerais.caracteristicas || ''}
                                onChange={(e) => handleDadosGeraisChange('caracteristicas', e.target.value)}
                                disabled={isReadOnly}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Descreva as principais características do imóvel
                              </p>
                            </div>
                          </div>
                        </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 3: Encargos */}
                  <TabsContent value="encargos" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
                          <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Encargos e Impostos
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Informações sobre IPTU e outros encargos
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Informações do IPTU */}
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
                          <Receipt className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações do IPTU
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Dados fiscais e de registro imobiliário
                          </p>
                        </div>
                      </div>
                          
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-3">
                              <Label htmlFor="titular_iptu" className="text-sm font-medium text-foreground">Titular do IPTU</Label>
                              <InputWithIcon
                                id="titular_iptu"
                                type="text"
                                icon={Users}
                                value={informacoesIPTU.titular}
                                onChange={(e) => handleIPTUChange('titular', e.target.value)}
                                placeholder="João Silva"
                                disabled={isReadOnly}
                              />
                            </div>

                              <div>
                                <Label htmlFor="inscricao_imobiliaria" className="text-sm font-medium text-foreground">Inscrição Imobiliária</Label>
                                <InputWithIcon
                                  id="inscricao_imobiliaria"
                                  type="text"
                                  icon={Hash}
                                  value={informacoesIPTU.inscricao_imobiliaria}
                                  onChange={(e) => handleIPTUChange('inscricao_imobiliaria', e.target.value)}
                                  placeholder="000123456789"
                                  disabled={isReadOnly}
                                />
                              </div>

                              <div>
                                <Label htmlFor="indicacao_fiscal" className="text-sm font-medium text-foreground">Indicação Fiscal</Label>
                                <InputWithIcon
                                  id="indicacao_fiscal"
                                  type="text"
                                  icon={Hash}
                                  value={informacoesIPTU.indicacao_fiscal}
                                  onChange={(e) => handleIPTUChange('indicacao_fiscal', e.target.value)}
                                  placeholder="000987654321"
                                  disabled={isReadOnly}
                                />
                              </div>

                            <div className="lg:col-span-3">
                              <Label htmlFor="info_iptu" className="text-sm font-medium text-foreground">Informações sobre IPTU</Label>
                              <Textarea
                                id="info_iptu"
                                value={formData.info_iptu}
                                onChange={(e) => handleFormDataChange('info_iptu', e.target.value)}
                                placeholder="Detalhes sobre pagamento do IPTU, parcelamento, etc."
                                rows={4}
                                className="resize-none"
                                disabled={isReadOnly}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Informações adicionais sobre o IPTU do imóvel
                              </p>
                            </div>
                          </div>
                    </motion.div>


                    {/* Informações do Condomínio */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 to-pink-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Building2 className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações do Condomínio
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Configure se o imóvel faz parte de um condomínio
                          </p>
                        </div>
                      </div>
                        
                      <div className="space-y-6">
                        {/* Pergunta se tem condomínio */}
                        <div>
                          <Label className="text-sm font-medium text-foreground">O imóvel faz parte de um condomínio?</Label>
                          <Select 
                            value={temCondominio ? 'Sim' : 'Não'} 
                            onValueChange={(value) => {
                              const hasCondominio = value === 'Sim';
                              setTemCondominio(hasCondominio);
                              if (!hasCondominio) {
                                handleFormDataChange('condominio', 0);
                                handleFormDataChange('observacoes_condominio', '');
                                handleFormDataChange('boleto_condominio', false);
                              }
                            }}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sim">Sim</SelectItem>
                              <SelectItem value="Não">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Campos condicionais se tem condomínio */}
                        {temCondominio && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-6 p-4 bg-muted/20 rounded-lg border border-muted-foreground/20"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2">
                                <Label htmlFor="nome_condominio" className="text-sm font-medium text-foreground">Nome do Condomínio</Label>
                                <InputWithIcon
                                  id="nome_condominio"
                                  type="text"
                                  placeholder="Condomínio Residencial Flores"
                                  icon={Building}
                                  value={informacoesCondominio.nome_condominio}
                                  onChange={(e) => handleCondominioChange('nome_condominio', e.target.value)}
                                  disabled={isReadOnly}
                                />
                              </div>

                              <div>
                                <Label htmlFor="sindico" className="text-sm font-medium text-foreground">Síndico</Label>
                                <InputWithIcon
                                  id="sindico"
                                  type="text"
                                  placeholder="João Silva"
                                  icon={Users}
                                  value={informacoesCondominio.sindico_condominio}
                                  onChange={(e) => handleCondominioChange('sindico_condominio', e.target.value)}
                                  disabled={isReadOnly}
                                />
                              </div>

                              <div>
                                <Label htmlFor="cnpj_condominio" className="text-sm font-medium text-foreground">CNPJ do Condomínio</Label>
                                <InputWithIcon
                                  id="cnpj_condominio"
                                  type="text"
                                  placeholder="00.000.000/0000-00"
                                  icon={CreditCard}
                                  value={informacoesCondominio.cnpj_condominio}
                                  onChange={(e) => handleCondominioChange('cnpj_condominio', e.target.value)}
                                  disabled={isReadOnly}
                                />
                              </div>

                              <div>
                                <Label htmlFor="email_condominio" className="text-sm font-medium text-foreground">Email</Label>
                                <InputWithIcon
                                  id="email_condominio"
                                  type="email"
                                  placeholder="contato@condominio.com.br"
                                  icon={Mail}
                                  value={informacoesCondominio.email_condominio}
                                  onChange={(e) => handleCondominioChange('email_condominio', e.target.value)}
                                  disabled={isReadOnly}
                                />
                              </div>

                              <div>
                                <Label htmlFor="telefone_condominio" className="text-sm font-medium text-foreground">Telefone</Label>
                                <InputWithIcon
                                  id="telefone_condominio"
                                  type="tel"
                                  placeholder="(41) 99999-9999"
                                  icon={Phone}
                                  value={informacoesCondominio.telefone_condominio}
                                  onChange={(e) => handleCondominioChange('telefone_condominio', e.target.value)}
                                  disabled={isReadOnly}
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="observacoes_condominio" className="text-sm font-medium text-foreground">Observações do Condomínio</Label>
                              <Textarea
                                id="observacoes_condominio"
                                value={formData.observacoes_condominio}
                                onChange={(e) => handleFormDataChange('observacoes_condominio', e.target.value)}
                                placeholder="Regras do condomínio, horários, observações..."
                                rows={4}
                                className="resize-none"
                                disabled={isReadOnly}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Regras e informações específicas do condomínio
                              </p>
                            </div>

                            <div className="flex items-center space-x-3 p-4 rounded-xl bg-muted/30 border border-muted-foreground/20">
                              <input
                                type="checkbox"
                                id="boleto_condominio"
                                checked={formData.boleto_condominio}
                                onChange={(e) => handleFormDataChange('boleto_condominio', e.target.checked)}
                                className="rounded border-gray-300"
                                disabled={isReadOnly}
                              />
                              <Label htmlFor="boleto_condominio" className="cursor-pointer text-foreground font-medium">
                                Boleto do Condomínio Incluso na Gestão
                              </Label>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>

                    {/* Utilidades Públicas */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <Flame className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Utilidades Públicas
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Registros de energia elétrica, água e gás
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="copel_unidade" className="text-sm font-medium text-foreground">Copel - Unidade Consumidora</Label>
                          <InputWithIcon
                            id="copel_unidade"
                            type="text"
                            icon={Hash}
                            value={formData.copel_unidade_consumidora}
                            onChange={(e) => handleFormDataChange('copel_unidade_consumidora', e.target.value)}
                            placeholder="123456789"
                            disabled={isReadOnly}
                          />
                        </div>

                        <div>
                          <Label htmlFor="sanepar_matricula" className="text-sm font-medium text-foreground">Sanepar - Matrícula</Label>
                          <InputWithIcon
                            id="sanepar_matricula"
                            type="text"
                            icon={Hash}
                            value={formData.sanepar_matricula}
                            onChange={(e) => handleFormDataChange('sanepar_matricula', e.target.value)}
                            placeholder="987654321"
                            disabled={isReadOnly}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-foreground">Possui Gás Natural/GLP</Label>
                          <Select 
                            value={formData.tem_gas ? 'Sim' : 'Não'} 
                            onValueChange={(value) => handleFormDataChange('tem_gas', value === 'Sim')}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sim">Sim</SelectItem>
                              <SelectItem value="Não">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.tem_gas && (
                          <div className="lg:col-span-3">
                            <Label htmlFor="info_gas" className="text-sm font-medium text-foreground">Informações sobre Gás</Label>
                            <InputWithIcon
                              id="info_gas"
                              type="text"
                              value={formData.info_gas}
                              onChange={(e) => handleFormDataChange('info_gas', e.target.value)}
                              placeholder="Número do medidor, tipo de gás, etc."
                              icon={Flame}
                              disabled={isReadOnly}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 4: Valores */}
                  <TabsContent value="valores" className="space-y-8">
                    {/* Valores e Características */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <DollarSign className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Valores e Características
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Valores de locação e características do imóvel
                          </p>
                        </div>
                      </div>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="valor_aluguel" className="text-sm font-medium text-foreground">Valor do Aluguel *</Label>
                          <InputWithIcon
                            id="valor_aluguel"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.valor_aluguel}
                            onChange={(e) => handleFormDataChange('valor_aluguel', parseFloat(e.target.value) || 0)}
                            placeholder="1500.00"
                            required
                            disabled={isReadOnly}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Valor mensal base
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="iptu" className="text-sm font-medium text-foreground">Valor do IPTU</Label>
                          <InputWithIcon
                            id="iptu"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.iptu}
                            onChange={(e) => handleFormDataChange('iptu', parseFloat(e.target.value) || 0)}
                            placeholder="200.00"
                            disabled={isReadOnly}
                          />
                        </div>

                        <div>
                          <Label htmlFor="condominio" className="text-sm font-medium text-foreground">Valor do Condomínio</Label>
                          <InputWithIcon
                            id="condominio"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.condominio}
                            onChange={(e) => handleFormDataChange('condominio', parseFloat(e.target.value) || 0)}
                            placeholder="350.00"
                            disabled={isReadOnly}
                          />
                        </div>

                        <div>
                          <Label htmlFor="taxa_incendio" className="text-sm font-medium text-foreground">Taxa de Incêndio</Label>
                          <InputWithIcon
                            id="taxa_incendio"
                            type="number"
                            step="0.01"
                            min="0"
                            icon={DollarSign}
                            value={formData.taxa_incendio}
                            onChange={(e) => handleFormDataChange('taxa_incendio', parseFloat(e.target.value) || 0)}
                            placeholder="15.00"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Aba 5: Documentos */}
                  <TabsContent value="documentos" className="space-y-8">
                    {/* Header da Seção */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center space-y-4"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            Documentos do Imóvel
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Faça upload dos documentos referentes ao imóvel. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Documentos Obrigatórios */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-amber-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <FileText className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Documentos Obrigatórios
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Documentos essenciais para o cadastro do imóvel
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUpload
                          label="Matrícula do Imóvel"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Matrícula:', file)}
                          required
                        />

                        <FileUpload
                          label="Escritura ou Contrato de Compra"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Escritura:', file)}
                          required
                        />

                        <FileUpload
                          label="Carnê do IPTU"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('IPTU:', file)}
                          required
                        />

                        <FileUpload
                          label="Certidão Negativa de Débitos"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Certidão:', file)}
                        />
                      </div>
                    </motion.div>

                    {/* Documentos Opcionais */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500"
                          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                        >
                          <FileText className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Documentos Opcionais
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Documentos complementares que podem ser úteis
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUpload
                          label="Laudo de Avaliação"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Laudo:', file)}
                        />

                        <FileUpload
                          label="Planta do Imóvel"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Planta:', file)}
                        />

                        <FileUpload
                          label="Fotos do Imóvel"
                          accept=".jpg,.jpeg,.png"
                          maxSize={10}
                          onFileSelect={(file) => console.log('Fotos:', file)}
                        />

                        <FileUpload
                          label="Outros Documentos"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('Outros:', file)}
                        />
                      </div>
                    </motion.div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="pt-8 space-y-4">

                  {/* Submit Button - oculto em modo visualização */}
                  {!isViewing && (
                    <Button 
                      type="submit" 
                      disabled={loading || clientes.length === 0 || proprietarios.length === 0}
                      className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>{isEditing ? 'Atualizando...' : 'Cadastrando Imóvel...'}</span>
                        </div>
                      ) : clientes.length === 0 ? (
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-6 h-6" />
                          <span>Cadastre clientes primeiro</span>
                        </div>
                      ) : proprietarios.length === 0 ? (
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-6 h-6" />
                          <span>Adicione pelo menos um proprietário</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-6 h-6" />
                          <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Imóvel Completo'}</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};