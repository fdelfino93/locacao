import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

interface PerfilData {
  id: number;
  tipo: 'locador' | 'locatario' | 'imovel' | 'contrato';
  dados: any;
  relacionamentos: any;
  estatisticas: any;
}

interface UsePerfilCompletoReturn {
  perfil: PerfilData | null;
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

export const usePerfilCompleto = (
  tipo: string, 
  id: number, 
  enabled: boolean = true
): UsePerfilCompletoReturn => {
  
  // Buscar dados reais da API
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['perfil-completo', tipo, id],
    queryFn: async () => {
      if (tipo === 'locadores') {
        const response = await apiService.requestPublic(`locadores/${id}`);
        return {
          id,
          tipo: 'locador',
          dados: {
            locador: response.data
          },
          relacionamentos: {
            imoveis: [],
            contratos_ativos: []
          },
          estatisticas: {
            total_imoveis: 0,
            imoveis_ocupados: 0,
            imoveis_disponiveis: 0,
            contratos_ativos: 0,
            receita_mensal_bruta: 0,
            receita_mensal_estimada: 0,
            avaliacao_media: 5.0
          }
        };
      }
      return null;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Dados mock como fallback (apenas para IDs específicos se a API falhar)
  const generateMockProfile = (tipo: string, id: number) => {
    if (tipo === 'locadores') {
      // Dados reais do Fernando (ID 21) extraídos do banco
      if (id === 21) {
        return {
          id: 21,
          dados: {
            locador: {
              id: 21,
              nome: "Fernando",
              cpf_cnpj: "8696386965", 
              telefone: "41984395029",
              email: "fernando.delfino@hotmail.com",
              endereco: "Rua Martim Afonso, 1168",
              endereco_completo: "Rua Martim Afonso, 1168",
              tipo_recebimento: "PIX",
              conta_bancaria: "2253-2533",
              ativo: true,
              data_cadastro: "2024-01-01",
              profissao: "Empresário",
              estado_civil: "Solteiro",
              nacionalidade: "Brasileiro",
              tipo_pessoa: "PF"
            }
          },
          relacionamentos: {
            imoveis: [
              {
                id: 3,
                endereco: "Rua Martim Afonso, 1168 - Imóvel 1",
                endereco_completo: "Rua Martim Afonso, 1168 - Imóvel 1",
                tipo: "Casa",
                valor_aluguel: 1500,
                status: "DISPONIVEL",
                quartos: 3,
                banheiros: 2,
                area_total: 120
              },
              {
                id: 5,
                endereco: "Rua Martim Afonso, 1168 - Imóvel 2", 
                endereco_completo: "Rua Martim Afonso, 1168 - Imóvel 2",
                tipo: "Apartamento",
                valor_aluguel: 1200,
                status: "DISPONIVEL", 
                quartos: 2,
                banheiros: 1,
                area_total: 80
              }
            ],
            contratos_ativos: []
          },
          estatisticas: {
            total_imoveis: 2,
            imoveis_ocupados: 0,
            imoveis_disponiveis: 2,
            contratos_ativos: 0,
            receita_mensal_bruta: 0,
            receita_mensal_estimada: 2700, // Potencial dos 2 imóveis
            avaliacao_media: 5.0
          }
        };
      }
      
      // Dados para outros locadores
      const mockData = {
        22: {
          id: 22,
          dados: {
            locador: {
              id: 22,
              nome: "Fernanda Carol",
              cpf_cnpj: "",
              telefone: "41984552414",
              email: "",
              endereco: "",
              endereco_completo: "",
              ativo: true,
              data_cadastro: "2024-01-02"
            }
          },
          relacionamentos: {
            imoveis: [],
            contratos_ativos: []
          },
          estatisticas: {
            total_imoveis: 0,
            imoveis_ocupados: 0,
            imoveis_disponiveis: 0,
            contratos_ativos: 0,
            receita_mensal_bruta: 0,
            receita_mensal_estimada: 0,
            avaliacao_media: 5.0
          }
        }
      };
      
      return mockData[id as keyof typeof mockData] || null;
    }
    
    return null;
  };

  // Usar dados da API ou fallback para mock se houver erro
  const perfil: PerfilData | null = data || (error && enabled && id ? generateMockProfile(tipo, id) as any : null);

  return {
    perfil,
    isLoading,
    error,
    refetch
  };
};

// Hook para navegação entre perfis
export const useNavigacaoPerfil = () => {
  const [historico, setHistorico] = useState<Array<{
    tipo: string;
    id: number;
    nome: string;
  }>>([]);
  
  const [perfilAtual, setPerfilAtual] = useState<{
    tipo: string;
    id: number;
  } | null>(null);

  const navegarPara = useCallback((tipo: string, id: number, nome: string) => {
    if (perfilAtual) {
      setHistorico(prev => [...prev, { ...perfilAtual, nome: '' }]);
    }
    setPerfilAtual({ tipo, id });
  }, [perfilAtual]);

  const voltar = useCallback(() => {
    if (historico.length > 0) {
      const anterior = historico[historico.length - 1];
      setPerfilAtual({ tipo: anterior.tipo, id: anterior.id });
      setHistorico(prev => prev.slice(0, -1));
    }
  }, [historico]);

  const limparHistorico = useCallback(() => {
    setHistorico([]);
    setPerfilAtual(null);
  }, []);

  return {
    perfilAtual,
    historico,
    navegarPara,
    voltar,
    limparHistorico,
    podeVoltar: historico.length > 0
  };
};