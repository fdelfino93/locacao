import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './components/sections/Hero';
import { FormNavigation } from './components/sections/FormNavigation';
import { MiniFormNavigation } from './components/sections/MiniFormNavigation';
import { ModernLocadorFormV2 } from './components/forms/ModernLocadorFormV2';
import { ModernLocatarioFormV2 } from './components/forms/ModernLocatarioFormV2';
import { ModernImovelFormV2 } from './components/forms/ModernImovelFormV2';
import { ModernContratoForm } from './components/forms/ModernContratoForm';
import { PrestacaoContas } from './components/sections/PrestacaoContas';
import Dashboard from './components/dashboard/Dashboard';
import SearchModule from './components/search/SearchModule';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/theme-toggle';

type PageType = 'hero' | 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas' | 'dashboard' | 'busca';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('hero');

  const handleGetStarted = () => {
    setCurrentPage('locador');
  };

  const handleFormChange = (form: 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas' | 'dashboard' | 'busca') => {
    setCurrentPage(form);
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
            <ModernLocadorFormV2 />
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
            <ModernLocatarioFormV2 />
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
            <ModernImovelFormV2 />
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
            <PrestacaoContas />
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
            <Dashboard />
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
            <SearchModule />
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
                onClick={() => setCurrentPage('hero')}
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
                    currentForm={currentPage as 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas'} 
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
