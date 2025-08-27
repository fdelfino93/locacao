import { motion } from 'framer-motion';
import { Building2, User, Users, Calculator, FileText, BarChart3, Search } from 'lucide-react';
import { Button } from '../ui/button';

type FormType = 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas' | 'dashboard' | 'busca';

interface FormNavigationProps {
  currentForm: FormType;
  onFormChange: (form: FormType) => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentForm,
  onFormChange,
}) => {
  const forms = [
    {
      id: 'locador' as FormType,
      label: 'Locador',
      icon: User,
      description: 'Proprietários e responsáveis',
      color: 'from-primary to-secondary',
    },
    {
      id: 'locatario' as FormType,
      label: 'Locatário',
      icon: Users,
      description: 'Locatários e famílias',
      color: 'from-secondary to-tertiary',
    },
    {
      id: 'imovel' as FormType,
      label: 'Imóvel',
      icon: Building2,
      description: 'Propriedades e locais',
      color: 'from-tertiary to-primary',
    },
    {
      id: 'contrato' as FormType,
      label: 'Contrato',
      icon: FileText,
      description: 'Contratos de locação',
      color: 'from-primary to-tertiary',
    },
    {
      id: 'prestacao-contas' as FormType,
      label: 'Prestação de Contas',
      icon: Calculator,
      description: 'Relatórios e prestações',
      color: 'from-secondary to-primary',
    },
    {
      id: 'dashboard' as FormType,
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Métricas e visualizações',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'busca' as FormType,
      label: 'Busca Global',
      icon: Search,
      description: 'Buscar em todo sistema',
      color: 'from-green-500 to-blue-500',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Escolha o Cadastro
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Selecione o tipo de cadastro que deseja realizar
          </p>
        </motion.div>

        {/* Form Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {forms.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => onFormChange(form.id)}
            >
              <div className="relative p-8 rounded-3xl border-2 border-border bg-gradient-to-br from-muted/50 to-background/50 hover:border-accent hover:scale-105 hover:shadow-xl transition-all duration-300">

                {/* Icon */}
                <div className={`
                  inline-flex p-4 rounded-2xl bg-gradient-to-r ${form.color} mb-6 transform group-hover:scale-110 transition-transform duration-300
                `}>
                  <form.icon className="w-8 h-8 text-foreground" />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {form.label}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {form.description}
                  </p>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-6 btn-outline"
                  >
                    Selecionar
                  </Button>
                </div>

                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 rounded-3xl transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: "500+", label: "Imóveis Cadastrados" },
            { number: "1.2k+", label: "Clientes Ativos" },
            { number: "99%", label: "Satisfação" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-background/30 border border-border"
            >
              <div className="text-4xl font-bold text-foreground mb-2">{stat.number}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};