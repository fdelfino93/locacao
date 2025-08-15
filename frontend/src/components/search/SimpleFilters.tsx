import React from 'react';
import { Filter, X } from 'lucide-react';

interface FiltrosAvancados {
  termo_busca?: string;
  entidades?: string[];
  incluir_inativos?: boolean;
  incluir_historico?: boolean;
  ordenacao?: string;
  limite?: number;
  offset?: number;
}

interface SimpleFiltersProps {
  filtros: FiltrosAvancados;
  updateFiltros: (novos: Partial<FiltrosAvancados>) => void;
  limparFiltros: () => void;
}

export const SimpleFilters: React.FC<SimpleFiltersProps> = ({ filtros, updateFiltros, limparFiltros }) => {
  return (
    <div className="bg-muted rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filtros Avançados
        </h3>
        <button
          type="button"
          onClick={limparFiltros}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>
      
      {/* Linha Única: Todos os Filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Buscar em */}
        <div>
          <label className="block text-sm font-medium mb-2">Buscar em:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'locadores', label: 'Locadores' },
              { key: 'locatarios', label: 'Locatários' },
              { key: 'imoveis', label: 'Imóveis' },
              { key: 'contratos', label: 'Contratos' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={!filtros.entidades || filtros.entidades.includes(key)}
                  onChange={(e) => {
                    const current = filtros.entidades || ['locadores', 'locatarios', 'imoveis', 'contratos'];
                    if (e.target.checked) {
                      const newEntidades = current.includes(key) ? current : [...current, key];
                      updateFiltros({ entidades: newEntidades });
                    } else {
                      const newEntidades = current.filter(ent => ent !== key);
                      updateFiltros({ entidades: newEntidades.length > 0 ? newEntidades : undefined });
                    }
                  }}
                  className="rounded border-border"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status e Opções */}
        <div>
          <label className="block text-sm font-medium mb-2">Opções:</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filtros.incluir_inativos === true}
                onChange={(e) => updateFiltros({ incluir_inativos: e.target.checked })}
                className="rounded border-border"
              />
              <span>Incluir Inativos</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={filtros.incluir_historico === true}
                onChange={(e) => updateFiltros({ incluir_historico: e.target.checked })}
                className="rounded border-border"
              />
              <span>Histórico Detalhado</span>
            </label>
          </div>
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-2">Ordenação:</label>
            <select
              value={filtros.ordenacao || 'relevancia'}
              onChange={(e) => updateFiltros({ ordenacao: e.target.value })}
              className="input-section w-full"
            >
              <option value="relevancia">Relevância</option>
              <option value="nome">Nome A-Z</option>
              <option value="data_cadastro">Mais Recentes</option>
              <option value="valor">Maior Valor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Resultados:</label>
            <select
              value={filtros.limite || 20}
              onChange={(e) => updateFiltros({ limite: parseInt(e.target.value) })}
              className="input-section w-full"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};