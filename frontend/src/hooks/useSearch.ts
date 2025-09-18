import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo, useEffect } from 'react';
import React from 'react';
import Fuse from 'fuse.js';

// API functions
const searchApi = {
  global: async (query: string, tipos?: string[]) => {
    const params = new URLSearchParams({ q: query });
    if (tipos) params.append('tipos', tipos.join(','));
    
    const response = await fetch(`http://192.168.1.159:8080/api/search/global?${params}`);
    if (!response.ok) throw new Error('Erro na busca');
    return response.json();
  },

  autocomplete: async (query: string, tipo?: string) => {
    const params = new URLSearchParams({ q: query });
    if (tipo) params.append('tipo', tipo);
    
    const response = await fetch(`/api/search/autocomplete?${params}`);
    if (!response.ok) throw new Error('Erro no autocomplete');
    return response.json();
  },

  locadores: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const response = await fetch(`/api/search/locadores?${params}`);
    if (!response.ok) throw new Error('Erro na busca de locadores');
    return response.json();
  },

  locatarios: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const response = await fetch(`/api/search/locatarios?${params}`);
    if (!response.ok) throw new Error('Erro na busca de locatários');
    return response.json();
  },

  imoveis: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const response = await fetch(`/api/search/imoveis?${params}`);
    if (!response.ok) throw new Error('Erro na busca de imóveis');
    return response.json();
  },

  contratos: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const response = await fetch(`/api/search/contratos?${params}`);
    if (!response.ok) throw new Error('Erro na busca de contratos');
    return response.json();
  }
};

// Hook para busca global
export const useGlobalSearch = (query: string, tipos?: string[]) => {
  return useQuery({
    queryKey: ['search', 'global', query, tipos],
    queryFn: () => searchApi.global(query, tipos),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para autocomplete
export const useAutocomplete = (query: string, tipo?: string) => {
  return useQuery({
    queryKey: ['search', 'autocomplete', query, tipo],
    queryFn: () => searchApi.autocomplete(query, tipo),
    enabled: query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para busca específica por entidade
export const useEntitySearch = (entity: string, filters: any) => {
  return useQuery({
    queryKey: ['search', entity, filters],
    queryFn: () => {
      switch (entity) {
        case 'locadores':
          return searchApi.locadores(filters);
        case 'locatarios':
          return searchApi.locatarios(filters);
        case 'imoveis':
          return searchApi.imoveis(filters);
        case 'contratos':
          return searchApi.contratos(filters);
        default:
          throw new Error(`Entidade não suportada: ${entity}`);
      }
    },
    enabled: Object.values(filters).some(value => value),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

// Hook para busca fuzzy local (fallback)
export const useFuzzySearch = <T>(items: T[], searchTerm: string, keys: string[]) => {
  const fuse = useMemo(() => {
    if (!items.length) return null;
    
    return new Fuse(items, {
      keys,
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    });
  }, [items, keys]);

  const results = useMemo(() => {
    if (!fuse || !searchTerm) return items;
    
    return fuse.search(searchTerm).map(result => result.item);
  }, [fuse, items, searchTerm]);

  return results;
};

// Hook para gerenciar estado de busca com debounce
export const useSearchState = (initialQuery = '', debounceMs = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Effect para debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return {
    query,
    debouncedQuery,
    setQuery: updateQuery,
  };
};

// Hook para busca com filtros avançados
export const useAdvancedSearch = () => {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [entity, setEntity] = useState<string>('');

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    entity,
    setEntity,
    updateFilter,
    clearFilters,
    removeFilter,
    hasFilters: Object.keys(filters).length > 0,
  };
};

// Types para TypeScript
export interface SearchResult {
  id: number;
  type: 'locador' | 'locatario' | 'imovel' | 'contrato';
  title: string;
  subtitle: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface GlobalSearchResponse {
  success: boolean;
  data: {
    termo_busca: string;
    total_resultados: number;
    resultados_por_tipo: {
      locadores?: { dados: any[]; total: number };
      locatarios?: { dados: any[]; total: number };
      imoveis?: { dados: any[]; total: number };
      contratos?: { dados: any[]; total: number };
    };
  };
}