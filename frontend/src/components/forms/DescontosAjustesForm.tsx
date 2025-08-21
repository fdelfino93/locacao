import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CurrencyInput } from '../ui/currency-input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { TrendingDown, Plus, Minus, Target, Wrench, DollarSign, Building, FileText, Scale } from 'lucide-react';

export interface DescontoAjuste {
  id?: string;
  tipo: string;
  label: string;
  valor: number;
  icon?: string;
}

interface DescontosAjustesFormProps {
  descontos: DescontoAjuste[];
  onDescontosChange: (descontos: DescontoAjuste[]) => void;
  className?: string;
}

export const DescontosAjustesForm: React.FC<DescontosAjustesFormProps> = ({
  descontos,
  onDescontosChange,
  className = ""
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [novoDesconto, setNovoDesconto] = useState<DescontoAjuste>({
    tipo: '',
    label: '',
    valor: 0
  });

  // Configuração dos tipos de descontos disponíveis
  const tiposDescontos = [
    { 
      tipo: 'desconto_pontualidade', 
      label: 'Desconto Pontualidade', 
      icon: Target,
      description: 'Desconto por pagamento pontual' 
    },
    { 
      tipo: 'desconto_benfeitoria', 
      label: 'Desconto Benfeitoria', 
      icon: Wrench,
      description: 'Desconto por benfeitorias realizadas' 
    },
    { 
      tipo: 'reembolso_fundo_obras', 
      label: 'Reembolso Fundo de Obras', 
      icon: Building,
      description: 'Reembolso de fundo para obras' 
    },
    { 
      tipo: 'fundo_reserva', 
      label: 'Fundo de Reserva', 
      icon: DollarSign,
      description: 'Fundo de reserva para emergências' 
    },
    { 
      tipo: 'fundo_iptu', 
      label: 'Fundo IPTU', 
      icon: FileText,
      description: 'Fundo para pagamento de IPTU' 
    },
    { 
      tipo: 'fundo_outros', 
      label: 'Fundo Outros', 
      icon: DollarSign,
      description: 'Outros fundos diversos' 
    },
    { 
      tipo: 'honorario_advogados', 
      label: 'Honorário Advogados', 
      icon: Scale,
      description: 'Honorários de serviços advocatícios' 
    },
    { 
      tipo: 'boleto_advogados', 
      label: 'Boleto Advogados', 
      icon: FileText,
      description: 'Taxa de boleto para advogados' 
    }
  ];

  const adicionarDesconto = () => {
    if (!novoDesconto.tipo || novoDesconto.valor <= 0) return;

    const tipoConfig = tiposDescontos.find(t => t.tipo === novoDesconto.tipo);
    if (!tipoConfig) return;

    const novoId = Date.now().toString();
    const descontoCompleto: DescontoAjuste = {
      id: novoId,
      tipo: novoDesconto.tipo,
      label: novoDesconto.label || tipoConfig.label,
      valor: novoDesconto.valor,
      icon: tipoConfig.icon.name
    };

    // Para benfeitorias, permitir múltiplos
    if (novoDesconto.tipo === 'desconto_benfeitoria') {
      const benfeitorias = descontos.filter(d => d.tipo === 'desconto_benfeitoria').length;
      descontoCompleto.label = `Desconto Benfeitoria ${benfeitorias + 1}`;
    }

    const novosDescontos = [...descontos, descontoCompleto];
    onDescontosChange(novosDescontos);

    // Reset form
    setNovoDesconto({ tipo: '', label: '', valor: 0 });
    setShowAddForm(false);
  };

  const removerDesconto = (id: string) => {
    const novosDescontos = descontos.filter(d => d.id !== id);
    
    // Reorganizar benfeitorias
    const benfeitorias = novosDescontos.filter(d => d.tipo === 'desconto_benfeitoria');
    benfeitorias.forEach((benfeitoria, index) => {
      benfeitoria.label = `Desconto Benfeitoria ${index + 1}`;
    });

    onDescontosChange(novosDescontos);
  };

  const atualizarValorDesconto = (id: string, novoValor: number) => {
    const novosDescontos = descontos.map(d => 
      d.id === id ? { ...d, valor: novoValor } : d
    );
    onDescontosChange(novosDescontos);
  };

  const totalDescontos = descontos.reduce((total, desc) => total + desc.valor, 0);

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'Target': return Target;
      case 'Wrench': return Wrench;
      case 'Building': return Building;
      case 'DollarSign': return DollarSign;
      case 'FileText': return FileText;
      case 'Scale': return Scale;
      default: return TrendingDown;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span>Descontos e Ajustes</span>
              {descontos.length > 0 && (
                <Badge variant="secondary">{descontos.length} item(s)</Badge>
              )}
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Lista de Descontos Ativos */}
          {descontos.length > 0 && (
            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {descontos.map((desconto) => {
                  const IconComponent = getIconComponent(desconto.icon);
                  return (
                    <motion.div
                      key={desconto.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-between p-4 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="font-medium text-foreground">{desconto.label}</span>
                          <p className="text-xs text-muted-foreground">{desconto.tipo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-32">
                          <CurrencyInput
                            value={desconto.valor}
                            onChange={(valor) => atualizarValorDesconto(desconto.id!, valor)}
                            placeholder="R$ 0,00"
                            className="text-right"
                          />
                        </div>
                        <Button
                          onClick={() => removerDesconto(desconto.id!)}
                          size="sm"
                          variant="destructive"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center p-4 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                  <span className="text-lg font-medium text-foreground">Total de Descontos</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    -R$ {totalDescontos.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Formulário para Adicionar Desconto */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-6"
              >
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Desconto/Ajuste</Label>
                    <select
                      value={novoDesconto.tipo}
                      onChange={(e) => setNovoDesconto({ ...novoDesconto, tipo: e.target.value })}
                      className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposDescontos.map((tipo) => (
                        <option key={tipo.tipo} value={tipo.tipo}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    {novoDesconto.tipo && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {tiposDescontos.find(t => t.tipo === novoDesconto.tipo)?.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Valor do Desconto</Label>
                    <CurrencyInput
                      value={novoDesconto.valor}
                      onChange={(valor) => setNovoDesconto({ ...novoDesconto, valor })}
                      placeholder="R$ 0,00"
                      className="mt-2"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={adicionarDesconto}
                      disabled={!novoDesconto.tipo || novoDesconto.valor <= 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Desconto
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setNovoDesconto({ tipo: '', label: '', valor: 0 });
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensagem quando não há descontos */}
          {descontos.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum desconto ou ajuste aplicado</p>
              <p className="text-xs">Clique em "Adicionar" para incluir descontos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DescontosAjustesForm;