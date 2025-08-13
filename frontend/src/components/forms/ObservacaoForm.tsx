import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  MessageSquare,
  Save,
  X
} from 'lucide-react';

interface ObservacaoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (observacao: string) => void;
  observacaoAtual?: string;
  titulo?: string;
}

export const ObservacaoForm: React.FC<ObservacaoFormProps> = ({
  isOpen,
  onClose,
  onSave,
  observacaoAtual = '',
  titulo = 'Adicionar Observação'
}) => {
  const [observacao, setObservacao] = useState(observacaoAtual);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(observacao);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setObservacao(observacaoAtual);
    onClose();
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
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
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
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite sua observação..."
              rows={4}
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
              disabled={loading}
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