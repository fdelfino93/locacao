import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  DollarSign,
  Save,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface LancamentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tipo: 'lancamento' | 'desconto', dados: { tipo: string; valor: number }) => void;
  tipoOperacao: 'lancamento' | 'desconto';
  pagamentoId: number;
}

export const LancamentoForm: React.FC<LancamentoFormProps> = ({
  isOpen,
  onClose,
  onSave,
  tipoOperacao,
  pagamentoId
}) => {
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);

  const tiposLancamento = [
    '[L] Gás',
    '[L] Energia',
    '[L] Água',
    '[L] Internet',
    '[L] Manutenção',
    '[L] Limpeza',
    '[L] Outros'
  ];

  const tiposDesconto = [
    '[D] Taxa de Incêndio',
    '[D] Taxa de Locação',
    '[D] Taxa Administrativa',
    '[D] Multa',
    '[D] Juros',
    '[D] Desconto Especial',
    '[D] Outros'
  ];

  const opcoesTipo = tipoOperacao === 'lancamento' ? tiposLancamento : tiposDesconto;

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!tipo || !valor) {
      return;
    }

    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico)) {
      return;
    }

    setLoading(true);
    try {
      await onSave(tipoOperacao, { tipo, valor: valorNumerico });
      setTipo('');
      setValor('');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTipo('');
    setValor('');
    onClose();
  };

  const formatarValor = (value: string) => {
    // Remove caracteres não numéricos exceto vírgula e ponto
    const numeroLimpo = value.replace(/[^\d,\.]/g, '');
    return numeroLimpo;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {tipoOperacao === 'lancamento' ? (
              <Plus className="w-5 h-5 text-green-600" />
            ) : (
              <Minus className="w-5 h-5 text-red-600" />
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {tipoOperacao === 'lancamento' ? 'Adicionar Lançamento Líquido' : 'Adicionar Desconto/Dedução'}
            </h3>
          </div>
          <Button
            onClick={handleClose}
            variant="outline"
            size="sm"
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tipo">
              Tipo de {tipoOperacao === 'lancamento' ? 'Lançamento' : 'Desconto'}
            </Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder={`Selecione o tipo de ${tipoOperacao}`} />
              </SelectTrigger>
              <SelectContent>
                {opcoesTipo.map((opcao) => (
                  <SelectItem key={opcao} value={opcao}>
                    {opcao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$)</Label>
            <InputWithIcon
              id="valor"
              type="text"
              value={valor}
              onChange={(e) => setValor(formatarValor(e.target.value))}
              placeholder="0,00"
              icon={DollarSign}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !tipo || !valor}
              className={tipoOperacao === 'lancamento' ? 'btn-primary' : 'btn bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};