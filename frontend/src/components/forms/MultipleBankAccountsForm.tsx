import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  Star,
  Edit3,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { DadosBancariosForm } from './DadosBancariosForm';
import type { DadosBancarios } from '../../types';

interface MultipleBankAccountsFormProps {
  contas: DadosBancarios[];
  onChange: (contas: DadosBancarios[]) => void;
}

export const MultipleBankAccountsForm: React.FC<MultipleBankAccountsFormProps> = ({
  contas,
  onChange
}) => {
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [novaConta, setNovaConta] = useState<DadosBancarios | null>(null);

  const adicionarConta = () => {
    setNovaConta({
      tipo_recebimento: 'PIX',
      chave_pix: '',
      banco: '',
      agencia: '',
      conta: '',
      tipo_conta: 'Conta Corrente',
      titular: '',
      cpf_titular: ''
    });
  };

  const salvarNovaConta = () => {
    if (!novaConta) return;

    // Verificar se é a primeira conta e marcar como principal
    const ehPrimeira = contas.length === 0;
    const novaContaComPrincipal = { ...novaConta, principal: ehPrimeira };

    onChange([...contas, novaContaComPrincipal]);
    setNovaConta(null);
  };

  const cancelarNovaConta = () => {
    setNovaConta(null);
  };

  const removerConta = (index: number) => {
    const novasContas = contas.filter((_, i) => i !== index);
    
    // Se a conta removida era principal e ainda há contas, tornar a primeira como principal
    const contaRemovida = contas[index];
    if (contaRemovida.principal && novasContas.length > 0) {
      novasContas[0] = { ...novasContas[0], principal: true };
    }
    
    onChange(novasContas);
  };

  const tornarPrincipal = (index: number) => {
    const novasContas = contas.map((conta, i) => ({
      ...conta,
      principal: i === index
    }));
    onChange(novasContas);
  };

  const atualizarConta = (index: number, dadosAtualizados: DadosBancarios) => {
    const novasContas = [...contas];
    novasContas[index] = dadosAtualizados;
    onChange(novasContas);
  };

  const getTipoDescricao = (conta: DadosBancarios) => {
    if (conta.tipo_recebimento === 'PIX') {
      return `PIX: ${conta.chave_pix || 'Não informado'}`;
    } else {
      const bancoNome = conta.banco === '001' ? 'Banco do Brasil' :
                       conta.banco === '237' ? 'Bradesco' :
                       conta.banco === '104' ? 'Caixa' :
                       conta.banco === '341' ? 'Itaú' :
                       conta.banco === '033' ? 'Santander' :
                       conta.banco || 'Banco não informado';
      return `${bancoNome} - Ag: ${conta.agencia || ''} Conta: ${conta.conta || ''}`;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-green-600" />
          Contas Bancárias
        </h2>
        <p className="text-sm text-muted-foreground">
          Cadastre múltiplas contas bancárias para recebimento de aluguéis. A conta principal será usada por padrão.
        </p>
        
        <div className="flex justify-end">
          <Button 
            onClick={adicionarConta} 
            disabled={!!novaConta} 
            size="sm"
            className="btn-outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conta
          </Button>
        </div>
      </div>

      {/* Nova conta sendo adicionada */}
      <AnimatePresence>
        {novaConta && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="card-glass rounded-xl border border-border/50 p-6 shadow-lg"
          >
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nova Conta Bancária
            </h4>
            
            <DadosBancariosForm
              dadosBancarios={novaConta}
              onChange={setNovaConta}
              prefixo="nova"
            />

            <div className="flex gap-3 pt-6 mt-6 border-t border-border">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button 
                  onClick={salvarNovaConta} 
                  className="w-full btn-gradient"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Conta
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  onClick={cancelarNovaConta}
                  className="btn-outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de contas existentes */}
      <div className="space-y-6">
        {contas.length === 0 && !novaConta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 card-glass rounded-xl border border-dashed border-border"
          >
            <div className="p-6">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhuma conta bancária cadastrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Clique em "Adicionar Conta" para começar a cadastrar suas contas bancárias
              </p>
            </div>
          </motion.div>
        )}

        {contas.map((conta, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300 ${
              conta.principal 
                ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10' 
                : 'border-border hover:border-accent'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  className={`p-3 rounded-xl shadow-lg ${
                    conta.principal 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-primary to-secondary'
                  }`}
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                >
                  <CreditCard className="w-5 h-5 text-primary-foreground" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-foreground">
                      {conta.tipo_recebimento}
                    </h4>
                    {conta.principal && (
                      <motion.div 
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <Star className="w-3 h-3" />
                        Principal
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">
                    {getTipoDescricao(conta)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {!conta.principal && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => tornarPrincipal(index)}
                      className="btn-outline text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Principal
                    </Button>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditandoIndex(editandoIndex === index ? null : index)}
                    className="btn-outline"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removerConta(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {editandoIndex === index && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border pt-6 mt-6"
                >
                  <DadosBancariosForm
                    dadosBancarios={conta}
                    onChange={(dadosAtualizados) => atualizarConta(index, dadosAtualizados)}
                    prefixo={`conta_${index}`}
                  />
                  <div className="flex justify-end mt-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEditandoIndex(null)}
                        className="btn-outline"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Concluir Edição
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Informações de validação */}
      {contas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card-glass rounded-xl p-6 border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">
                Informações importantes:
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>A conta marcada como <strong>"Principal"</strong> será usada por padrão nos recebimentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Você pode ter múltiplas contas PIX e TED para maior flexibilidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Recomendamos ter ao menos uma conta PIX para transferências instantâneas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Todas as contas ficam ativas e disponíveis para uso nos contratos</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};