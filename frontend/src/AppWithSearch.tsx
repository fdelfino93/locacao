import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { 
  Home, 
  Search, 
  Users, 
  Building, 
  FileText, 
  BarChart3, 
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import GlobalSearch from './components/search/GlobalSearch';
import Dashboard from './components/dashboard/Dashboard';
import LocadoresListing from './components/listings/LocadoresListing';
import ContractTimeline from './components/timeline/ContractTimeline';
import { Card } from './components/ui/card';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/theme-toggle';

// Importar componentes existentes
import { ModernLocadorFormV2 } from './components/forms/ModernLocadorFormV2';
import { ModernLocatarioFormV2 } from './components/forms/ModernLocatarioFormV2';
import { ModernImovelFormV2 } from './components/forms/ModernImovelFormV2';
import { ModernContratoForm } from './components/forms/ModernContratoForm';
import { PrestacaoContas } from './components/sections/PrestacaoContas';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

type View = 
  | 'dashboard' 
  | 'search' 
  | 'locadores' 
  | 'locatarios' 
  | 'imoveis' 
  | 'contratos' 
  | 'timeline'
  | 'form-locador'
  | 'form-locatario' 
  | 'form-imovel' 
  | 'form-contrato' 
  | 'prestacao-contas';

interface NavigationItem {
  id: View;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: 'main' | 'forms' | 'reports';
}

const navigationItems: NavigationItem[] = [
  // Seção principal
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Visão geral e métricas',
    category: 'main'
  },
  {
    id: 'search',
    label: 'Busca Global',
    icon: <Search className="w-5 h-5" />,
    description: 'Buscar em todo o sistema',
    category: 'main'
  },
  {
    id: 'locadores',
    label: 'Locadores',
    icon: <Users className="w-5 h-5" />,
    description: 'Listar e gerenciar',
    category: 'main'
  },
  {
    id: 'locatarios',
    label: 'Locatários',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Listar e gerenciar',
    category: 'main'
  },
  {
    id: 'imoveis',
    label: 'Imóveis',
    icon: <Building className="w-5 h-5" />,
    description: 'Listar e gerenciar',
    category: 'main'
  },
  {
    id: 'contratos',
    label: 'Contratos',
    icon: <FileText className="w-5 h-5" />,
    description: 'Listar e gerenciar',
    category: 'main'
  },
  
  // Formulários de cadastro
  {
    id: 'form-locador',
    label: 'Cadastrar Locador',
    icon: <Users className="w-5 h-5" />,
    description: 'Novo cadastro',
    category: 'forms'
  },
  {
    id: 'form-locatario',
    label: 'Cadastrar Locatário',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Novo cadastro',
    category: 'forms'
  },
  {
    id: 'form-imovel',
    label: 'Cadastrar Imóvel',
    icon: <Building className="w-5 h-5" />,
    description: 'Novo cadastro',
    category: 'forms'
  },
  {
    id: 'form-contrato',
    label: 'Cadastrar Contrato',
    icon: <FileText className="w-5 h-5" />,
    description: 'Novo cadastro',
    category: 'forms'
  },

  // Relatórios
  {
    id: 'prestacao-contas',
    label: 'Prestação de Contas',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Relatórios financeiros',
    category: 'reports'
  },
  {
    id: 'timeline',
    label: 'Timeline Demo',
    icon: <Home className="w-5 h-5" />,
    description: 'Demo timeline de eventos',
    category: 'reports'
  }
];

const Sidebar: React.FC<{
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ currentView, onViewChange, isOpen, onToggle }) => {
  const renderNavSection = (category: string, title: string) => {
    const items = navigationItems.filter(item => item.category === category);
    
    return (
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (window.innerWidth < 1024) onToggle();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm
                ${currentView === item.id 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              {item.icon}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className="text-xs text-gray-500 truncate">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <h1 className="text-xl font-bold text-gray-900">Cobimob</h1>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          {renderNavSection('main', 'Sistema')}
          {renderNavSection('forms', 'Cadastros')}
          {renderNavSection('reports', 'Relatórios')}
        </nav>
      </div>
    </>
  );
};

const MainContent: React.FC<{
  view: View;
}> = ({ view }) => {
  const handleSearchResult = (result: any, type: string) => {
    console.log('Search result clicked:', { result, type });
  };

  const handleLocadorClick = (locador: any) => {
    console.log('Locador clicked:', locador);
  };

  const handleLocadorEdit = (locador: any) => {
    console.log('Edit locador:', locador);
  };

  switch (view) {
    case 'dashboard':
      return <Dashboard />;
      
    case 'search':
      return (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Busca Global</h2>
              <p className="text-gray-600">
                Encontre rapidamente locadores, locatários, imóveis e contratos
              </p>
            </div>
            
            <GlobalSearch 
              onResultClick={handleSearchResult}
              placeholder="Digite para buscar em todo o sistema..."
              className="w-full"
            />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">Locadores</h3>
                </div>
                <p className="text-sm text-gray-600">Busque por nome, CPF/CNPJ</p>
              </Card>
              
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">Locatários</h3>
                </div>
                <p className="text-sm text-gray-600">Busque por nome, documento</p>
              </Card>
              
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Building className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">Imóveis</h3>
                </div>
                <p className="text-sm text-gray-600">Busque por endereço, tipo</p>
              </Card>
              
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium">Contratos</h3>
                </div>
                <p className="text-sm text-gray-600">Busque por locatário, imóvel</p>
              </Card>
            </div>
          </div>
        </div>
      );
      
    case 'locadores':
      return (
        <div className="p-6">
          <LocadoresListing 
            onLocadorClick={handleLocadorClick}
            onLocadorEdit={handleLocadorEdit}
          />
        </div>
      );
      
    case 'locatarios':
      return (
        <div className="p-6">
          <Card className="p-8 text-center">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página de Locatários
            </h3>
            <p className="text-gray-600">
              Lista de locatários com busca avançada - Em desenvolvimento
            </p>
          </Card>
        </div>
      );
      
    case 'imoveis':
      return (
        <div className="p-6">
          <Card className="p-8 text-center">
            <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página de Imóveis
            </h3>
            <p className="text-gray-600">
              Lista de imóveis com filtros avançados - Em desenvolvimento
            </p>
          </Card>
        </div>
      );
      
    case 'contratos':
      return (
        <div className="p-6">
          <Card className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página de Contratos
            </h3>
            <p className="text-gray-600">
              Lista de contratos com timeline - Em desenvolvimento
            </p>
          </Card>
        </div>
      );
      
    case 'timeline':
      return (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demo - Timeline de Contratos</h2>
            <p className="text-gray-600">
              Demonstração da timeline interativa de eventos de contrato
            </p>
          </div>
          
          <ContractTimeline 
            contratoId={1}
            onEventClick={(event) => console.log('Event clicked:', event)}
            onEventEdit={(event) => console.log('Edit event:', event)}
            onEventDelete={(eventId) => console.log('Delete event:', eventId)}
          />
        </div>
      );

    // Formulários existentes
    case 'form-locador':
      return (
        <div className="p-6">
          <ModernLocadorFormV2 />
        </div>
      );
      
    case 'form-locatario':
      return (
        <div className="p-6">
          <ModernLocatarioFormV2 />
        </div>
      );
      
    case 'form-imovel':
      return (
        <div className="p-6">
          <ModernImovelFormV2 />
        </div>
      );
      
    case 'form-contrato':
      return (
        <div className="p-6">
          <ModernContratoForm />
        </div>
      );
      
    case 'prestacao-contas':
      return (
        <div className="p-6">
          <PrestacaoContas />
        </div>
      );
      
    default:
      return (
        <div className="p-6">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Página não encontrada
            </h3>
            <p className="text-gray-600">
              A página solicitada não foi encontrada.
            </p>
          </Card>
        </div>
      );
  }
};

function AppWithSearch() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar 
            currentView={currentView}
            onViewChange={setCurrentView}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                <h1 className="font-semibold text-gray-900">
                  {navigationItems.find(item => item.id === currentView)?.label || 'Cobimob'}
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
            
            {/* Conteúdo principal */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <MainContent view={currentView} />
            </main>
          </div>
        </div>
        
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default AppWithSearch;