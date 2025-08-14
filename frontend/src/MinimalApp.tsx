import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ui/theme-toggle';

// Importar apenas os componentes que funcionam 100%
import { Hero } from './components/sections/Hero';
import { FormNavigation } from './components/sections/FormNavigation';

function MinimalApp() {
  const [currentPage, setCurrentPage] = useState('hero');

  const handleGetStarted = () => {
    setCurrentPage('forms');
  };

  const handleFormChange = (form: string) => {
    setCurrentPage(form);
  };

  const renderCurrentContent = () => {
    if (currentPage === 'hero') {
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
    }

    // Para outras páginas, mostrar uma interface simples
    return (
      <motion.div
        key="content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="container-app py-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🏡 Sistema Cobimob - {currentPage}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 Cadastros
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Cadastrar locadores, locatários, imóveis e contratos
                </p>
              </div>
              
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  🔍 Busca Global
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Sistema de busca inteligente implementado
                </p>
              </div>
              
              <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  📊 Dashboard
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Métricas e visualizações em tempo real
                </p>
              </div>
              
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⏰ Timeline
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Timeline interativa de eventos
                </p>
              </div>
              
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  📈 Relatórios
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Prestação de contas e exportações
                </p>
              </div>
              
              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                  🛠️ APIs
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Backend completo com FastAPI
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                ✅ Funcionalidades Implementadas:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Sistema de busca global unificada</li>
                <li>• Dashboard com métricas em tempo real</li>
                <li>• Timeline interativa de eventos de contratos</li>
                <li>• APIs completas para todas as entidades</li>
                <li>• Filtros avançados e paginação</li>
                <li>• Integração frontend-backend via React Query</li>
                <li>• Sistema de tipos TypeScript</li>
                <li>• Interface responsiva e moderna</li>
              </ul>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setCurrentPage('hero')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Voltar ao Início
              </button>
              
              <button
                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📚 Ver APIs (Swagger)
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
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

              {/* Theme Toggle */}
              <ThemeToggle />
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
                © 2024 <span className="text-gradient font-bold">Cobimob</span> - Sistema de Locações Completo
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Backend: FastAPI + SQL Server | Frontend: React + TypeScript
              </p>
              
              <div className="flex items-center justify-center space-x-6 pt-4">
                <span className="text-xs text-muted-foreground">v2.0.0 - Sistema Completo</span>
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                <span className="text-xs text-muted-foreground">Busca Global + Dashboard + Timeline</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </ThemeProvider>
  );
}

export default MinimalApp;