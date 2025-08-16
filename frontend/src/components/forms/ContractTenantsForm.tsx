import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { InputWithIcon } from '../ui/input-with-icon';
import { 
  Plus, 
  Trash2, 
  User, 
  Users,
  AlertCircle,
  CheckCircle,
  Star,
  Heart,
  Phone,
  Mail,
  IdCard
} from 'lucide-react';
import { apiService } from '../../services/api';

interface Locatario {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone?: string;
  email?: string;
}

interface ContratoLocatario {
  id?: number;
  locatario_id: number;
  locatario_nome?: string;
  locatario_cpf?: string;
  locatario_telefone?: string;
  locatario_email?: string;
  responsabilidade_principal?: boolean;
}

interface ContractTenantsFormProps {
  locatarios: ContratoLocatario[];
  onChange: (locatarios: ContratoLocatario[]) => void;
}

export const ContractTenantsForm: React.FC<ContractTenantsFormProps> = ({
  locatarios,
  onChange
}) => {
  const [locatariosOptions, setLocatariosOptions] = useState<Locatario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarLocatariosAtivos();
  }, []);

  const carregarLocatariosAtivos = async () => {
    try {
      setLoading(true);
      const response = await apiService.listarLocatarios();
      if (response.success && response.data) {
        setLocatariosOptions(response.data);
      } else {
        console.error('Erro na resposta do apiService:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar locatários:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarLocatario = () => {
    const novoLocatario: ContratoLocatario = {
      locatario_id: 0,
      responsabilidade_principal: locatarios.length === 0 // Primeiro locatário é sempre principal
    };
    onChange([...locatarios, novoLocatario]);
  };

  const removerLocatario = (index: number) => {
    const novosLocatarios = locatarios.filter((_, i) => i !== index);
    
    // Se removeu o principal e ainda há locatários, torna o primeiro como principal
    if (novosLocatarios.length > 0) {
      const temPrincipal = novosLocatarios.some(l => l.responsabilidade_principal);
      if (!temPrincipal) {
        novosLocatarios[0].responsabilidade_principal = true;
      }
    }
    
    onChange(novosLocatarios);
  };

  const atualizarLocatario = (index: number, campo: keyof ContratoLocatario, valor: any) => {
    const novosLocatarios = [...locatarios];
    
    if (campo === 'locatario_id') {
      const locatarioSelecionado = locatariosOptions.find(l => l.id === parseInt(valor));
      if (locatarioSelecionado) {
        novosLocatarios[index] = {
          ...novosLocatarios[index],
          locatario_id: locatarioSelecionado.id,
          locatario_nome: locatarioSelecionado.nome,
          locatario_cpf: locatarioSelecionado.cpf_cnpj,
          locatario_telefone: locatarioSelecionado.telefone,
          locatario_email: locatarioSelecionado.email,
        };
      }
    } else if (campo === 'responsabilidade_principal' && valor) {
      // Se está marcando como principal, desmarca todos os outros
      novosLocatarios.forEach((l, i) => {
        l.responsabilidade_principal = i === index;
      });
    } else {
      novosLocatarios[index] = {
        ...novosLocatarios[index],
        [campo]: valor
      };
    }

    onChange(novosLocatarios);
  };

  const getStatusValidacao = () => {
    if (locatarios.length === 0) {
      return { 
        tipo: 'error', 
        mensagem: 'É obrigatório ter pelo menos um locatário',
        icone: AlertCircle,
        cor: 'text-red-600'
      };
    }

    // Verificar se todos os locatários estão selecionados
    const temLocatariosVazios = locatarios.some(l => l.locatario_id === 0);
    if (temLocatariosVazios) {
      return {
        tipo: 'warning',
        mensagem: 'Selecione todos os locatários',
        icone: AlertCircle,
        cor: 'text-yellow-600'
      };
    }

    // Verificar se tem responsável principal
    const temPrincipal = locatarios.some(l => l.responsabilidade_principal);
    if (!temPrincipal) {
      return {
        tipo: 'warning',
        mensagem: 'Defina um locatário como responsável principal',
        icone: AlertCircle,
        cor: 'text-yellow-600'
      };
    }

    return {
      tipo: 'success',
      mensagem: 'Configuração de locatários válida!',
      icone: CheckCircle,
      cor: 'text-green-600'
    };
  };

  const status = getStatusValidacao();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Inquilinos (Locatários)
          </h2>
          <Button 
            onClick={adicionarLocatario}
            size="sm"
            className="btn-outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Locatário
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Adicione os locatários que farão parte do contrato. O primeiro locatário será automaticamente definido como responsável principal, mas você pode alterar essa configuração.
        </p>

        {/* Indicador de Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card-glass rounded-xl p-4 border ${
            status.tipo === 'success' 
              ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
              : status.tipo === 'warning'
              ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
              : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <status.icone className={`w-5 h-5 ${status.cor}`} />
              <span className={`font-medium ${status.cor}`}>
                {status.mensagem}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-lg font-bold text-blue-600">
                {locatarios.length}
              </span>
              <span className="text-sm text-muted-foreground">
                locatário{locatarios.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lista de Locatários */}
      <div className="space-y-6">
        {locatarios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20"
          >
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum locatário adicionado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Clique no botão "Adicionar Locatário" para começar
            </p>
            <Button onClick={adicionarLocatario} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Locatário
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {locatarios.map((locatario, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-green-500 to-emerald-500"
                      whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <User className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Locatário {index + 1}
                        {locatario.responsabilidade_principal && (
                          <Star className="w-4 h-4 text-yellow-500 inline ml-2" title="Responsável Principal" />
                        )}
                      </h3>
                      {locatario.locatario_nome && (
                        <p className="text-sm text-muted-foreground">
                          {locatario.locatario_nome} - {locatario.locatario_cpf}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => removerLocatario(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Seleção do Locatário */}
                  <div>
                    <Label>Locatário *</Label>
                    <Select
                      value={locatario.locatario_id > 0 ? locatario.locatario_id.toString() : undefined}
                      onValueChange={(valor) => atualizarLocatario(index, 'locatario_id', parseInt(valor))}
                    >
                      <SelectTrigger className="bg-muted/50 border-border text-foreground">
                        <SelectValue placeholder="Selecione um locatário..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {locatariosOptions
                          .filter(l => !locatarios.some((loc, i) => i !== index && loc.locatario_id === l.id))
                          .map(l => (
                            <SelectItem key={l.id} value={l.id.toString()} className="text-foreground hover:bg-accent">
                              {l.nome} - {l.cpf_cnpj}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Responsabilidade Principal */}
                  <div>
                    <Label>Responsabilidade</Label>
                    <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                      <input
                        type="checkbox"
                        id={`principal_${index}`}
                        checked={locatario.responsabilidade_principal || false}
                        onChange={(e) => atualizarLocatario(index, 'responsabilidade_principal', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`principal_${index}`} className="text-sm font-normal">
                        Responsável Principal
                      </Label>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted/30">
                      <span className="text-sm text-muted-foreground">
                        {locatario.responsabilidade_principal ? 'Principal' : 'Adicional'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informações do Locatário Selecionado */}
                {locatario.locatario_id > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <IdCard className="w-4 h-4 text-green-600" />
                      Informações do Locatário
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <IdCard className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="text-muted-foreground block">CPF/CNPJ:</span>
                          <span className="font-semibold text-foreground">{locatario.locatario_cpf || 'Não informado'}</span>
                        </div>
                      </div>
                      {locatario.locatario_telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-600" />
                          <div>
                            <span className="text-muted-foreground block">Telefone:</span>
                            <span className="font-semibold text-foreground">{locatario.locatario_telefone}</span>
                          </div>
                        </div>
                      )}
                      {locatario.locatario_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          <div>
                            <span className="text-muted-foreground block">Email:</span>
                            <span className="font-semibold text-foreground">{locatario.locatario_email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};