import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Loader2, AlertCircle } from 'lucide-react';
import type { Imovel, Endereco, InformacoesIPTU, DadosGeraisImovel } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';

export const ImovelTestSimple: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [inquilinos, setInquilinos] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const [dadosGerais, setDadosGerais] = useState<DadosGeraisImovel>({
    quartos: 0,
    suites: 0,
    banheiros: 0,
    salas: 0,
    cozinha: 0,
    tem_garagem: false,
    qtd_garagem: undefined,
    tem_sacada: false,
    qtd_sacada: undefined,
    tem_churrasqueira: false,
    qtd_churrasqueira: undefined,
    mobiliado: 'nao',
    permite_pets: false
  });

  const [formData, setFormData] = useState<Omit<Imovel, 'endereco' | 'informacoes_iptu' | 'dados_gerais'>>({
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
    area_total: '',
    area_privativa: '',
    dados_imovel: '',
    info_iptu: '',
    observacoes_condominio: '',
    copel_unidade_consumidora: '',
    sanepar_matricula: '',
    tem_gas: false,
    info_gas: '',
    boleto_condominio: false
  });

  // ✅ Hook para detectar dados preenchidos em cada seção
  const sectionsData = useFormSectionsData({...formData, endereco, informacoesIPTU, dadosGerais}, {
    responsaveis: ['id_cliente'],
    endereco: ['endereco', 'rua', 'numero', 'bairro', 'cidade', 'uf', 'cep', 'tipo', 'status', 'area_imovel', 'matricula_imovel', 'dados_imovel'],
    encargos: ['iptu', 'condominio', 'taxa_incendio', 'titular', 'inscricao_imobiliaria', 'indicacao_fiscal'],
    valores: ['valor_aluguel']
  });
  
  useEffect(() => {
    console.log('ImovelTestSimple: iniciando useEffect');
    
    const loadData = async () => {
      console.log('ImovelTestSimple: iniciando loadData');
      setLoadingData(true);
      setApiError(null);
      
      try {
        console.log('ImovelTestSimple: fazendo healthCheck');
        await apiService.healthCheck();
        
        console.log('ImovelTestSimple: carregando locadores e locatários');
        const [locadoresResponse, locatariosResponse] = await Promise.all([
          apiService.listarLocadores().catch(() => ({ success: false, data: [] })),
          apiService.listarLocatarios().catch(() => ({ success: false, data: [] }))
        ]);

        console.log('ImovelTestSimple: responses:', { locadoresResponse, locatariosResponse });

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
        console.error('ImovelTestSimple: erro ao carregar dados:', error);
        setApiError('API não está disponível. Inicie o backend.');
      } finally {
        console.log('ImovelTestSimple: finalizando loadData');
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  console.log('ImovelTestSimple: renderizando...');

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
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Teste Imóvel V2</h1>
            </div>
          </div>

          <div className="p-8">
            {loadingData && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2 text-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Carregando dados...</span>
                </div>
              </div>
            )}

            {!loadingData && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Teste de Componente Básico</h2>
                <p className="text-muted-foreground">Este é um teste básico com a estrutura da V2.</p>
                <div className="p-4 bg-card rounded border">
                  <p className="text-card-foreground">Conteúdo renderizado com sucesso!</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};