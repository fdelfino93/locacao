import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './components/sections/Hero';
import { FormNavigation } from './components/sections/FormNavigation';
import { MiniFormNavigation } from './components/sections/MiniFormNavigation';
import { ModernLocadorFormV2 } from './components/forms/ModernLocadorFormV2';
import { ModernLocatarioFormV2 } from './components/forms/ModernLocatarioFormV2';
import { ModernImovelFormV2 } from './components/forms/ModernImovelFormV2';
import { ModernContratoForm } from './components/forms/ModernContratoForm';
import { PrestacaoContasModernaDebug } from './components/sections/PrestacaoContasModernaDebug';
import PrestacaoContasLancamento from './components/pages/PrestacaoContasLancamento';
import TesteEdicaoSimples from './components/pages/TesteEdicaoSimples';
import Dashboard from './components/dashboard/Dashboard';
import DashboardEnhanced from './components/dashboard/DashboardEnhanced';
import DashboardPro from './components/dashboard/DashboardPro';
import DashboardSimple from './components/dashboard/DashboardSimple';
import SearchModule from './components/search/SearchModule';
import SearchModernPro from './components/search/SearchModernPro';
// import TestCard from './components/debug/TestCard';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/theme-toggle';
import LocadoresIndex from './components/pages/LocadoresIndex';
import { LocatariosIndex } from './components/pages/LocatariosIndex';
import { ImoveisIndex } from './components/pages/ImoveisIndex';

type PageType = 'hero' | 'locador' | 'locador-cadastro' | 'locador-visualizar' | 'locador-edicao' | 'locatario' | 'locatario-cadastro' | 'locatario-visualizar' | 'locatario-edicao' | 'imovel' | 'imovel-cadastro' | 'imovel-visualizar' | 'imovel-edicao' | 'contrato' | 'prestacao-contas' | 'prestacao-contas-lancamento' | 'edicao-fatura' | 'dashboard' | 'busca';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('hero');

  // Função para determinar a página baseada na URL
  const getPageFromURL = (): PageType => {
    const path = window.location.pathname;
    console.log('🌐 URL atual:', path);
    
    if (path === '/prestacao-contas/lancamento') {
      return 'prestacao-contas-lancamento';
    }
    
    if (path.startsWith('/prestacao-contas/editar/')) {
      return 'edicao-fatura';
    }
    
    if (path.startsWith('/locador/visualizar/')) {
      return 'locador-visualizar';
    }
    
    if (path.startsWith('/locador/editar/')) {
      return 'locador-edicao';
    }
    
    if (path.startsWith('/locatario/visualizar/')) {
      return 'locatario-visualizar';
    }
    
    if (path.startsWith('/locatario/editar/')) {
      return 'locatario-edicao';
    }
    
    if (path.startsWith('/imovel-visualizar/')) {
      return 'imovel-visualizar';
    }
    
    if (path.startsWith('/imovel-edicao/')) {
      return 'imovel-edicao';
    }
    
    // Mapeamento de outras rotas se necessário
    const routeMap: {[key: string]: PageType} = {
      '/': 'hero',
      '/hero': 'hero',
      '/locador': 'locador',
      '/locador/cadastro': 'locador-cadastro',
      '/locatario': 'locatario',
      '/locatario/cadastro': 'locatario-cadastro',
      '/imovel': 'imovel',
      '/imoveis': 'imovel',
      '/imovel/cadastro': 'imovel-cadastro',
      '/contrato': 'contrato',
      '/prestacao-contas': 'prestacao-contas',
      '/dashboard': 'dashboard',
      '/busca': 'busca'
    };
    
    return routeMap[path] || 'hero';
  };

  // Verificar URL na montagem e mudanças de URL
  useEffect(() => {
    const initialPage = getPageFromURL();
    console.log('📄 Página inicial determinada:', initialPage);
    setCurrentPage(initialPage);

    // Listener para mudanças na URL (botão voltar/avançar do navegador)
    const handlePopState = () => {
      const newPage = getPageFromURL();
      console.log('🔄 Mudança de URL detectada:', newPage);
      setCurrentPage(newPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Atualizar URL quando a página muda via navegação interna
  const handlePageChange = (page: PageType, updateURL = true) => {
    setCurrentPage(page);
    
    if (updateURL) {
      const urlMap: {[key in PageType]: string} = {
        'hero': '/',
        'locador': '/locador',
        'locador-cadastro': '/locador/cadastro',
        'locador-visualizar': '/locador/visualizar',
        'locador-edicao': '/locador/editar',
        'locatario': '/locatario',
        'locatario-cadastro': '/locatario/cadastro',
        'locatario-visualizar': '/locatario/visualizar',
        'locatario-edicao': '/locatario/editar',
        'imovel': '/imovel',
        'imovel-cadastro': '/imovel/cadastro',
        'imovel-visualizar': '/imovel/visualizar',
        'imovel-edicao': '/imovel/editar',
        'contrato': '/contrato',
        'prestacao-contas': '/prestacao-contas',
        'prestacao-contas-lancamento': '/prestacao-contas/lancamento',
        'edicao-fatura': '/prestacao-contas/editar',
        'dashboard': '/dashboard',
        'busca': '/busca'
      };
      
      const newURL = urlMap[page];
      if (newURL && window.location.pathname !== newURL) {
        window.history.pushState({}, '', newURL);
        console.log('🌐 URL atualizada para:', newURL);
      }
    }
  };

  const handleGetStarted = () => {
    handlePageChange('locador');
  };

  const handleFormChange = (form: 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas' | 'dashboard' | 'busca') => {
    handlePageChange(form as PageType);
  };

  const handleEditarFatura = (faturaId: number) => {
    const url = `/prestacao-contas/editar/${faturaId}`;
    window.history.pushState({}, '', url);
    setCurrentPage('edicao-fatura');
  };

  const handleNavigateToLocadorCadastro = () => {
    handlePageChange('locador-cadastro');
  };

  const handleNavigateToLocadorDetalhes = (locadorId: number) => {
    const url = `/locador/visualizar/${locadorId}`;
    window.history.pushState({}, '', url);
    setCurrentPage('locador-visualizar');
  };

  const handleNavigateToLocadorEdicao = (locadorId: number) => {
    const url = `/locador/editar/${locadorId}`;
    window.history.pushState({}, '', url);
    setCurrentPage('locador-edicao');
  };

  // Handlers para Imóveis
  const handleNavigateToImovelCadastro = () => {
    handlePageChange('imovel-cadastro');
  };

  const handleNavigateToImovelDetalhes = (imovelId: number) => {
    const url = `/imovel/visualizar/${imovelId}`;
    window.history.pushState({}, '', url);
    setCurrentPage('imovel-visualizar');
  };

  const handleNavigateToImovelEdicao = (imovelId: number) => {
    const url = `/imovel/editar/${imovelId}`;
    window.history.pushState({}, '', url);
    setCurrentPage('imovel-edicao');
  };

  const renderCurrentContent = () => {
    switch (currentPage) {
      case 'hero':
        return (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Hero onGetStarted={handleGetStarted} />
            <FormNavigation 
              currentForm="locador" 
              onFormChange={handleFormChange} 
            />
          </motion.div>
        );
      case 'locador':
        return (
          <motion.div
            key="locador"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <LocadoresIndex
              onNavigateToCadastro={handleNavigateToLocadorCadastro}
              onNavigateToDetalhes={handleNavigateToLocadorDetalhes}
              onNavigateToEdicao={handleNavigateToLocadorEdicao}
            />
          </motion.div>
        );
      case 'locador-cadastro':
        return (
          <motion.div
            key="locador-cadastro"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLocadorFormV2 onBack={() => handlePageChange('locador')} />
          </motion.div>
        );
      case 'locador-visualizar':
        return (
          <motion.div
            key="locador-visualizar"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLocadorFormV2 onBack={() => handlePageChange('locador')} isViewing={true} />
          </motion.div>
        );
      case 'locador-edicao':
        return (
          <motion.div
            key="locador-edicao"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLocadorFormV2 onBack={() => handlePageChange('locador')} isEditing={true} />
          </motion.div>
        );
      case 'locatario':
        return (
          <motion.div
            key="locatario"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <LocatariosIndex 
              onNavigateToCadastro={() => handlePageChange('locatario-cadastro')}
              onNavigateToDetalhes={(locatarioId) => {
                window.history.pushState(null, '', `/locatario/visualizar/${locatarioId}`);
                handlePageChange('locatario-visualizar');
              }}
              onNavigateToEdicao={(locatarioId) => {
                window.history.pushState(null, '', `/locatario/editar/${locatarioId}`);
                handlePageChange('locatario-edicao');
              }}
            />
          </motion.div>
        );
      case 'locatario-cadastro':
        return (
          <motion.div
            key="locatario-cadastro"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLocatarioFormV2 onBack={() => handlePageChange('locatario')} />
          </motion.div>
        );
      case 'locatario-visualizar':
        return (
          <motion.div
            key="locatario-visualizar"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLocatarioFormV2 onBack={() => handlePageChange('locatario')} isViewing={true} />
          </motion.div>
        );
      case 'locatario-edicao':
        return (
          <motion.div
            key="locatario-edicao"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernLocatarioFormV2 onBack={() => handlePageChange('locatario')} isEditing={true} />
          </motion.div>
        );
      case 'imovel':
        return (
          <motion.div
            key="imovel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ImoveisIndex
              onNavigateToCadastro={handleNavigateToImovelCadastro}
              onNavigateToDetalhes={handleNavigateToImovelDetalhes}
              onNavigateToEdicao={handleNavigateToImovelEdicao}
            />
          </motion.div>
        );
      case 'imovel-cadastro':
        return (
          <motion.div
            key="imovel-cadastro"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernImovelFormV2 onBack={() => handlePageChange('imovel')} />
          </motion.div>
        );
      case 'imovel-visualizar':
        return (
          <motion.div
            key="imovel-visualizar"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernImovelFormV2 onBack={() => handlePageChange('imovel')} isViewing={true} />
          </motion.div>
        );
      case 'imovel-edicao':
        return (
          <motion.div
            key="imovel-edicao"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernImovelFormV2 onBack={() => handlePageChange('imovel')} isEditing={true} />
          </motion.div>
        );
      case 'contrato':
        return (
          <motion.div
            key="contrato"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernContratoForm />
          </motion.div>
        );
      case 'prestacao-contas':
        return (
          <motion.div
            key="prestacao-contas"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PrestacaoContasModernaDebug />
          </motion.div>
        );
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardPro />
          </motion.div>
        );
      case 'busca':
        return (
          <motion.div
            key="busca"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <SearchModernPro />
          </motion.div>
        );
      case 'prestacao-contas-lancamento':
        return (
          <motion.div
            key="prestacao-contas-lancamento"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PrestacaoContasLancamento />
          </motion.div>
        );
      case 'edicao-fatura':
        return (
          <motion.div
            key="edicao-fatura"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <TesteEdicaoSimples />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground theme-transition">
        {/* Navigation Fixed Header */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 nav-glass backdrop-blur-2xl"
        >
          <div className="container-app">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <motion.button
                onClick={() => handlePageChange('hero')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors duration-300 group"
              >
                <motion.div 
                  className="text-2xl group-hover:animate-float"
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.6 }}
                >
                  🏡
                </motion.div>
                <span className="text-xl font-bold text-gradient">
                  Cobimob
                </span>
              </motion.button>

              {/* Form Navigation and Theme Toggle */}
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex">
                  <MiniFormNavigation 
                    currentForm={currentPage as 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas' | 'dashboard' | 'busca'} 
                    onFormChange={handleFormChange} 
                  />
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </motion.nav>

      {/* Main Content */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          {renderCurrentContent()}
        </AnimatePresence>
      </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="border-t border-border mt-16 theme-transition"
        >
          <div className="container-app py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground font-medium text-lg">
                © 2024 <span className="text-gradient font-bold">Cobimob</span> - Sistema de Locações Moderno
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Desenvolvido com React, TypeScript e{' '}
                <motion.span 
                  className="text-red-500 inline-block"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ❤️
                </motion.span>
              </p>
              
              {/* Social links or additional info */}
              <div className="flex items-center justify-center space-x-6 pt-4">
                <span className="text-xs text-muted-foreground">v2.0.0</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                <span className="text-xs text-muted-foreground">Última atualização: 2024</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
