import { motion } from 'framer-motion';
import { Building2, Users, FileText, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const features = [
    { 
      icon: Building2, 
      title: "Imóveis", 
      desc: "Gestão completa de propriedades",
      gradient: "from-primary to-secondary"
    },
    { 
      icon: Users, 
      title: "Clientes", 
      desc: "Cadastro detalhado e organizado",
      gradient: "from-secondary to-tertiary"
    },
    { 
      icon: FileText, 
      title: "Contratos", 
      desc: "Documentação profissional",
      gradient: "from-tertiary to-primary"
    },
    { 
      icon: TrendingUp, 
      title: "Relatórios", 
      desc: "Análises e métricas avançadas",
      gradient: "from-primary to-tertiary"
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center theme-transition">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
      
      {/* Subtle background accent */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-40 right-20 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-96 h-96 bg-secondary/20 dark:bg-secondary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-tertiary/25 dark:bg-tertiary/15 rounded-full blur-3xl"
          animate={{
            x: [0, 40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
        />
      </div>

      <div className="relative z-10 container-app text-center">
        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-content max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Sistema Completo de Locações</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance"
          >
            <motion.span
              className="inline-block animate-float mr-4"
              style={{ animationDelay: '0s' }}
            >
              🏡
            </motion.span>
            <span className="text-gradient">Cobimob</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8 text-balance"
          >
            Transforme a gestão das suas locações com nossa plataforma moderna e intuitiva.{" "}
            <span className="text-primary font-semibold">Simples, rápido e eficiente.</span>
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              variant="gradient"
              className="group shadow-2xl"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="font-medium"
            >
              Ver Demonstração
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24"
        >
          <div className="grid-cards max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="group"
              >
                <div className="card-interactive h-full p-8 group">
                  <div className="flex flex-col items-center text-center space-y-6 h-full">
                    {/* Icon with enhanced gradient background */}
                    <motion.div 
                      className={`p-5 bg-gradient-to-br ${feature.gradient} rounded-3xl shadow-xl border border-white/20`}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -8, 8, 0]
                      }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <feature.icon className="w-10 h-10 text-primary-foreground drop-shadow-lg" />
                    </motion.div>
                    
                    {/* Enhanced Content */}
                    <div className="flex-1 flex flex-col space-y-3">
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed flex-1 group-hover:text-foreground transition-colors duration-300">
                        {feature.desc}
                      </p>
                    </div>

                    {/* Enhanced hover indicator */}
                    <motion.div
                      className="w-full h-1.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={false}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { label: "Usuários Ativos", value: "1000+" },
            { label: "Propriedades Gerenciadas", value: "5000+" },
            { label: "Contratos Processados", value: "10000+" }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                className="text-3xl font-bold text-primary mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};