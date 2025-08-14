import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  Building2, 
  Hash, 
  User, 
  Key, 
  Star,
  AlertCircle,
  Edit3,
  Check,
  X
} from 'lucide-react';
import type { MetodoPagamento } from '../../types';

interface MultiplePaymentMethodsFormProps {
  metodos: MetodoPagamento[];
  onChange: (metodos: MetodoPagamento[]) => void;
}

const bancosPrincipais = [
  { value: '001', label: 'Banco do Brasil' },
  { value: '237', label: 'Bradesco' },
  { value: '104', label: 'Caixa Econômica Federal' },
  { value: '341', label: 'Itaú Unibanco' },
  { value: '033', label: 'Santander' },
  { value: '260', label: 'Nubank' },
  { value: '077', label: 'Inter' },
  { value: '212', label: 'Banco Original' },
  { value: '290', label: 'PagBank (PagSeguro)' },
  { value: '323', label: 'Mercado Pago' },
  { value: '336', label: 'C6 Bank' },
  { value: '756', label: 'Sicoob' },
  { value: '748', label: 'Sicredi' },
  { value: '422', label: 'Banco Safra' },
  { value: 'outros', label: 'Outros' }
];

const tiposPagamento = [
  { value: 'PIX', label: 'PIX', icon: '💳' },
  { value: 'TED', label: 'TED/DOC', icon: '🏦' },
  { value: 'Boleto', label: 'Boleto Bancário', icon: '📄' },
  { value: 'Transferencia', label: 'Transferência', icon: '💸' }
];

export const MultiplePaymentMethodsForm: React.FC<MultiplePaymentMethodsFormProps> = ({
  metodos,
  onChange
}) => {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novoMetodo, setNovoMetodo] = useState<Partial<MetodoPagamento> | null>(null);

  const gerarId = () => `metodo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const adicionarMetodo = () => {
    const id = gerarId();
    setNovoMetodo({
      id,
      tipo: 'PIX',
      principal: metodos.length === 0,
      ativo: true,
      observacoes: ''
    });
  };

  const salvarNovoMetodo = () => {
    if (!novoMetodo?.tipo) return;

    const metodoCompleto: MetodoPagamento = {
      id: novoMetodo.id!,
      tipo: novoMetodo.tipo,
      principal: novoMetodo.principal || false,
      ativo: novoMetodo.ativo || true,
      dados_pix: novoMetodo.dados_pix,
      dados_ted: novoMetodo.dados_ted,
      dados_boleto: novoMetodo.dados_boleto,
      observacoes: novoMetodo.observacoes || ''
    };

    // Se for o primeiro método ou marcado como principal, tornar todos os outros não principais
    let novosMetodos = [...metodos];
    if (metodoCompleto.principal) {
      novosMetodos = novosMetodos.map(m => ({ ...m, principal: false }));
    }

    onChange([...novosMetodos, metodoCompleto]);
    setNovoMetodo(null);
  };

  const cancelarNovoMetodo = () => {
    setNovoMetodo(null);
  };

  const removerMetodo = (id: string) => {
    const novosMetodos = metodos.filter(m => m.id !== id);
    
    // Se o método removido era principal e ainda há métodos, tornar o primeiro como principal
    if (novosMetodos.length > 0 && !novosMetodos.some(m => m.principal)) {
      novosMetodos[0].principal = true;
    }
    
    onChange(novosMetodos);
  };

  const tornarPrincipal = (id: string) => {
    const novosMetodos = metodos.map(m => ({
      ...m,
      principal: m.id === id
    }));
    onChange(novosMetodos);
  };

  const alternarStatus = (id: string) => {
    const novosMetodos = metodos.map(m => 
      m.id === id ? { ...m, ativo: !m.ativo } : m
    );
    onChange(novosMetodos);
  };

  const atualizarMetodo = (id: string, dadosAtualizados: Partial<MetodoPagamento>) => {
    const novosMetodos = metodos.map(m => 
      m.id === id ? { ...m, ...dadosAtualizados } : m
    );
    onChange(novosMetodos);
  };

  const formatarCPF = (cpf: string) => {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const detectarTipoChavePix = (chave: string): 'CPF' | 'Email' | 'Telefone' | 'Aleatoria' => {
    if (/^\d{11}$/.test(chave.replace(/\D/g, ''))) return 'CPF';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) return 'Email';
    if (/^\+?\d{10,15}$/.test(chave.replace(/\D/g, ''))) return 'Telefone';
    return 'Aleatoria';
  };

  const renderFormularioMetodo = (metodo: Partial<MetodoPagamento>, isNovo: boolean = false) => {
    const isPIX = metodo.tipo === 'PIX';
    const isTED = metodo.tipo === 'TED';
    const isBoleto = metodo.tipo === 'Boleto';

    const atualizarDados = (campo: string, valor: any) => {
      if (isNovo && novoMetodo) {
        setNovoMetodo(prev => ({ ...prev!, [campo]: valor }));
      } else if (metodo.id) {
        atualizarMetodo(metodo.id, { [campo]: valor });
      }
    };

    const atualizarDadosPix = (campo: string, valor: any) => {
      const novosDados = { ...(metodo.dados_pix || {}), [campo]: valor };
      atualizarDados('dados_pix', novosDados);
    };

    const atualizarDadosTed = (campo: string, valor: any) => {
      const novosDados = { ...(metodo.dados_ted || {}), [campo]: valor };
      atualizarDados('dados_ted', novosDados);
    };

    const atualizarDadosBoleto = (campo: string, valor: any) => {
      const novosDados = { ...(metodo.dados_boleto || {}), [campo]: valor };
      atualizarDados('dados_boleto', novosDados);
    };

    return (
      <div className="space-y-4">
        {/* Tipo de Pagamento */}
        <div>
          <Label>Tipo de Pagamento *</Label>
          <Select 
            value={metodo.tipo || ''} 
            onValueChange={(value) => atualizarDados('tipo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposPagamento.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  <div className="flex items-center gap-2">
                    <span>{tipo.icon}</span>
                    <span>{tipo.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campos PIX */}
        {isPIX && (
          <div className="space-y-3">
            <Label>Chave PIX *</Label>
            <InputWithIcon
              type="text"
              value={metodo.dados_pix?.chave_pix || ''}
              onChange={(e) => {
                const chave = e.target.value;
                const tipoDetectado = detectarTipoChavePix(chave);
                atualizarDadosPix('chave_pix', chave);
                atualizarDadosPix('tipo_chave', tipoDetectado);
              }}
              placeholder="CPF, Email, Telefone ou Chave Aleatória"
              icon={Key}
            />
            {metodo.dados_pix?.chave_pix && (
              <div className="text-sm text-blue-600">
                Tipo detectado: {metodo.dados_pix.tipo_chave}
              </div>
            )}
          </div>
        )}

        {/* Campos TED */}
        {isTED && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Banco *</Label>
                <Select 
                  value={metodo.dados_ted?.banco || ''} 
                  onValueChange={(value) => atualizarDadosTed('banco', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bancosPrincipais.map((banco) => (
                      <SelectItem key={banco.value} value={banco.value}>
                        {banco.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Conta *</Label>
                <Select 
                  value={metodo.dados_ted?.tipo_conta || ''} 
                  onValueChange={(value) => atualizarDadosTed('tipo_conta', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
                    <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Agência *</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_ted?.agencia || ''}
                  onChange={(e) => atualizarDadosTed('agencia', e.target.value)}
                  placeholder="0000"
                  icon={Building2}
                />
              </div>

              <div>
                <Label>Número da Conta *</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_ted?.conta || ''}
                  onChange={(e) => atualizarDadosTed('conta', e.target.value)}
                  placeholder="00000-0"
                  icon={Hash}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Titular *</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_ted?.titular || ''}
                  onChange={(e) => atualizarDadosTed('titular', e.target.value)}
                  placeholder="Nome completo"
                  icon={User}
                />
              </div>

              <div>
                <Label>CPF do Titular *</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_ted?.cpf_titular || ''}
                  onChange={(e) => {
                    const cpfFormatado = formatarCPF(e.target.value);
                    atualizarDadosTed('cpf_titular', cpfFormatado);
                  }}
                  placeholder="000.000.000-00"
                  icon={Hash}
                  maxLength={14}
                />
              </div>
            </div>
          </div>
        )}

        {/* Campos Boleto */}
        {isBoleto && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Banco *</Label>
                <Select 
                  value={metodo.dados_boleto?.banco || ''} 
                  onValueChange={(value) => atualizarDadosBoleto('banco', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {bancosPrincipais.map((banco) => (
                      <SelectItem key={banco.value} value={banco.value}>
                        {banco.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Agência *</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_boleto?.agencia || ''}
                  onChange={(e) => atualizarDadosBoleto('agencia', e.target.value)}
                  placeholder="0000"
                  icon={Building2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Conta *</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_boleto?.conta || ''}
                  onChange={(e) => atualizarDadosBoleto('conta', e.target.value)}
                  placeholder="00000-0"
                  icon={Hash}
                />
              </div>

              <div>
                <Label>Convênio</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_boleto?.convenio || ''}
                  onChange={(e) => atualizarDadosBoleto('convenio', e.target.value)}
                  placeholder="000000"
                  icon={Hash}
                />
              </div>

              <div>
                <Label>Carteira</Label>
                <InputWithIcon
                  type="text"
                  value={metodo.dados_boleto?.carteira || ''}
                  onChange={(e) => atualizarDadosBoleto('carteira', e.target.value)}
                  placeholder="18"
                  icon={Hash}
                />
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <Label>Observações</Label>
          <Textarea
            value={metodo.observacoes || ''}
            onChange={(e) => atualizarDados('observacoes', e.target.value)}
            placeholder="Informações adicionais sobre este método de pagamento..."
            rows={3}
          />
        </div>

        {/* Configurações */}
        {!isNovo && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`principal_${metodo.id}`}
                checked={metodo.principal || false}
                onCheckedChange={() => metodo.id && tornarPrincipal(metodo.id)}
              />
              <Label htmlFor={`principal_${metodo.id}`} className="text-sm">
                Método principal de recebimento
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`ativo_${metodo.id}`}
                checked={metodo.ativo || false}
                onCheckedChange={() => metodo.id && alternarStatus(metodo.id)}
              />
              <Label htmlFor={`ativo_${metodo.id}`} className="text-sm">
                Método ativo
              </Label>
            </div>
          </div>
        )}

        {/* Botões para novo método */}
        {isNovo && (
          <div className="flex gap-2 pt-4">
            <Button onClick={salvarNovoMetodo} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Salvar Método
            </Button>
            <Button variant="outline" onClick={cancelarNovoMetodo}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-green-600" />
          Métodos de Pagamento
        </h3>
        <Button onClick={adicionarMetodo} disabled={!!novoMetodo} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Método
        </Button>
      </div>

      {/* Novo método sendo adicionado */}
      <AnimatePresence>
        {novoMetodo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-dashed border-blue-300 rounded-lg p-6 bg-blue-50/50"
          >
            <h4 className="text-md font-medium text-blue-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Método de Pagamento
            </h4>
            {renderFormularioMetodo(novoMetodo, true)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de métodos existentes */}
      <div className="space-y-4">
        {metodos.length === 0 && !novoMetodo && (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum método de pagamento cadastrado</p>
            <p className="text-sm">Clique em "Adicionar Método" para começar</p>
          </div>
        )}

        {metodos.map((metodo) => (
          <motion.div
            key={metodo.id}
            layout
            className={`border rounded-lg p-4 ${
              metodo.principal ? 'border-green-300 bg-green-50/50' : 'border-gray-200'
            } ${!metodo.ativo ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  metodo.principal ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-4 h-4 ${
                    metodo.principal ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {tiposPagamento.find(t => t.value === metodo.tipo)?.label || metodo.tipo}
                    </h4>
                    {metodo.principal && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <Star className="w-3 h-3" />
                        Principal
                      </div>
                    )}
                    {!metodo.ativo && (
                      <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        Inativo
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metodo.tipo === 'PIX' && metodo.dados_pix?.chave_pix && (
                      `PIX: ${metodo.dados_pix.chave_pix}`
                    )}
                    {metodo.tipo === 'TED' && metodo.dados_ted?.banco && (
                      `${bancosPrincipais.find(b => b.value === metodo.dados_ted?.banco)?.label || metodo.dados_ted.banco} - Ag: ${metodo.dados_ted.agencia} Conta: ${metodo.dados_ted.conta}`
                    )}
                    {metodo.tipo === 'Boleto' && metodo.dados_boleto?.banco && (
                      `Boleto ${bancosPrincipais.find(b => b.value === metodo.dados_boleto?.banco)?.label || metodo.dados_boleto.banco}`
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditandoId(editandoId === metodo.id ? null : metodo.id)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removerMetodo(metodo.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {editandoId === metodo.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4 mt-4"
                >
                  {renderFormularioMetodo(metodo)}
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditandoId(null)}
                    >
                      Concluir Edição
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Informações de validação */}
      {metodos.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Informações importantes:</strong>
              <ul className="mt-2 space-y-1">
                <li>• O método marcado como "Principal" será usado por padrão</li>
                <li>• Você pode ter múltiplos métodos ativos simultaneamente</li>
                <li>• Métodos inativos ficam salvos mas não aparecerão nas opções</li>
                <li>• É recomendado ter ao menos um método PIX para transferências rápidas</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};