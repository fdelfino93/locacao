import React, { useState } from 'react';
import { useEntitySearch, useAdvancedSearch } from '../../hooks/useSearch';
import {
  Search,
  Filter,
  Users,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit3,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  PawPrint
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';
import { apiService } from '../../services/api';

interface Locatario {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  ativo: boolean;
  tipo_pessoa?: string;
  estado_civil?: string;
  profissao?: string;
  pet_inquilino?: boolean;
  qtd_pet_inquilino?: number;
  porte_pet?: string;
  contratos_ativos?: number;
  data_nascimento?: string;
}

interface LocatariosListingProps {
  onLocatarioClick?: (locatario: Locatario) => void;
  onLocatarioEdit?: (locatario: Locatario) => void;
  className?: string;
}

const LocatariosListing: React.FC<LocatariosListingProps> = ({
  onLocatarioClick,
  onLocatarioEdit,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const {
    filters,
    updateFilter,
    clearFilters,
    hasFilters,
    removeFilter
  } = useAdvancedSearch();

  const handleStatusChange = async (locatarioId: number, novoStatus: boolean) => {
    try {
      await apiService.requestPublic(`locatarios/${locatarioId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ ativo: novoStatus })
      });
      
      // Recarregar os dados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  // Combinar termo de busca com filtros
  const searchFilters = {
    ...filters,
    q: searchTerm,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  };

  const { data, isLoading, error } = useEntitySearch('locatarios', searchFilters);

  const locatarios = data?.dados || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key, value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const formatCpfCnpj = (cpfCnpj: string) => {
    if (cpfCnpj.length === 11) {
      return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cpfCnpj.length === 14) {
      return cpfCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cpfCnpj;
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };


  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <Users className="w-12 h-12 mx-auto mb-4 text-red-300" />
        <div>Erro ao carregar locatários</div>
        <div className="text-sm">Tente recarregar a página</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Locatários</h2>
          <p className="text-gray-600">
            {total} locatário{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por nome, CPF/CNPJ, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <Input
                value={filters.nome || ''}
                onChange={(e) => handleFilterChange('nome', e.target.value)}
                placeholder="Nome do locatário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ
              </label>
              <Input
                value={filters.cpf_cnpj || ''}
                onChange={(e) => handleFilterChange('cpf_cnpj', e.target.value)}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <Input
                value={filters.telefone || ''}
                onChange={(e) => handleFilterChange('telefone', e.target.value)}
                placeholder="Telefone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <Input
                value={filters.email || ''}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="E-mail"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <Select
                value={filters.tipo_pessoa || ''}
                onValueChange={(value) => handleFilterChange('tipo_pessoa', value)}
              >
                <option value="">Todos</option>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <Select
                value={filters.order_by || 'nome'}
                onValueChange={(value) => handleFilterChange('order_by', value)}
              >
                <option value="nome">Nome</option>
                <option value="cpf_cnpj">CPF/CNPJ</option>
                <option value="email">E-mail</option>
                <option value="data_nascimento">Data Nascimento</option>
              </Select>
            </div>

            <div className="flex items-end">
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros ativos */}
          {hasFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {key}: {String(value)}
                    <button
                      onClick={() => removeFilter(key)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Lista de locatários */}
      {!isLoading && (
        <>
          {locatarios.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum locatário encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {locatarios.map((locatario: Locatario) => (
                <Card key={locatario.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {locatario.nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={locatario.ativo ? 'success' : 'secondary'}>
                          {locatario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {locatario.pet_inquilino && (
                          <Badge variant="info" className="flex items-center gap-1">
                            <PawPrint className="w-3 h-3" />
                            {locatario.qtd_pet_inquilino} Pet{locatario.qtd_pet_inquilino !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                        <button
                          onClick={() => onLocatarioClick?.(locatario)}
                          className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <Eye className="w-3 h-3" />
                          Ver detalhes
                        </button>
                        <button
                          onClick={() => onLocatarioEdit?.(locatario)}
                          className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                        <button
                          onClick={() => handleStatusChange(locatario.id, true)}
                          className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left disabled:opacity-50"
                          disabled={locatario.ativo === true}
                        >
                          <UserCheck className="w-3 h-3" />
                          Ativo
                        </button>
                        <button
                          onClick={() => handleStatusChange(locatario.id, false)}
                          className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left disabled:opacity-50"
                          disabled={locatario.ativo === false}
                        >
                          <UserX className="w-3 h-3" />
                          Inativo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">CPF/CNPJ:</span>
                      {formatCpfCnpj(locatario.cpf_cnpj)}
                    </div>
                    
                    {locatario.telefone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {locatario.telefone}
                      </div>
                    )}
                    
                    {locatario.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {locatario.email}
                      </div>
                    )}
                    
                    {locatario.endereco && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {locatario.endereco}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                    {locatario.estado_civil && (
                      <div>
                        <div className="text-xs text-gray-600">Estado Civil</div>
                        <div className="text-sm font-medium">{locatario.estado_civil}</div>
                      </div>
                    )}
                    {locatario.profissao && (
                      <div>
                        <div className="text-xs text-gray-600">Profissão</div>
                        <div className="text-sm font-medium">{locatario.profissao}</div>
                      </div>
                    )}
                    {locatario.contratos_ativos !== undefined && (
                      <div>
                        <div className="text-xs text-gray-600">Contratos</div>
                        <div className="text-sm font-medium text-green-600">{locatario.contratos_ativos}</div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => onLocatarioClick?.(locatario)}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    Ver Detalhes
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} até {Math.min(currentPage * itemsPerPage, total)} de {total} resultados
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LocatariosListing;