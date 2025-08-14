import { motion } from 'framer-motion';
import { Building2, User, Users, FileText, Calculator, BarChart3, Search } from 'lucide-react';

type FormType = 'locador' | 'locatario' | 'imovel' | 'contrato' | 'prestacao-contas' | 'dashboard' | 'busca';

interface MiniFormNavigationProps {
  currentForm: FormType;
  onFormChange: (form: FormType) => void;
}

export const MiniFormNavigation: React.FC<MiniFormNavigationProps> = ({
  currentForm,
  onFormChange,
}) => {
  const forms = [
    {
      id: 'dashboard' as FormType,
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'busca' as FormType,
      label: 'Busca',
      icon: Search,
    },
    {
      id: 'locador' as FormType,
      label: 'Locador',
      icon: User,
    },
    {
      id: 'locatario' as FormType,
      label: 'Locatário',
      icon: Users,
    },
    {
      id: 'imovel' as FormType,
      label: 'Imóvel',
      icon: Building2,
    },
    {
      id: 'contrato' as FormType,
      label: 'Contrato',
      icon: FileText,
    },
    {
      id: 'prestacao-contas' as FormType,
      label: 'Prestação',
      icon: Calculator,
    },
  ];

  return (
    <div className="flex items-center space-x-2">
      {forms.map((form) => (
        <motion.button
          key={form.id}
          onClick={() => onFormChange(form.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            nav-item flex items-center space-x-2
            ${currentForm === form.id 
              ? 'nav-item-active' 
              : 'nav-item-inactive'
            }
          `}
        >
          <form.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{form.label}</span>
        </motion.button>
      ))}
    </div>
  );
};