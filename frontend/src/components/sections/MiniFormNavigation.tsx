import { motion } from 'framer-motion';
import { Building2, User, Users, FileText } from 'lucide-react';

type FormType = 'cliente' | 'inquilino' | 'imovel' | 'contrato';

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
      id: 'cliente' as FormType,
      label: 'Cliente',
      icon: User,
    },
    {
      id: 'inquilino' as FormType,
      label: 'Inquilino',
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
  ];

  return (
    <div className="flex items-center space-x-2">
      {forms.map((form) => (
        <motion.button
          key={form.id}
          onClick={() => onFormChange(form.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
            ${currentForm === form.id 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
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