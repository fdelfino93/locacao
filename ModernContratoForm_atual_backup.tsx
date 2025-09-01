import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { CurrencyInput } from '../ui/currency-input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { 
  FileText, 
  User, 
  Users, 
  Building, 
  Calendar,
  DollarSign,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Percent,
  Heart,
  Banknote,
  Clock,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Upload,
  File,
  Download,
  X
} from 'lucide-react';
import type { Contrato, ContratoLocador, ContratoLocatario } from '../../types';
import { apiService } from '../../services/api';
import { useFormSectionsData } from '../../hooks/useFormData';
import { ContractLandlordsForm } from './ContractLandlordsForm';
import { ContractTenantsForm } from './ContractTenantsForm';
import { ContractPropertyForm } from './ContractPropertyForm';

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Inquilino {
  id: number;
  nome: string;
  cpf_cnpj: string;
}

interface Imovel {
  id: number;
  endereco: string;
}

interface ModernContratoFormProps {
  onBack?: () => void;
  isViewing?: boolean;
  isEditing?: boolean;
}

export const ModernContratoForm: React.FC<ModernContratoFormProps> = ({ 
  onBack, 
  isViewing = false, 
  isEditing = false 
}) => {
  // TESTE: Adicionando mais estados
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  
  const [formData, setFormData] = useState<Contrato>({
    id_imovel: 0,
    id_inquilino: 0,
    data_inicio: '',
    data_fim: '',
    valor_aluguel: 0,
    valor_deposito: 0,
    observacoes: '',
    ativo: true
  });

  // Se for modo visualizar/editar, usar versão simplificada para teste
  if (isViewing || isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-glass rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary px-8 py-6">
              <h1 className="text-2xl font-bold text-primary-foreground">
                {isViewing ? 'Visualizar Contrato' : 'Editar Contrato'}
              </h1>
            </div>
            <div className="p-8">
              <p className="text-foreground mb-4">Versão simplificada funcionando!</p>
              {onBack && (
                <Button onClick={onBack} className="mt-4">
                  Voltar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Para modo cadastro, restaurar o componente original completo
  // TODO: Aqui deveria estar o componente original completo para cadastro
};