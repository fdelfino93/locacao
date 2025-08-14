import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card } from '../ui/card';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../ui/theme-toggle';

// Componentes existentes que funcionam
import { ModernLocadorFormV2 } from '../forms/ModernLocadorFormV2';
import { ModernLocatarioFormV2 } from '../forms/ModernLocatarioFormV2';
import { ModernImovelFormV2 } from '../forms/ModernImovelFormV2';
import { ModernContratoForm } from '../forms/ModernContratoForm';
import { PrestacaoContas } from '../sections/PrestacaoContas';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

type View = 'forms' | 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas';

function SimpleApp() {
  const [currentView, setCurrentView] = useState<View>('forms');

  const renderContent = () => {
    switch (currentView) {
      case 'locador':
        return <ModernLocadorFormV2 />;
      case 'locatario':
        return <ModernLocatarioFormV2 />;
      case 'imovel':
        return <ModernImovelFormV2 />;
      case 'contrato':
        return <ModernContratoForm />;
      case 'prestacao-contas':
        return <PrestacaoContas />;
      default:
        return (
          <div className="p-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🏡 Sistema Cobimob</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentView('locador')}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-semibold text-blue-900">Cadastrar Locador</h3>
                  <p className="text-sm text-blue-700">Novo locador</p>
                </button>
                
                <button
                  onClick={() => setCurrentView('locatario')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <h3 className="font-semibold text-green-900">Cadastrar Locatário</h3>
                  <p className="text-sm text-green-700">Novo locatário</p>
                </button>
                
                <button
                  onClick={() => setCurrentView('imovel')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <h3 className="font-semibold text-purple-900">Cadastrar Imóvel</h3>
                  <p className="text-sm text-purple-700">Novo imóvel</p>
                </button>
                
                <button
                  onClick={() => setCurrentView('contrato')}
                  className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <h3 className="font-semibold text-yellow-900">Cadastrar Contrato</h3>
                  <p className="text-sm text-yellow-700">Novo contrato</p>
                </button>
                
                <button
                  onClick={() => setCurrentView('prestacao-contas')}
                  className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <h3 className="font-semibold text-red-900">Prestação de Contas</h3>
                  <p className="text-sm text-red-700">Relatórios</p>
                </button>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('forms')}
                className="flex items-center gap-2 font-bold text-xl text-gray-900 hover:text-blue-600"
              >
                🏡 Cobimob
              </button>
            </div>
            <ThemeToggle />
          </div>
          
          {/* Conteúdo */}
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default SimpleApp;