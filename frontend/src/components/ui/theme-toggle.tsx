import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative h-11 w-11 rounded-xl card border border-border hover:shadow-lg theme-transition-fast flex items-center justify-center group overflow-hidden"
      title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
    >
      {/* Background glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-10 theme-transition"
        whileHover={{ opacity: 0.1 }}
      />
      
      {/* Icons with improved animations */}
      <div className="relative w-5 h-5">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon className="h-5 w-5 text-primary" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun className="h-5 w-5 text-secondary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary/10"
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9, opacity: 0.5 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
};