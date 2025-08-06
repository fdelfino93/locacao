import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './components/sections/Hero';
import { FormNavigation } from './components/sections/FormNavigation';
import { MiniFormNavigation } from './components/sections/MiniFormNavigation';
import { ModernClienteForm } from './components/forms/ModernClienteForm';
import { ModernClienteFormV2 } from './components/forms/ModernClienteFormV2';
import { ModernInquilinoForm } from './components/forms/ModernInquilinoForm';
import { ModernInquilinoFormV2 } from './components/forms/ModernInquilinoFormV2';
import { ModernImovelForm } from './components/forms/ModernImovelForm';
import { ModernContratoForm } from './components/forms/ModernContratoForm';
import { PrestacaoContas } from './components/sections/PrestacaoContas';

type PageType = 'hero' | 'cliente' | 'inquilino' | 'imovel' | 'contrato' | 'prestacao-contas';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('cliente');

  const handleGetStarted = () => {
    setCurrentPage('cliente');
  };

  const handleFormChange = (form: 'cliente' | 'inquilino' | 'imovel' | 'contrato' | 'prestacao-contas') => {
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
              currentForm="cliente" 
              onFormChange={handleFormChange} 
            />
          </motion.div>
        );
      case 'cliente':
        return (
          <motion.div
            key="cliente"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernClienteFormV2 />
          </motion.div>
        );
      case 'inquilino':
        return (
          <motion.div
            key="inquilino"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ModernInquilinoFormV2 />
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
            <ModernImovelForm />
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-zinc-900 via-gray-900 to-black">
      {/* Navigation Fixed Header */}
      {(
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Logo */}
              <motion.button
                onClick={() => setCurrentPage('hero')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors"
              >
                <div className="text-2xl">🏡</div>
                <span className="text-xl font-bold">Cobimob</span>
              </motion.button>

              {/* Form Navigation */}
              <div className="flex items-center space-x-4">
                <MiniFormNavigation 
                  currentForm={currentPage as 'cliente' | 'inquilino' | 'imovel' | 'contrato' | 'prestacao-contas'} 
                  onFormChange={handleFormChange} 
                />
              </div>
            </div>
          </div>
        </motion.nav>
      )}

      {/* Main Content */}
      <main className="pt-20">
        <AnimatePresence mode="wait">
          {renderCurrentContent()}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {(
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-black/50 border-t border-white/10 mt-12"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-400">
                © 2024 Cobimob - Sistema de Locações Moderno
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Desenvolvido com React, TypeScript e ❤️
              </p>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
}

export default App;
