import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { FileUpload } from '../ui/file-upload';
import { 
  User, 
  CreditCard, 
  Phone, 
  Mail, 
  Building, 
  Calendar,
  Shield,
  Heart,
  FileText,
  Briefcase,
  Globe,
  UserCheck,
  Building2,
  Home,
  DollarSign,
  AlertCircle,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  Users,
  MapPin,
  ArrowLeft,
  CheckCircle,
  CheckSquare
} from 'lucide-react';
import type { Locatario, Endereco, DadosBancarios, Fiador, Morador } from '../../types';
import { apiService } from '../../services/api';
import { EnderecoForm } from './EnderecoForm';
import { DadosBancariosForm } from './DadosBancariosForm';

interface ModernLocatarioFormV2Props {
  onBack?: () => void;
  isEditing?: boolean;
  isViewing?: boolean;
}

export const ModernLocatarioFormV2: React.FC<ModernLocatarioFormV2Props> = ({ onBack, isEditing = false, isViewing = false }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Estados para múltiplos contatos
  const [telefones, setTelefones] = useState<string[]>(['']);
  const [emails, setEmails] = useState<string[]>(['']);
  
  // Estados para cobrança
  const [formasEnvio, setFormasEnvio] = useState<{tipo: string, contato: string}[]>([{tipo: '', contato: ''}]);
  
  // Estados para dados bancários e cônjuge
  const [showConjuge, setShowConjuge] = useState<boolean>(false);
  const [conjugeSelectValue, setConjugeSelectValue] = useState<string>('');
  const [showRepresentante, setShowRepresentante] = useState<boolean>(false);
  const [showMoradores, setShowMoradores] = useState<boolean>(false);
  const [showFiador, setShowFiador] = useState<boolean>(false);
  
  // Estados para os dados estruturados
  const [endereco, setEndereco] = useState<Endereco>({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'PR',
    cep: ''
  });

  const [dadosBancarios, setDadosBancarios] = useState<DadosBancarios>({
    tipo_recebimento: 'PIX',
    chave_pix: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'Corrente',
    titular: '',
    cpf_titular: ''
  });


  const [fiador, setFiador] = useState<Fiador>({
    nome: '',
    cpf_cnpj: '',
    rg: '',
    telefone: '',
    email: '',
    tipo_pessoa: 'PF',
    renda_mensal: 0,
    profissao: '',
    observacoes: ''
  });

  const [moradores, setMoradores] = useState<Morador[]>([]);
  
  // Hook para carregar dados do locatário quando em modo de edição ou visualização
  React.useEffect(() => {
    console.log('🔍 USEEFFECT - isEditing:', isEditing, 'isViewing:', isViewing);
    console.log('🔍 USEEFFECT - URL atual:', window.location.pathname);
    
    if (isEditing || isViewing) {
      const pathParts = window.location.pathname.split('/');
      console.log('🔍 USEEFFECT - Path parts:', pathParts);
      
      const locatarioId = pathParts[pathParts.length - 1];
      console.log('🔍 USEEFFECT - ID extraído:', locatarioId);
      
      if (locatarioId && locatarioId !== 'editar' && locatarioId !== 'visualizar') {
        console.log('🔍 USEEFFECT - Chamando carregarDadosLocatario com ID:', locatarioId);
        carregarDadosLocatario(parseInt(locatarioId));
      } else {
        console.log('❌ USEEFFECT - ID inválido ou é palavra reservada:', locatarioId);
      }
    } else {
      console.log('🔍 USEEFFECT - Não está em modo edição/visualização');
    }
  }, [isEditing, isViewing]);

  const carregarDadosLocatario = async (locatarioId: number) => {
    console.log('🚀 INICIANDO carregarDadosLocatario com ID:', locatarioId);
    setLoadingData(true);
    setMessage(null);
    setApiError(null);
    
    try {
      console.log('🔍 Fazendo requisição para:', `http://192.168.1.159:8080/api/locatarios/${locatarioId}`);
      
      // Tentar API específica por ID
      const response = await fetch(`http://192.168.1.159:8080/api/locatarios/${locatarioId}`);
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Dados recebidos:', data);
      console.log('📦 Success:', data.success);
      console.log('📦 Data type:', typeof data.data, Array.isArray(data.data));
      
      if (data.success && data.data) {
        const locatario = data.data;
        console.log('✅ Locatário encontrado:', locatario.nome);
        console.log('📋 Campos disponíveis:', Object.keys(locatario));
        
        // Preencher formData com TODOS os campos disponíveis
        const novoFormData = {
          ...formData,
          nome: locatario.nome || '',
          cpf_cnpj: locatario.cpf_cnpj || '',
          telefone: locatario.telefone || locatario.telefone_principal || '',
          email: locatario.email || locatario.email_principal || '',
          rg: locatario.rg || '',
          data_nascimento: locatario.data_nascimento || '',
          nacionalidade: locatario.nacionalidade || 'Brasileiro(a)',
          estado_civil: locatario.estado_civil || 'Solteiro(a)',
          profissao: locatario.profissao || '',
          tipo_pessoa: locatario.tipo_pessoa || 'PF',
          renda_mensal: locatario.renda_mensal || 0,
          empresa: locatario.empresa || locatario.dados_empresa || '',
          telefone_comercial: locatario.telefone_comercial || '',
          observacoes: locatario.observacoes || '',
          // Campos específicos de PJ
          razao_social: locatario.razao_social || '',
          nome_fantasia: locatario.nome_fantasia || '',
          inscricao_estadual: locatario.inscricao_estadual || '',
          inscricao_municipal: locatario.inscricao_municipal || '',
          atividade_principal: locatario.atividade_principal || '',
          // Campos de cônjuge
          nome_conjuge: locatario.nome_conjuge || locatario.conjuge_nome || '',
          cpf_conjuge: locatario.cpf_conjuge || '',
          rg_conjuge: locatario.rg_conjuge || '',
          telefone_conjuge: locatario.telefone_conjuge || '',
          regime_bens: locatario.regime_bens || (locatario.possui_conjuge ? 'Comunhão Parcial de Bens' : ''),
          existe_conjuge: locatario.possui_conjuge || 0
        };
        
        console.log('📝 Preenchendo formData com:', novoFormData);
        setFormData(novoFormData);
        
        // Adicionar campos de empresa que podem estar faltando
        if (locatario.tipo_pessoa === 'PJ') {
          console.log('🏢 Mapeando campos de empresa adicionais');
          setFormData(prev => ({
            ...prev,
            data_constituicao: locatario.data_constituicao || '',
            capital_social: locatario.capital_social || '',
            porte_empresa: locatario.porte_empresa || '',
            regime_tributario: locatario.regime_tributario || ''
          }));
        }
        
        // Verificar se tem cônjuge (usar campos que realmente existem)
        const hasConjuge = !!(locatario.nome_conjuge || locatario.conjuge_nome || locatario.possui_conjuge);
        if (hasConjuge) {
          console.log('💑 Ativando seção de cônjuge');
          setShowConjuge(true);
          setConjugeSelectValue('Sim');
        } else {
          setConjugeSelectValue('Não');
        }
        
        // Verificar se é PJ e tem representante
        if (locatario.tipo_pessoa === 'PJ' || locatario.razao_social) {
          console.log('🏢 Ativando seção de representante legal');
          setShowRepresentante(true);
          
          // Mapear dados do representante_legal para campos individuais
          if (locatario.representante_legal) {
            console.log('📋 Mapeando representante legal:', locatario.representante_legal);
            
            // Converter endereço string em objeto estruturado se necessário
            let enderecoRepresentante = {};
            if (locatario.representante_legal.endereco) {
              // Se já for objeto, usar direto
              if (typeof locatario.representante_legal.endereco === 'object') {
                enderecoRepresentante = locatario.representante_legal.endereco;
              } else {
                // Se for string, tentar extrair partes (formato: "Rua, Numero, Complemento, Bairro, Cidade - Estado, CEP: 00000-000")
                const endStr = locatario.representante_legal.endereco;
                
                // Extrair CEP primeiro
                const cepMatch = endStr.match(/CEP:\s*([\d-]+)/);
                const cep = cepMatch ? cepMatch[1] : '';
                const endSemCep = endStr.replace(/,?\s*CEP:\s*[\d-]+\s*$/, '').trim();
                
                // Separar por vírgulas e filtrar vazios
                const partes = endSemCep.split(',').map(p => p.trim()).filter(p => p !== '');
                
                // Parsing inteligente: identificar cidade-estado (contém " - ")
                let cidadeEstadoIndex = -1;
                let cidadeEstadoPart = '';
                for (let i = partes.length - 1; i >= 0; i--) {
                  if (partes[i].includes(' - ')) {
                    cidadeEstadoIndex = i;
                    cidadeEstadoPart = partes[i];
                    break;
                  }
                }
                
                // Se não encontrou cidade-estado, última parte pode ser só cidade
                if (cidadeEstadoIndex === -1 && partes.length > 0) {
                  cidadeEstadoIndex = partes.length - 1;
                  cidadeEstadoPart = partes[cidadeEstadoIndex];
                }
                
                // Extrair cidade e estado
                const cidade = cidadeEstadoPart.includes(' - ') 
                  ? cidadeEstadoPart.split(' - ')[0].trim()
                  : cidadeEstadoPart;
                const estado = cidadeEstadoPart.includes(' - ')
                  ? cidadeEstadoPart.split(' - ')[1].trim()
                  : 'PR';
                
                // Parsing baseado na quantidade de partes válidas
                let rua = '', numero = '', complemento = '', bairro = '';
                
                if (partes.length >= 1) rua = partes[0];
                if (partes.length >= 2) numero = partes[1];
                
                // Se temos cidade-estado identificada, trabalhar backwards
                if (cidadeEstadoIndex >= 0) {
                  const partesAntesCidade = cidadeEstadoIndex;
                  if (partesAntesCidade >= 4) {
                    // Temos: rua, numero, complemento, bairro, cidade-estado
                    complemento = partes[2] || '';
                    bairro = partes[3] || '';
                  } else if (partesAntesCidade === 3) {
                    // Temos: rua, numero, bairro, cidade-estado (sem complemento)
                    complemento = '';
                    bairro = partes[2] || '';
                  } else if (partesAntesCidade === 2) {
                    // Temos: rua, numero, cidade-estado (sem complemento nem bairro)
                    complemento = '';
                    bairro = '';
                  }
                }
                
                enderecoRepresentante = {
                  rua: rua,
                  numero: numero, 
                  complemento: complemento,
                  bairro: bairro,
                  cidade: cidade,
                  estado: estado,
                  cep: cep
                };
              }
            }
            
            setFormData(prev => ({
              ...prev,
              nome_representante: locatario.representante_legal.nome || '',
              cpf_representante: locatario.representante_legal.cpf || '',
              rg_representante: locatario.representante_legal.rg || '',
              cargo_representante: locatario.representante_legal.cargo || '',
              telefone_representante: locatario.representante_legal.telefone || '',
              email_representante: locatario.representante_legal.email || '',
              endereco_representante: enderecoRepresentante
            }));
            console.log('✅ Dados do representante legal mapeados');
          } else {
            console.log('⚠️ Nenhum representante_legal encontrado nos dados');
          }
        }
        
        // Preencher endereço se existir
        if (locatario.endereco) {
          setEndereco(locatario.endereco);
        }
        
        // Preencher dados bancários se existir
        if (locatario.dados_bancarios) {
          setDadosBancarios(locatario.dados_bancarios);
        }
        
        // Preencher fiador se existir
        if (locatario.fiador) {
          setShowFiador(true);
          setFiador(locatario.fiador);
        }
        
        // Preencher moradores se existirem
        if (locatario.moradores && locatario.moradores.length > 0) {
          setShowMoradores(true);
          setMoradores(locatario.moradores);
        }
        
        // Preencher endereço estruturado ou inline
        const enderecoAtualizado = { ...endereco };
        if (locatario.endereco_estruturado) {
          Object.assign(enderecoAtualizado, locatario.endereco_estruturado);
          console.log('🏠 Endereço estruturado carregado');
        } else if (locatario.endereco_rua) {
          enderecoAtualizado.rua = locatario.endereco_rua || '';
          enderecoAtualizado.numero = locatario.endereco_numero || '';
          enderecoAtualizado.complemento = locatario.endereco_complemento || '';
          enderecoAtualizado.bairro = locatario.endereco_bairro || '';
          enderecoAtualizado.cidade = locatario.endereco_cidade || '';
          enderecoAtualizado.estado = locatario.endereco_estado || '';
          enderecoAtualizado.cep = locatario.endereco_cep || '';
          console.log('🏠 Endereço inline carregado');
        }
        setEndereco(enderecoAtualizado);
        
        // Preencher múltiplos telefones
        if (locatario.telefones && locatario.telefones.length > 0) {
          const telefonesArray = locatario.telefones.map((t: any) => 
            typeof t === 'string' ? t : t.telefone
          );
          setTelefones(telefonesArray);
          console.log('📞 Múltiplos telefones carregados:', telefonesArray.length);
        } else if (locatario.telefone || locatario.telefone_principal) {
          setTelefones([locatario.telefone || locatario.telefone_principal]);
          console.log('📞 Telefone único carregado');
        }
        
        // Preencher múltiplos emails
        if (locatario.emails && locatario.emails.length > 0) {
          const emailsArray = locatario.emails.map((e: any) => 
            typeof e === 'string' ? e : e.email
          );
          setEmails(emailsArray);
          console.log('📧 Múltiplos emails carregados:', emailsArray.length);
        } else if (locatario.email || locatario.email_principal) {
          setEmails([locatario.email || locatario.email_principal]);
          console.log('📧 Email único carregado');
        }
        
        // Preencher formas de envio se existir
        if (locatario.formas_envio_cobranca && locatario.formas_envio_cobranca.length > 0) {
          const formasArray = locatario.formas_envio_cobranca.map((f: any) => ({
            tipo: f.tipo || '',
            contato: f.contato || ''
          }));
          setFormasEnvio(formasArray);
          console.log('💸 Formas de cobrança carregadas:', formasArray.length);
        }
        
        // Preencher dados bancários se existir
        if (locatario.dados_bancarios) {
          setDadosBancarios(locatario.dados_bancarios);
          console.log('🏦 Dados bancários carregados');
        }
        
        setMessage({ type: 'success', text: `Dados de ${locatario.nome} carregados com sucesso!` });
        console.log('✅ CARREGAMENTO CONCLUÍDO COM SUCESSO');
        
      } else {
        console.error('❌ Resposta sem dados válidos:', data);
        setMessage({ type: 'error', text: 'Dados do locatário não encontrados na resposta da API' });
      }
    } catch (error) {
      console.error('❌ ERRO ao carregar locatário:', error);
      setMessage({ type: 'error', text: `Erro ao carregar dados: ${error}` });
      setApiError(`Erro na API: ${error}`);
    } finally {
      setLoadingData(false);
      console.log('🏁 carregarDadosLocatario FINALIZADO');
    }
  };
  
  const [formData, setFormData] = useState<Locatario>({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    telefones: telefones,
    emails: emails,
    endereco: endereco,
    dados_bancarios: dadosBancarios,
    tipo_pessoa: 'PF',
    tem_fiador: false,
    fiador: fiador,
    responsavel_pgto_agua: 'Locatario',
    responsavel_pgto_luz: 'Locatario',
    responsavel_pgto_gas: 'Locatario',
    rg: '',
    dados_empresa: '',
    representante: '',
    nacionalidade: 'Brasileira',
    estado_civil: 'Solteiro',
    profissao: '',
    dados_moradores: '',
    tem_moradores: false,
    moradores: moradores,
    Endereco_inq: '',
    responsavel_inq: null,
    dependentes_inq: null,
    qtd_dependentes_inq: 0,
    pet_inquilino: null,
    qtd_pet_inquilino: 0,
    porte_pet: '',
    nome_conjuge: '',
    cpf_conjuge: '',
    rg_conjuge: '',
    endereco_conjuge: '',
    telefone_conjuge: '',
    regime_bens: '',
    existe_conjuge: null,
    documento_pessoal: null,
    comprovante_endereco: null,
    forma_envio_boleto: [],
    email_boleto: '',
    whatsapp_boleto: '',
    observacoes: ''
  });

  const estadosCivis = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
  const responsavesPagamento = ['Locatario', 'Proprietário', 'Condomínio'];
  const portesAnimais = ['Pequeno (até 10kg)', 'Médio (10-25kg)', 'Grande (25-45kg)', 'Gigante (45kg+)'];
  const regimesBens = ['Comunhão Total de Bens', 'Comunhão Parcial de Bens', 'Separação Total de Bens', 'Outros'];

  const handleInputChange = (field: keyof Locatario, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções para gerenciar múltiplos telefones
  const addTelefone = () => {
    setTelefones([...telefones, '']);
  };

  const removeTelefone = (index: number) => {
    if (telefones.length > 1) {
      setTelefones(telefones.filter((_, i) => i !== index));
    }
  };

  const updateTelefone = (index: number, value: string) => {
    const newTelefones = [...telefones];
    newTelefones[index] = value;
    setTelefones(newTelefones);
    setFormData(prev => ({ ...prev, telefones: newTelefones, telefone: newTelefones[0] || '' }));
  };

  // Funções para gerenciar múltiplos emails
  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    setFormData(prev => ({ ...prev, emails: newEmails, email: newEmails[0] || '' }));
  };
  
  // Função para gerenciar cônjuge
  const handleConjugeChange = (value: string) => {
    const hasConjuge = value === 'Sim';
    setShowConjuge(hasConjuge);
    setConjugeSelectValue(value);
    setFormData(prev => ({
      ...prev,
      existe_conjuge: hasConjuge ? 1 : 0
    }));
  };

  // Funções para gerenciar formas de envio de boleto
  const addFormaEnvio = () => {
    setFormasEnvio([...formasEnvio, {tipo: '', contato: ''}]);
  };

  const removeFormaEnvio = (index: number) => {
    if (formasEnvio.length > 1) {
      setFormasEnvio(formasEnvio.filter((_, i) => i !== index));
    }
  };

  const updateFormaEnvio = (index: number, field: 'tipo' | 'contato', value: string) => {
    const newFormasEnvio = [...formasEnvio];
    newFormasEnvio[index][field] = value;
    setFormasEnvio(newFormasEnvio);
    setFormData(prev => ({ ...prev, formas_envio_boleto: newFormasEnvio }));
  };



  const adicionarMorador = () => {
    const novoMorador: Morador = {
      nome: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      parentesco: '',
      profissao: '',
      telefone: '',
      email: ''
    };
    setMoradores([...moradores, novoMorador]);
  };

  const removerMorador = (index: number) => {
    setMoradores(moradores.filter((_, i) => i !== index));
  };

  const atualizarMorador = (index: number, campo: keyof Morador, valor: string) => {
    const novosmoradores = [...moradores];
    novosmoradores[index] = { ...novosmoradores[index], [campo]: valor };
    setMoradores(novosmoradores);
  };

  const isReadOnly = isViewing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validações
    const phoneErrors = telefones.filter(phone => phone && !validatePhoneFormat(phone));
    const emailErrors = emails.filter(email => email && !validateEmailFormat(email));
    
    if (phoneErrors.length > 0) {
      setMessage({type: 'error', text: 'Telefone inválido.'});
      setLoading(false);
      return;
    }

    if (emailErrors.length > 0) {
      setMessage({type: 'error', text: 'Formato de e-mail inválido.'});
      setLoading(false);
      return;
    }

    try {
      // Preparar dados do representante legal para envio
      const representanteLegalParaEnvio = showRepresentante ? {
        nome: formData.nome_representante || '',
        cpf: formData.cpf_representante || '',
        rg: formData.rg_representante || '',
        cargo: formData.cargo_representante || '',
        telefone: formData.telefone_representante || '',
        email: formData.email_representante || '',
        // Converter endereço estruturado em string para o banco
        endereco: typeof formData.endereco_representante === 'string' 
          ? formData.endereco_representante 
          : formData.endereco_representante 
            ? `${formData.endereco_representante.rua || ''}, ${formData.endereco_representante.numero || ''}, ${formData.endereco_representante.complemento || ''}, ${formData.endereco_representante.bairro || ''}, ${formData.endereco_representante.cidade || ''} - ${formData.endereco_representante.estado || ''}, CEP: ${formData.endereco_representante.cep || ''}`.replace(/,\s*,/g, ',').replace(/,\s*-/g, ' -').replace(/,\s*CEP:\s*$/g, '').trim()
            : ''
      } : undefined;

      // Limpar campos de data vazios e converter capital_social para string
      const limparCamposData = (dados: any) => {
        const camposData = ['data_nascimento', 'data_constituicao'];
        const dadosLimpos = { ...dados };
        
        camposData.forEach(campo => {
          if (dadosLimpos[campo] === '' || dadosLimpos[campo] === undefined) {
            dadosLimpos[campo] = null;
          }
        });
        
        // Converter capital_social para string se for número
        if (dadosLimpos.capital_social !== null && dadosLimpos.capital_social !== undefined) {
          dadosLimpos.capital_social = String(dadosLimpos.capital_social);
        }
        
        return dadosLimpos;
      };

      // Remover endereco_representante do formData antes de enviar
      const { endereco_representante, ...formDataSemEnderecoRepresentante } = formData;
      
      const dadosParaEnvio = limparCamposData({
        ...formDataSemEnderecoRepresentante,
        telefones: telefones.filter(t => t.trim()),
        emails: emails.filter(e => e.trim()),
        formas_envio_cobranca: formasEnvio.filter(f => f.tipo && f.contato),
        endereco: endereco,
        dados_bancarios: dadosBancarios,
        fiador: showFiador ? fiador : undefined,
        moradores: showMoradores ? moradores : [],
        tem_moradores: showMoradores,
        tem_fiador: showFiador,
        existe_conjuge: showConjuge ? 1 : 0,
        representante_legal: representanteLegalParaEnvio
      });

      let response;
      
      if (isEditing) {
        // Modo edição - obter ID da URL
        const pathParts = window.location.pathname.split('/');
        const locatarioId = pathParts[pathParts.length - 1];
        console.log('💾 Salvando alterações do locatário ID:', locatarioId);
        
        // LOG DETALHADO PARA DEBUG
        console.log('🔍 DADOS SENDO ENVIADOS:', {
          campos_empresa: {
            data_constituicao: dadosParaEnvio.data_constituicao,
            capital_social: dadosParaEnvio.capital_social,
            porte_empresa: dadosParaEnvio.porte_empresa,
            regime_tributario: dadosParaEnvio.regime_tributario
          },
          representante_legal: dadosParaEnvio.representante_legal,
          tipo_pessoa: dadosParaEnvio.tipo_pessoa,
          formas_envio_cobranca: dadosParaEnvio.formas_envio_cobranca,
          total_campos: Object.keys(dadosParaEnvio).length
        });
        console.log('📦 PAYLOAD COMPLETO:', JSON.stringify(dadosParaEnvio, null, 2));
        console.log('💳 FORMAS DE COBRANÇA DETALHADAS:', dadosParaEnvio.formas_envio_cobranca);
        
        // Chamar API de atualização
        response = await apiService.atualizarLocatario(parseInt(locatarioId), dadosParaEnvio);
      } else {
        // Modo cadastro
        response = await apiService.criarLocatario(dadosParaEnvio);
      }
      
      if (response.success) {
        const successMessage = isEditing 
          ? 'Locatário atualizado com sucesso!'
          : 'Locatário cadastrado com sucesso!';
        setMessage({ type: 'success', text: response.message || successMessage });
        // Reset form após sucesso
        // ... (código de reset similar ao cliente)
      } else {
        const errorMessage = isEditing 
          ? 'Erro ao atualizar locatário'
          : 'Erro ao cadastrar locatário';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || (isEditing ? 'Erro ao atualizar locatário' : 'Erro ao cadastrar locatário');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const formatarCPFCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Funções para validação
  const validatePhoneFormat = (phone: string): boolean => {
    // Aceita qualquer formato de telefone
    return true;
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || email === '';
  };

  const isPJ = formData.tipo_pessoa === 'PJ';
  const temPets = formData.pet_inquilino === 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-glass rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-foreground/20 rounded-xl">
                  <Home className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  {isViewing ? 'Visualização de Locatário' : isEditing ? 'Edição de Locatário' : 'Cadastro de Locatário'}
                </h1>
              </div>
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
              >
                <div className="flex items-center space-x-2 text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados...</span>
                </div>
              </motion.div>
            )}

            {/* API Error */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl mb-6 border status-warning"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{apiError}</span>
                </div>
              </motion.div>
            )}

            {/* Success/Error Messages */}
            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl mb-6 border ${
                  message.type === 'success' 
                    ? 'status-success' 
                    : 'status-error'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === 'success' ? (
                    <UserCheck className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <Tabs defaultValue="dados-basicos" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dados-basicos" hasData={!!(formData.nome || formData.cpf_cnpj || telefones.some(t => t) || emails.some(e => e) || endereco.rua || endereco.cidade)}>
                    <User className="w-4 h-4 mr-2" />
                    Dados Básicos
                  </TabsTrigger>
                  <TabsTrigger value="documentos" hasData={false}>
                    <FileText className="w-4 h-4 mr-2" />
                    Documentos
                  </TabsTrigger>
                  <TabsTrigger value="cobranca" hasData={false}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Cobrança
                  </TabsTrigger>
                  <TabsTrigger value="observacoes" hasData={!!formData.observacoes}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Observações
                  </TabsTrigger>
                </TabsList>

                {/* Aba 1: Dados Básicos */}
                <TabsContent value="dados-basicos" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <User className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Dados Básicos
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Informações principais do locatário
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção Tipo de Pessoa e Cliente */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Building className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Classificação do Locatário
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Defina o tipo de pessoa e perfil do cliente
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Tipo de Pessoa *</Label>
                        <Select 
                          value={formData.tipo_pessoa} 
                          onValueChange={(value: 'PF' | 'PJ') => {
                            handleInputChange('tipo_pessoa', value);
                            setShowRepresentante(value === 'PJ');
                          }}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PF">Pessoa Física</SelectItem>
                            <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Define os campos específicos do formulário
                        </p>
                      </div>

                    </div>
                  </motion.div>

                  {/* Seção Dados Pessoais/Empresariais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          {formData.tipo_pessoa === 'PJ' ? <Building className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {formData.tipo_pessoa === 'PJ' ? 'Dados da Empresa' : 'Dados Pessoais'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formData.tipo_pessoa === 'PJ' 
                              ? 'Informações da pessoa jurídica' 
                              : 'Informações da pessoa física'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div>
                        <Label htmlFor="nome" className="text-sm font-medium text-foreground">
                          {formData.tipo_pessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'} *
                        </Label>
                        <InputWithIcon
                          id="nome"
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          placeholder={formData.tipo_pessoa === 'PJ' ? 'Nome da empresa' : 'João Silva'}
                          icon={formData.tipo_pessoa === 'PJ' ? Building : User}
                          required
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cpf_cnpj" className="text-sm font-medium text-foreground">
                          {formData.tipo_pessoa === 'PJ' ? 'CNPJ' : 'CPF'} *
                        </Label>
                        <InputWithIcon
                          id="cpf_cnpj"
                          type="text"
                          value={formData.cpf_cnpj}
                          onChange={(e) => handleInputChange('cpf_cnpj', formatarCPFCNPJ(e.target.value))}
                          placeholder={formData.tipo_pessoa === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                          icon={CreditCard}
                          required
                          disabled={isReadOnly}
                        />
                      </div>
                      
                      {/* Campos específicos para PF */}
                      {!isPJ && (
                        <>
                          <div>
                            <Label htmlFor="rg" className="text-sm font-medium text-foreground">RG</Label>
                            <InputWithIcon
                              id="rg"
                              type="text"
                              value={formData.rg}
                              onChange={(e) => handleInputChange('rg', e.target.value)}
                              placeholder="12.345.678-9"
                              icon={CreditCard}
                              disabled={isReadOnly}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-foreground">Estado Civil</Label>
                            <Select 
                              value={formData.estado_civil} 
                              onValueChange={(value) => handleInputChange('estado_civil', value)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                                <SelectItem value="Casado">Casado(a)</SelectItem>
                                <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                                <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                                <SelectItem value="União Estável">União Estável</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="profissao" className="text-sm font-medium text-foreground">Profissão</Label>
                            <InputWithIcon
                              id="profissao"
                              type="text"
                              value={formData.profissao}
                              onChange={(e) => handleInputChange('profissao', e.target.value)}
                              placeholder="Ex: Engenheiro"
                              icon={UserCheck}
                              disabled={isReadOnly}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="nacionalidade" className="text-sm font-medium text-foreground">Nacionalidade</Label>
                            <InputWithIcon
                              id="nacionalidade"
                              type="text"
                              value={formData.nacionalidade}
                              onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                              placeholder="Brasileira"
                              icon={User}
                              disabled={isReadOnly}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-foreground">Possui cônjuge/companheiro(a)?</Label>
                            <Select value={conjugeSelectValue} onValueChange={handleConjugeChange} disabled={isReadOnly}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sim">Sim</SelectItem>
                                <SelectItem value="Não">Não</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Necessário para regime de bens
                            </p>
                          </div>
                        </>
                      )}

                      {/* Campos específicos para PJ */}
                      {isPJ && (
                        <>
                          <div>
                            <Label htmlFor="nome_fantasia" className="text-sm font-medium text-foreground">Nome Fantasia</Label>
                            <InputWithIcon
                              id="nome_fantasia"
                              type="text"
                              value={formData.nome_fantasia || ''}
                              onChange={(e) => handleInputChange('nome_fantasia', e.target.value)}
                              placeholder="Nome fantasia da empresa"
                              icon={Building}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="inscricao_estadual" className="text-sm font-medium text-foreground">Inscrição Estadual</Label>
                            <InputWithIcon
                              id="inscricao_estadual"
                              type="text"
                              value={formData.inscricao_estadual || ''}
                              onChange={(e) => handleInputChange('inscricao_estadual', e.target.value)}
                              placeholder="000.000.000.000"
                              icon={FileText}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="inscricao_municipal" className="text-sm font-medium text-foreground">Inscrição Municipal</Label>
                            <InputWithIcon
                              id="inscricao_municipal"
                              type="text"
                              value={formData.inscricao_municipal || ''}
                              onChange={(e) => handleInputChange('inscricao_municipal', e.target.value)}
                              placeholder="000000000"
                              icon={FileText}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="atividade_principal" className="text-sm font-medium text-foreground">Atividade Principal</Label>
                            <InputWithIcon
                              id="atividade_principal"
                              type="text"
                              value={formData.atividade_principal || ''}
                              onChange={(e) => handleInputChange('atividade_principal', e.target.value)}
                              placeholder="Ex: Comércio varejista"
                              icon={Building}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="data_constituicao" className="text-sm font-medium text-foreground">Data de Constituição</Label>
                            <InputWithIcon
                              id="data_constituicao"
                              type="date"
                              value={formData.data_constituicao || ''}
                              onChange={(e) => handleInputChange('data_constituicao', e.target.value)}
                              icon={Heart}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="capital_social" className="text-sm font-medium text-foreground">Capital Social</Label>
                            <InputWithIcon
                              id="capital_social"
                              type="text"
                              value={formData.capital_social || ''}
                              onChange={(e) => handleInputChange('capital_social', e.target.value)}
                              placeholder="R$ 10.000,00"
                              icon={CreditCard}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">Porte da Empresa</Label>
                            <Select 
                              value={formData.porte_empresa || ''} 
                              onValueChange={(value) => handleInputChange('porte_empresa', value)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o porte" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MEI">MEI</SelectItem>
                                <SelectItem value="Microempresa">Microempresa</SelectItem>
                                <SelectItem value="Empresa de Pequeno Porte">Empresa de Pequeno Porte</SelectItem>
                                <SelectItem value="Empresa de Médio Porte">Empresa de Médio Porte</SelectItem>
                                <SelectItem value="Grande Empresa">Grande Empresa</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">Regime Tributário</Label>
                            <Select 
                              value={formData.regime_tributario || ''} 
                              onValueChange={(value) => handleInputChange('regime_tributario', value)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o regime" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                                <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                                <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                                <SelectItem value="Lucro Arbitrado">Lucro Arbitrado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                    </div>
                  </motion.div>

                  {/* Formulário do Cônjuge - Posicionado após Dados Pessoais */}
                  {showConjuge && formData.tipo_pessoa === 'PF' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="card-glass p-6 rounded-xl border border-border shadow-sm"
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg shadow-md"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Heart className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Dados do Cônjuge
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações do cônjuge ou companheiro(a)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="regime_bens" className="text-sm font-medium text-foreground">Regime de Bens</Label>
                          <Select 
                            value={formData.regime_bens || ''} 
                            onValueChange={(value) => handleInputChange('regime_bens', value)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o regime de bens" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Comunhão Parcial de Bens">Comunhão Parcial de Bens</SelectItem>
                              <SelectItem value="Comunhão Universal de Bens">Comunhão Universal de Bens</SelectItem>
                              <SelectItem value="Separação Total de Bens">Separação Total de Bens</SelectItem>
                              <SelectItem value="Participação Final nos Aquestos">Participação Final nos Aquestos</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Regime matrimonial de bens aplicável
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nome_conjuge" className="text-sm font-medium text-foreground">Nome do Cônjuge</Label>
                            <InputWithIcon
                              id="nome_conjuge"
                              type="text"
                              value={formData.nome_conjuge || ''}
                              onChange={(e) => handleInputChange('nome_conjuge', e.target.value)}
                              placeholder="Maria Silva"
                              icon={User}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cpf_conjuge" className="text-sm font-medium text-foreground">CPF do Cônjuge</Label>
                            <InputWithIcon
                              id="cpf_conjuge"
                              type="text"
                              value={formData.cpf_conjuge || ''}
                              onChange={(e) => handleInputChange('cpf_conjuge', formatarCPFCNPJ(e.target.value))}
                              placeholder="000.000.000-00"
                              icon={CreditCard}
                              maxLength={14}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rg_conjuge" className="text-sm font-medium text-foreground">RG do Cônjuge</Label>
                            <InputWithIcon
                              id="rg_conjuge"
                              type="text"
                              value={formData.rg_conjuge || ''}
                              onChange={(e) => handleInputChange('rg_conjuge', e.target.value)}
                              placeholder="00.000.000-0"
                              icon={CreditCard}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="telefone_conjuge" className="text-sm font-medium text-foreground">Telefone do Cônjuge</Label>
                            <InputWithIcon
                              id="telefone_conjuge"
                              type="tel"
                              value={formData.telefone_conjuge || ''}
                              onChange={(e) => handleInputChange('telefone_conjuge', e.target.value)}
                              placeholder="(41) 99999-9999"
                              icon={Phone}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Formulário do Representante Legal - Sempre obrigatório para PJ */}
                  {formData.tipo_pessoa === 'PJ' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="card-glass p-6 rounded-xl border border-border shadow-sm"
                    >
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div 
                            className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg shadow-md"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Users className="w-5 h-5 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              Dados do Representante Legal
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Informações do responsável pela empresa
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="nome_representante" className="text-sm font-medium text-foreground">Nome Completo</Label>
                            <InputWithIcon
                              id="nome_representante"
                              type="text"
                              value={formData.nome_representante || ''}
                              onChange={(e) => handleInputChange('nome_representante', e.target.value)}
                              placeholder="João Silva"
                              icon={User}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cpf_representante" className="text-sm font-medium text-foreground">CPF</Label>
                            <InputWithIcon
                              id="cpf_representante"
                              type="text"
                              value={formData.cpf_representante || ''}
                              onChange={(e) => handleInputChange('cpf_representante', formatarCPFCNPJ(e.target.value))}
                              placeholder="000.000.000-00"
                              icon={CreditCard}
                              maxLength={14}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="rg_representante" className="text-sm font-medium text-foreground">RG</Label>
                            <InputWithIcon
                              id="rg_representante"
                              type="text"
                              value={formData.rg_representante || ''}
                              onChange={(e) => handleInputChange('rg_representante', e.target.value)}
                              placeholder="00.000.000-0"
                              icon={CreditCard}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cargo_representante" className="text-sm font-medium text-foreground">Cargo/Função</Label>
                            <InputWithIcon
                              id="cargo_representante"
                              type="text"
                              value={formData.cargo_representante || ''}
                              onChange={(e) => handleInputChange('cargo_representante', e.target.value)}
                              placeholder="Ex: Diretor, Sócio"
                              icon={UserCheck}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="telefone_representante" className="text-sm font-medium text-foreground">Telefone</Label>
                            <InputWithIcon
                              id="telefone_representante"
                              type="tel"
                              value={formData.telefone_representante || ''}
                              onChange={(e) => handleInputChange('telefone_representante', e.target.value)}
                              placeholder="(41) 99999-9999"
                              icon={Phone}
                              disabled={isReadOnly}
                            />
                          </div>

                          <div>
                            <Label htmlFor="email_representante" className="text-sm font-medium text-foreground">E-mail</Label>
                            <InputWithIcon
                              id="email_representante"
                              type="email"
                              value={formData.email_representante || ''}
                              onChange={(e) => handleInputChange('email_representante', e.target.value)}
                              placeholder="representante@empresa.com"
                              icon={Mail}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>

                        {/* Endereço do Representante */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-primary" />
                            Endereço do Representante
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                              <Label htmlFor="rua_representante" className="text-sm font-medium text-foreground">Rua/Avenida</Label>
                              <InputWithIcon
                                id="rua_representante"
                                type="text"
                                value={formData.endereco_representante?.rua || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, rua: e.target.value })}
                                placeholder="Rua das Flores"
                                icon={MapPin}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="numero_representante" className="text-sm font-medium text-foreground">Número</Label>
                              <InputWithIcon
                                id="numero_representante"
                                type="text"
                                value={formData.endereco_representante?.numero || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, numero: e.target.value })}
                                placeholder="123"
                                icon={Home}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="complemento_representante" className="text-sm font-medium text-foreground">Complemento</Label>
                              <InputWithIcon
                                id="complemento_representante"
                                type="text"
                                value={formData.endereco_representante?.complemento || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, complemento: e.target.value })}
                                placeholder="Apto 45"
                                icon={Building}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="bairro_representante" className="text-sm font-medium text-foreground">Bairro</Label>
                              <InputWithIcon
                                id="bairro_representante"
                                type="text"
                                value={formData.endereco_representante?.bairro || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, bairro: e.target.value })}
                                placeholder="Centro"
                                icon={MapPin}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="cidade_representante" className="text-sm font-medium text-foreground">Cidade</Label>
                              <InputWithIcon
                                id="cidade_representante"
                                type="text"
                                value={formData.endereco_representante?.cidade || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, cidade: e.target.value })}
                                placeholder="Curitiba"
                                icon={Building2}
                                disabled={isReadOnly}
                              />
                            </div>

                            <div>
                              <Label htmlFor="estado_representante" className="text-sm font-medium text-foreground">Estado</Label>
                              <Select 
                                value={formData.endereco_representante?.estado || ''} 
                                onValueChange={(value) => handleInputChange('endereco_representante', { ...formData.endereco_representante, estado: value })}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AC">AC</SelectItem>
                                  <SelectItem value="AL">AL</SelectItem>
                                  <SelectItem value="AP">AP</SelectItem>
                                  <SelectItem value="AM">AM</SelectItem>
                                  <SelectItem value="BA">BA</SelectItem>
                                  <SelectItem value="CE">CE</SelectItem>
                                  <SelectItem value="DF">DF</SelectItem>
                                  <SelectItem value="ES">ES</SelectItem>
                                  <SelectItem value="GO">GO</SelectItem>
                                  <SelectItem value="MA">MA</SelectItem>
                                  <SelectItem value="MT">MT</SelectItem>
                                  <SelectItem value="MS">MS</SelectItem>
                                  <SelectItem value="MG">MG</SelectItem>
                                  <SelectItem value="PA">PA</SelectItem>
                                  <SelectItem value="PB">PB</SelectItem>
                                  <SelectItem value="PR">PR</SelectItem>
                                  <SelectItem value="PE">PE</SelectItem>
                                  <SelectItem value="PI">PI</SelectItem>
                                  <SelectItem value="RJ">RJ</SelectItem>
                                  <SelectItem value="RN">RN</SelectItem>
                                  <SelectItem value="RS">RS</SelectItem>
                                  <SelectItem value="RO">RO</SelectItem>
                                  <SelectItem value="RR">RR</SelectItem>
                                  <SelectItem value="SC">SC</SelectItem>
                                  <SelectItem value="SP">SP</SelectItem>
                                  <SelectItem value="SE">SE</SelectItem>
                                  <SelectItem value="TO">TO</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="cep_representante" className="text-sm font-medium text-foreground">CEP</Label>
                              <InputWithIcon
                                id="cep_representante"
                                type="text"
                                value={formData.endereco_representante?.cep || ''}
                                onChange={(e) => handleInputChange('endereco_representante', { ...formData.endereco_representante, cep: e.target.value })}
                                placeholder="00000-000"
                                icon={MapPin}
                                maxLength={9}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Seção Informações de Contato */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Phone className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Informações de Contato
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Telefones e e-mails para contato
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Telefones */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-primary" />
                          Telefones
                        </h4>
                        <div className="space-y-3">
                          {telefones.map((telefone, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="flex-1">
                                <InputWithIcon
                                  type="tel"
                                  value={telefone}
                                  onChange={(e) => updateTelefone(index, e.target.value)}
                                  placeholder="(41) 99999-9999"
                                  icon={Phone}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeTelefone(index)}
                                disabled={telefones.length === 1 || isReadOnly}
                                className="px-3 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addTelefone}
                            className="w-full border-dashed hover:border-primary hover:text-primary"
                            disabled={isReadOnly}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Telefone
                          </Button>
                        </div>
                      </div>
                      
                      {/* E-mails */}
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-primary" />
                          E-mails
                        </h4>
                        <div className="space-y-3">
                          {emails.map((email, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="flex-1">
                                <InputWithIcon
                                  type="email"
                                  value={email}
                                  onChange={(e) => updateEmail(index, e.target.value)}
                                  placeholder="locatario@email.com"
                                  icon={Mail}
                                  disabled={isReadOnly}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEmail(index)}
                                disabled={emails.length === 1 || isReadOnly}
                                className="px-3 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addEmail}
                            className="w-full border-dashed hover:border-primary hover:text-primary"
                            disabled={isReadOnly}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar E-mail
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção de Endereço integrada */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MapPin className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Endereço
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Endereço completo do locatário
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2">
                        <Label htmlFor="rua" className="text-sm font-medium text-foreground">Rua/Avenida</Label>
                        <InputWithIcon
                          id="rua"
                          type="text"
                          value={endereco.rua}
                          onChange={(e) => setEndereco(prev => ({ ...prev, rua: e.target.value }))}
                          placeholder="Rua das Flores"
                          icon={MapPin}
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="numero" className="text-sm font-medium text-foreground">Número</Label>
                        <InputWithIcon
                          id="numero"
                          type="text"
                          value={endereco.numero}
                          onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                          placeholder="123"
                          icon={Home}
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="complemento" className="text-sm font-medium text-foreground">Complemento</Label>
                        <InputWithIcon
                          id="complemento"
                          type="text"
                          value={endereco.complemento}
                          onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                          placeholder="Apto 45"
                          icon={Building}
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bairro" className="text-sm font-medium text-foreground">Bairro</Label>
                        <InputWithIcon
                          id="bairro"
                          type="text"
                          value={endereco.bairro}
                          onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                          placeholder="Centro"
                          icon={MapPin}
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cidade" className="text-sm font-medium text-foreground">Cidade</Label>
                        <InputWithIcon
                          id="cidade"
                          type="text"
                          value={endereco.cidade}
                          onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Curitiba"
                          icon={Building2}
                          disabled={isReadOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="estado" className="text-sm font-medium text-foreground">Estado</Label>
                        <Select 
                          value={endereco.estado} 
                          onValueChange={(value) => setEndereco(prev => ({ ...prev, estado: value }))}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">AC</SelectItem>
                            <SelectItem value="AL">AL</SelectItem>
                            <SelectItem value="AP">AP</SelectItem>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="BA">BA</SelectItem>
                            <SelectItem value="CE">CE</SelectItem>
                            <SelectItem value="DF">DF</SelectItem>
                            <SelectItem value="ES">ES</SelectItem>
                            <SelectItem value="GO">GO</SelectItem>
                            <SelectItem value="MA">MA</SelectItem>
                            <SelectItem value="MT">MT</SelectItem>
                            <SelectItem value="MS">MS</SelectItem>
                            <SelectItem value="MG">MG</SelectItem>
                            <SelectItem value="PA">PA</SelectItem>
                            <SelectItem value="PB">PB</SelectItem>
                            <SelectItem value="PR">PR</SelectItem>
                            <SelectItem value="PE">PE</SelectItem>
                            <SelectItem value="PI">PI</SelectItem>
                            <SelectItem value="RJ">RJ</SelectItem>
                            <SelectItem value="RN">RN</SelectItem>
                            <SelectItem value="RS">RS</SelectItem>
                            <SelectItem value="RO">RO</SelectItem>
                            <SelectItem value="RR">RR</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="SP">SP</SelectItem>
                            <SelectItem value="SE">SE</SelectItem>
                            <SelectItem value="TO">TO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cep" className="text-sm font-medium text-foreground">CEP</Label>
                        <InputWithIcon
                          id="cep"
                          type="text"
                          value={endereco.cep}
                          onChange={(e) => setEndereco(prev => ({ ...prev, cep: e.target.value }))}
                          placeholder="00000-000"
                          icon={MapPin}
                          maxLength={9}
                          disabled={isReadOnly}
                        />
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 2: Documentos */}
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
                          Documentos do Locatário
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Faça upload dos documentos do locatário. Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Documentos Obrigatórios */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Documentos Obrigatórios
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estes documentos são necessários para o cadastro do locatário.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.tipo_pessoa === 'PF' ? (
                        <>
                          <FileUpload
                            label="CPF"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('CPF:', file)}
                            required
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="RG"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('RG:', file)}
                            required
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Comprovante de Renda"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Renda:', file)}
                            required
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Comprovante de Estado Civil"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Estado Civil:', file)}
                            disabled={isReadOnly}
                          />
                        </>
                      ) : (
                        <>
                          <FileUpload
                            label="Contrato Social"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Contrato Social:', file)}
                            required
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="CNPJ Atualizado"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('CNPJ:', file)}
                            required
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Cartão CNPJ"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Cartão CNPJ:', file)}
                            required
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Última Alteração Contratual"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Alteração:', file)}
                            disabled={isReadOnly}
                          />
                        </>
                      )}
                      
                      <FileUpload
                        label="Comprovante de Endereço"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                        onFileSelect={(file) => console.log('Endereço:', file)}
                        required
                        disabled={isReadOnly}
                      />
                      
                      {formData.tipo_pessoa === 'PJ' && (
                        <FileUpload
                          label="RG do Representante Legal"
                          accept=".pdf,.jpg,.jpeg,.png"
                          maxSize={5}
                          onFileSelect={(file) => console.log('RG Representante:', file)}
                          required
                          disabled={isReadOnly}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* Documentos Opcionais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Documentos Opcionais
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Documentos complementares que podem ser úteis para o cadastro.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.tipo_pessoa === 'PF' ? (
                        <>
                          <FileUpload
                            label="Certidão de Casamento"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Casamento:', file)}
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Comprovante de Bens"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Bens:', file)}
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Declaração de Imposto de Renda"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('IR:', file)}
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="RG do Cônjuge"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('RG Cônjuge:', file)}
                            disabled={isReadOnly}
                          />
                        </>
                      ) : (
                        <>
                          <FileUpload
                            label="Balanço Patrimonial"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Balanço:', file)}
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Demonstração de Resultado"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('DRE:', file)}
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Certidão Negativa de Débitos"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Certidão:', file)}
                            disabled={isReadOnly}
                          />
                          <FileUpload
                            label="Procuração (se aplicável)"
                            accept=".pdf,.jpg,.jpeg,.png"
                            maxSize={5}
                            onFileSelect={(file) => console.log('Procuração:', file)}
                            disabled={isReadOnly}
                          />
                        </>
                      )}
                      
                      <FileUpload
                        label="Outros Documentos"
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                        onFileSelect={(file) => console.log('Outros:', file)}
                        disabled={isReadOnly}
                      />
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 3: Cobrança */}
                <TabsContent value="cobranca" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Configurações de Cobrança
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Configure como o locatário receberá os boletos de cobrança
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Formas de Envio */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <DollarSign className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Formas de Envio do Boleto
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione as formas de envio preferidas para recebimento dos boletos
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {formasEnvio.map((forma, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border rounded-lg">
                          <div>
                            <Label className="text-sm font-medium text-foreground">Forma de Envio</Label>
                            <Select 
                              value={forma.tipo} 
                              onValueChange={(value) => updateFormaEnvio(index, 'tipo', value)}
                              disabled={isReadOnly}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="imovel">Dentro do Imóvel</SelectItem>
                                <SelectItem value="email">E-mail</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-foreground">
                              {forma.tipo === 'email' ? 'E-mail' : 
                               forma.tipo === 'whatsapp' ? 'WhatsApp' : 
                               forma.tipo === 'imovel' ? 'Observações' : 'Contato'}
                            </Label>
                            {forma.tipo === 'imovel' ? (
                              <InputWithIcon
                                type="text"
                                value={forma.contato}
                                onChange={(e) => updateFormaEnvio(index, 'contato', e.target.value)}
                                placeholder="Ex: Deixar na portaria"
                                icon={Home}
                                disabled={isReadOnly}
                              />
                            ) : forma.tipo === 'email' ? (
                              <InputWithIcon
                                type="email"
                                value={forma.contato}
                                onChange={(e) => updateFormaEnvio(index, 'contato', e.target.value)}
                                placeholder="email@exemplo.com"
                                icon={Mail}
                                disabled={isReadOnly}
                              />
                            ) : forma.tipo === 'whatsapp' ? (
                              <InputWithIcon
                                type="tel"
                                value={forma.contato}
                                onChange={(e) => updateFormaEnvio(index, 'contato', e.target.value)}
                                placeholder="(41) 99999-9999"
                                icon={Phone}
                                disabled={isReadOnly}
                              />
                            ) : (
                              <InputWithIcon
                                type="text"
                                value={forma.contato}
                                onChange={(e) => updateFormaEnvio(index, 'contato', e.target.value)}
                                placeholder="Informações de contato"
                                icon={MessageSquare}
                                disabled
                              />
                            )}
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFormaEnvio(index)}
                              disabled={formasEnvio.length === 1 || isReadOnly}
                              className="px-3 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFormaEnvio}
                        className="w-full border-dashed hover:border-primary hover:text-primary"
                        disabled={isReadOnly}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Forma de Envio
                      </Button>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Aba 4: Observações */}
                <TabsContent value="observacoes" className="space-y-8">
                  {/* Header da Seção */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <motion.div 
                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <MessageSquare className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Observações
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Informações adicionais sobre o locatário
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Seção de Observações Gerais */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="card-glass p-6 rounded-xl border border-border shadow-sm"
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div 
                          className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <MessageSquare className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">
                            Observações Gerais
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione informações complementares relevantes
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="observacoes" className="text-sm font-medium text-foreground">Observações</Label>
                        <Textarea
                          id="observacoes"
                          value={formData.observacoes}
                          onChange={(e) => handleInputChange('observacoes', e.target.value)}
                          placeholder="Digite aqui informações adicionais sobre o locatário, como características especiais, histórico, preferências ou qualquer detalhe importante para o cadastro..."
                          rows={8}
                          className="resize-none"
                          disabled={isReadOnly}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Utilize este espaço para registrar informações que não se encaixam nos outros campos
                        </p>
                      </div>

                      {/* Informações sobre o campo */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                              Sugestões para observações:
                            </h4>
                            <ul className="space-y-1 text-xs">
                              <li>• Histórico de locações anteriores</li>
                              <li>• Preferências ou restrições específicas</li>
                              <li>• Informações sobre pets ou animais</li>
                              <li>• Detalhes sobre moradores adicionais</li>
                              <li>• Condições ou acordos especiais</li>
                              <li>• Anotações sobre documentação pendente</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>

            {/* Submit Button */}
            {!isViewing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="pt-6"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full btn-gradient py-6 text-lg font-semibold rounded-xl border-0 shadow-2xl hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>{isEditing ? 'Salvando...' : 'Cadastrando...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Home className="w-5 h-5" />
                        <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Locatário'}</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};