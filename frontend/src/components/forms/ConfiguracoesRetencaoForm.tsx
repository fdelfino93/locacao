import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Settings, Percent, DollarSign, CreditCard, Building, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import type { ConfiguracaoRetencoes } from '../../types/PrestacaoContas';

interface ConfiguracoesRetencaoFormProps {
  configuracao: ConfiguracaoRetencoes;
  onConfigChange: (config: ConfiguracaoRetencoes) => void;
  onSave: () => void;
  className?: string;
}

export const ConfiguracoesRetencaoForm: React.FC<ConfiguracoesRetencaoFormProps> = ({
  configuracao,
  onConfigChange,
  onSave,
  className = ""
}) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    } finally {
      setSaving(false);
    }
  };

  const calcularExemplo = (valorBoleto: number) => {
    const taxaAdmin = valorBoleto * (configuracao.percentual_admin / 100);
    const taxaBoleto = configuracao.taxa_boleto;
    const taxaTransferencia = configuracao.taxa_transferencia;
    const totalRetido = taxaAdmin + taxaBoleto + taxaTransferencia;
    const valorLiquido = valorBoleto - totalRetido;

    return {
      taxaAdmin,
      taxaBoleto,
      taxaTransferencia,
      totalRetido,
      valorLiquido
    };
  };

  const exemplo = calcularExemplo(1500); // Exemplo com boleto de R$ 1500

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span>Configurações de Retenção</span>
              {configuracao.ativo && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge>
              )}
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Configurações */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-foreground mb-4">Parâmetros de Retenção</h4>
              
              <div className="space-y-4">
                <div>
                  <Label>Taxa de Administração (%)</Label>
                  <InputWithIcon
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    icon={Percent}
                    value={configuracao.percentual_admin}
                    onChange={(e) => onConfigChange({
                      ...configuracao,
                      percentual_admin: Number(e.target.value) || 0
                    })}
                    placeholder="10.0"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percentual retido sobre o valor total do boleto
                  </p>
                </div>

                <div>
                  <Label>Taxa de Registro de Boleto (R$)</Label>
                  <InputWithIcon
                    type="number"
                    step="0.01"
                    min="0"
                    icon={DollarSign}
                    value={configuracao.taxa_boleto}
                    onChange={(e) => onConfigChange({
                      ...configuracao,
                      taxa_boleto: Number(e.target.value) || 0
                    })}
                    placeholder="0.00"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Taxa de boleto foi removida (manter em 0.00)
                  </p>
                </div>

                <div>
                  <Label>Taxa de Transferência por Proprietário (R$)</Label>
                  <InputWithIcon
                    type="number"
                    step="0.01"
                    min="0"
                    icon={CreditCard}
                    value={configuracao.taxa_transferencia}
                    onChange={(e) => onConfigChange({
                      ...configuracao,
                      taxa_transferencia: Number(e.target.value) || 0
                    })}
                    placeholder="10.00"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Valor cobrado por transferência bancária/PIX realizada
                  </p>
                </div>
              </div>

              {/* Status da Configuração */}
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Status da Configuração
                  </span>
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  <p>• Configuração {configuracao.ativo ? 'ativa' : 'inativa'}</p>
                  <p>• Última atualização: {new Date().toLocaleString('pt-BR')}</p>
                  <p>• Aplicada automaticamente em todas as prestações</p>
                </div>
              </div>
            </div>

            {/* Simulação */}
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-foreground mb-4">Simulação de Cálculo</h4>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    Exemplo: Boleto de R$ 1.500,00
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-600 dark:text-blue-400">Valor do Boleto:</span>
                    <span className="font-medium">R$ 1.500,00</span>
                  </div>

                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa Admin ({configuracao.percentual_admin}%):</span>
                      <span className="font-medium text-red-600">
                        -R$ {exemplo.taxaAdmin.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa Boleto:</span>
                      <span className="font-medium text-red-600">
                        -R$ {exemplo.taxaBoleto.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa Transferência:</span>
                      <span className="font-medium text-red-600">
                        -R$ {exemplo.taxaTransferencia.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-700 dark:text-blue-300">Total Retido:</span>
                      <span className="text-red-600">
                        R$ {exemplo.totalRetido.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-blue-700 dark:text-blue-300">Valor Líquido:</span>
                      <span className="text-green-600">
                        R$ {exemplo.valorLiquido.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p><strong>Margem Efetiva:</strong> {((exemplo.totalRetido / 1500) * 100).toFixed(2)}%</p>
                    <p><strong>Repasse:</strong> {((exemplo.valorLiquido / 1500) * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              <div className="space-y-3">
                {configuracao.percentual_admin > 15 && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium">Taxa de administração alta</p>
                      <p>Considere revisar o percentual para manter competitividade</p>
                    </div>
                  </div>
                )}

                {configuracao.taxa_transferencia > 15 && (
                  <div className="flex items-start space-x-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-700 dark:text-orange-300">
                      <p className="font-medium">Taxa de transferência elevada</p>
                      <p>Valor acima da média do mercado</p>
                    </div>
                  </div>
                )}

                {exemplo.totalRetido < 50 && (
                  <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-700 dark:text-green-300">
                      <p className="font-medium">Configuração competitiva</p>
                      <p>Taxas dentro da média do mercado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesRetencaoForm;