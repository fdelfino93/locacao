import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users, 
  UserCheck, 
  Home, 
  FileText, 
  Loader2,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const SimpleSearchModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({ 
    locadores: [], 
    locatarios: [], 
    imoveis: [], 
    contratos: [] 
  });

  // Dados de exemplo para fallback
  const mockData = {
    locadores: [
      { id: 1, nome: 'João Silva', telefone: '(11) 99999-1111', email: 'joao@email.com', ativo: true },
      { id: 2, nome: 'Maria Santos', telefone: '(11) 99999-2222', email: 'maria@email.com', ativo: true },
      { id: 3, nome: 'Pedro Costa', telefone: '(11) 99999-3333', email: 'pedro@email.com', ativo: false }
    ],
    locatarios: [
      { id: 1, nome: 'Fernanda Souza', telefone: '(11) 88888-1111', profissao: 'Engenheira', status_contrato: 'ativo' },
      { id: 2, nome: 'Roberto Silva', telefone: '(11) 88888-2222', profissao: 'Professor', status_contrato: 'ativo' },
      { id: 3, nome: 'Juliana Costa', telefone: '(11) 88888-3333', profissao: 'Médica', status_contrato: 'inativo' }
    ],
    imoveis: [
      { id: 1, endereco: 'Av. Paulista, 1000', tipo: 'Apartamento', valor_aluguel: 2500, status: 'ocupado' },
      { id: 2, endereco: 'Rua Augusta, 500', tipo: 'Casa', valor_aluguel: 3200, status: 'disponivel' },
      { id: 3, endereco: 'Rua Consolação, 300', tipo: 'Kitnet', valor_aluguel: 1200, status: 'disponivel' }
    ],
    contratos: [
      { id: 1, locatario: 'Fernanda Souza', imovel: 'Av. Paulista, 1000', valor_aluguel: 2500, status: 'ativo' },
      { id: 2, locatario: 'Roberto Silva', imovel: 'Rua Augusta, 500', valor_aluguel: 3200, status: 'ativo' },
      { id: 3, locatario: 'Ex-locatário', imovel: 'Rua Centro, 100', valor_aluguel: 1800, status: 'vencido' }
    ]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Função para buscar dados
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/search/locadores?limit=10');
      if (!response.ok) {
        throw new Error('API não disponível');
      }
      
      const result = await response.json();
      if (result.success) {
        setData(prev => ({ ...prev, locadores: result.dados || [] }));
      }
    } catch (err) {
      console.warn('Usando dados de exemplo:', err);
      setError('Servidor offline - exibindo dados de exemplo');
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao inicializar
  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar dados baseado na busca
  const filteredData = {
    locadores: data.locadores.filter((item: any) => 
      !searchQuery || item.nome?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    locatarios: data.locatarios.filter((item: any) => 
      !searchQuery || item.nome?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    imoveis: data.imoveis.filter((item: any) => 
      !searchQuery || item.endereco?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    contratos: data.contratos.filter((item: any) => 
      !searchQuery || item.locatario?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <Search className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">Busca - Sistema Cobimob</h1>
            </div>
            <p className="text-primary-foreground/80 mt-2">Encontre locadores, locatários, imóveis e contratos</p>
          </div>

          <div className="p-8">
            {/* Status */}
            {error && (
              <div className="status-info mb-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Campo de Busca */}
            <div className="form-section mb-8">
              <div className="form-group">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Digite para buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-section pl-12"
                      disabled={loading}
                    />
                  </div>
                  
                  <button 
                    className="btn-primary"
                    onClick={fetchData}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Atualizar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Locadores */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {filteredData.locadores.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Locadores</h3>
              </div>

              {/* Locatários */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <UserCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {filteredData.locatarios.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Locatários</h3>
              </div>

              {/* Imóveis */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {filteredData.imoveis.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Imóveis</h3>
              </div>

              {/* Contratos */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  <span className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {filteredData.contratos.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">Contratos</h3>
              </div>
            </div>

            {/* Lista de Resultados */}
            <div className="space-y-8">
              {/* Locadores */}
              {filteredData.locadores.length > 0 && (
                <div className="form-section">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Users className="w-6 h-6 text-blue-600 mr-2" />
                    Locadores ({filteredData.locadores.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredData.locadores.map((locador: any) => (
                      <div key={locador.id} className="card p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{locador.nome}</h4>
                            <p className="text-muted-foreground">{locador.telefone}</p>
                            <p className="text-muted-foreground">{locador.email}</p>
                          </div>
                          <span className={locador.ativo ? 'status-success' : 'status-error'}>
                            {locador.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locatários */}
              {filteredData.locatarios.length > 0 && (
                <div className="form-section">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <UserCheck className="w-6 h-6 text-green-600 mr-2" />
                    Locatários ({filteredData.locatarios.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredData.locatarios.map((locatario: any) => (
                      <div key={locatario.id} className="card p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{locatario.nome}</h4>
                            <p className="text-muted-foreground">{locatario.telefone}</p>
                            <p className="text-muted-foreground">{locatario.profissao}</p>
                          </div>
                          <span className={locatario.status_contrato === 'ativo' ? 'status-success' : 'status-error'}>
                            {locatario.status_contrato}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imóveis */}
              {filteredData.imoveis.length > 0 && (
                <div className="form-section">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Home className="w-6 h-6 text-purple-600 mr-2" />
                    Imóveis ({filteredData.imoveis.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredData.imoveis.map((imovel: any) => (
                      <div key={imovel.id} className="card p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{imovel.endereco}</h4>
                            <p className="text-muted-foreground">{imovel.tipo}</p>
                            <p className="text-muted-foreground">{formatCurrency(imovel.valor_aluguel)}</p>
                          </div>
                          <span className={imovel.status === 'disponivel' ? 'status-success' : 'status-warning'}>
                            {imovel.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contratos */}
              {filteredData.contratos.length > 0 && (
                <div className="form-section">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <FileText className="w-6 h-6 text-amber-600 mr-2" />
                    Contratos ({filteredData.contratos.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredData.contratos.map((contrato: any) => (
                      <div key={contrato.id} className="card p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg">{contrato.locatario}</h4>
                            <p className="text-muted-foreground">{contrato.imovel}</p>
                            <p className="text-muted-foreground">{formatCurrency(contrato.valor_aluguel)}</p>
                          </div>
                          <span className={
                            contrato.status === 'ativo' ? 'status-success' : 
                            contrato.status === 'vencido' ? 'status-error' : 'status-warning'
                          }>
                            {contrato.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado vazio */}
              {!loading && (
                filteredData.locadores.length === 0 && 
                filteredData.locatarios.length === 0 && 
                filteredData.imoveis.length === 0 && 
                filteredData.contratos.length === 0
              ) && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleSearchModule;