import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Users, Home, FileText, UserCheck } from 'lucide-react';
import { useGlobalSearch, useAutocomplete, useSearchState } from '../../hooks/useSearch';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

interface GlobalSearchProps {
  onResultClick?: (result: any, type: string) => void;
  placeholder?: string;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
  placeholder = "Buscar locadores, imóveis, contratos...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { query, debouncedQuery, setQuery } = useSearchState('', 300);

  // Busca global
  const { data: searchData, isLoading: isSearching, error: searchError } = useGlobalSearch(
    debouncedQuery,
    debouncedQuery ? undefined : []
  );

  // Autocomplete
  const { data: autocompleteData } = useAutocomplete(query);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    if (searchTerm.length >= 2) {
      saveSearch(searchTerm);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const renderResultSection = (title: string, icon: React.ReactNode, results: any[], type: string) => {
    if (!results?.length) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-3 py-1 text-sm font-medium text-gray-600">
          {icon}
          {title} ({results.length})
        </div>
        <div className="space-y-1">
          {results.slice(0, 3).map((result, index) => (
            <button
              key={`${type}-${result.id}-${index}`}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
              onClick={() => {
                onResultClick?.(result, type);
                setIsOpen(false);
                setQuery('');
              }}
            >
              <div className="font-medium text-gray-900">{result.nome || result.endereco || result.titulo}</div>
              <div className="text-sm text-gray-600">
                {type === 'locadores' && result.cpf_cnpj}
                {type === 'locatarios' && `${result.cpf_cnpj} • ${result.telefone}`}
                {type === 'imoveis' && `${result.tipo} • R$ ${result.valor_aluguel?.toLocaleString()}`}
                {type === 'contratos' && `${result.imovel?.endereco} • ${result.locatario?.nome}`}
              </div>
            </button>
          ))}
          {results.length > 3 && (
            <div className="px-3 py-1 text-sm text-gray-500">
              +{results.length - 3} mais resultado(s)
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecentSearches = () => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2 px-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Clock className="w-4 h-4" />
          Buscas Recentes
        </div>
        {recentSearches.length > 0 && (
          <button
            onClick={clearRecentSearches}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Limpar
          </button>
        )}
      </div>
      <div className="space-y-1">
        {recentSearches.map((search, index) => (
          <button
            key={index}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-gray-700"
            onClick={() => handleSearch(search)}
          >
            {search}
          </button>
        ))}
        {recentSearches.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">
            Nenhuma busca recente
          </div>
        )}
      </div>
    </div>
  );

  const renderAutocomplete = () => {
    if (!autocompleteData?.data?.length) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-3 text-sm font-medium text-gray-600">
          Sugestões
        </div>
        <div className="space-y-1">
          {autocompleteData.data.slice(0, 5).map((suggestion: string, index: number) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-gray-700"
              onClick={() => handleSearch(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50 shadow-lg">
          <div className="p-2">
            {isSearching && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {searchError && (
              <div className="px-3 py-2 text-sm text-red-600">
                Erro na busca. Tente novamente.
              </div>
            )}

            {!debouncedQuery && !isSearching && renderRecentSearches()}

            {query.length >= 2 && !debouncedQuery && renderAutocomplete()}

            {searchData?.data && debouncedQuery && (
              <>
                {renderResultSection(
                  "Locadores",
                  <Users className="w-4 h-4" />,
                  searchData.data.resultados_por_tipo.locadores?.dados || [],
                  "locadores"
                )}

                {renderResultSection(
                  "Locatários",
                  <UserCheck className="w-4 h-4" />,
                  searchData.data.resultados_por_tipo.locatarios?.dados || [],
                  "locatarios"
                )}

                {renderResultSection(
                  "Imóveis",
                  <Home className="w-4 h-4" />,
                  searchData.data.resultados_por_tipo.imoveis?.dados || [],
                  "imoveis"
                )}

                {renderResultSection(
                  "Contratos",
                  <FileText className="w-4 h-4" />,
                  searchData.data.resultados_por_tipo.contratos?.dados || [],
                  "contratos"
                )}

                {searchData.data.total_resultados === 0 && (
                  <div className="px-3 py-4 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <div>Nenhum resultado encontrado</div>
                    <div className="text-sm">Tente termos diferentes</div>
                  </div>
                )}

                {searchData.data.total_resultados > 0 && (
                  <div className="border-t mt-2 pt-2">
                    <button
                      className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => {
                        // Implementar navegação para página de resultados completos
                        console.log('Ver todos os resultados:', searchData.data);
                        setIsOpen(false);
                      }}
                    >
                      Ver todos os {searchData.data.total_resultados} resultado(s)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;