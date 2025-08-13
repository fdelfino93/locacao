import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FormTemplateProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
}

export const FormTemplate: React.FC<FormTemplateProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className = ""
}) => {
  return (
    <div className={`min-h-screen bg-background py-8 theme-transition ${className}`}>
      <div className="container-app max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-content"
        >
          {/* Form Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-primary/25">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-elevated p-8 lg:p-10 shadow-2xl"
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};