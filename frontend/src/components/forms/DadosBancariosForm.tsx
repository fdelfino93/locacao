import React from 'react';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CreditCard, Building2, Hash, User, Key } from 'lucide-react';
import type { DadosBancarios } from '../../types';

interface DadosBancariosFormProps {
  dadosBancarios: DadosBancarios;
  onChange: (dados: DadosBancarios) => void;
  prefixo?: string;
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

export const DadosBancariosForm: React.FC<DadosBancariosFormProps> = ({ 
  dadosBancarios, 
  onChange, 
  prefixo = '' 
}) => {
  
  const handleChange = (field: keyof DadosBancarios, value: any) => {
    onChange({
      ...dadosBancarios,
      [field]: value
    });
  };

  const isPIX = dadosBancarios.tipo_recebimento === 'PIX';
  const isContaBancaria = ['Conta Corrente', 'Conta Poupança'].includes(dadosBancarios.tipo_recebimento);

  const formatarCPF = (cpf: string) => {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validarChavePIX = (chave: string) => {
    // Validação básica para diferentes tipos de chave PIX
    if (!chave) return true;
    
    // CPF/CNPJ (só números)
    if (/^\d{11}$|^\d{14}$/.test(chave.replace(/\D/g, ''))) return true;
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave)) return true;
    
    // Telefone
    if (/^\+?\d{10,15}$/.test(chave.replace(/\D/g, ''))) return true;
    
    // Chave aleatória (UUID)
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chave)) return true;
    
    return false;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-green-600" />
        {prefixo ? `${prefixo} - ` : ''}Dados Bancários
      </h3>

      {/* Tipo de Recebimento */}
      <div>
        <Label htmlFor={`${prefixo}tipo_recebimento`}>Forma de Recebimento *</Label>
        <Select 
          value={dadosBancarios.tipo_recebimento} 
          onValueChange={(value) => handleChange('tipo_recebimento', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a forma de recebimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="TED">TED</SelectItem>
            <SelectItem value="Conta Corrente">Conta Corrente</SelectItem>
            <SelectItem value="Conta Poupança">Conta Poupança</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campos PIX */}
      {isPIX && (
        <div>
          <Label htmlFor={`${prefixo}chave_pix`}>Chave PIX *</Label>
          <InputWithIcon
            id={`${prefixo}chave_pix`}
            type="text"
            value={dadosBancarios.chave_pix || ''}
            onChange={(e) => handleChange('chave_pix', e.target.value)}
            placeholder="CPF, Email, Telefone ou Chave Aleatória"
            icon={Key}
            required={isPIX}
          />
          {dadosBancarios.chave_pix && !validarChavePIX(dadosBancarios.chave_pix) && (
            <p className="text-sm text-red-600 mt-1">
              Chave PIX inválida. Use CPF, email, telefone ou chave aleatória.
            </p>
          )}
        </div>
      )}

      {/* Campos Conta Bancária */}
      {isContaBancaria && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banco */}
            <div>
              <Label htmlFor={`${prefixo}banco`}>Banco *</Label>
              <Select 
                value={dadosBancarios.banco || ''} 
                onValueChange={(value) => handleChange('banco', value)}
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

            {/* Tipo de Conta */}
            <div>
              <Label htmlFor={`${prefixo}tipo_conta`}>Tipo de Conta *</Label>
              <Select 
                value={dadosBancarios.tipo_conta || ''} 
                onValueChange={(value) => handleChange('tipo_conta', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corrente">Conta Corrente</SelectItem>
                  <SelectItem value="Poupança">Conta Poupança</SelectItem>
                  <SelectItem value="Conta Digital">Conta Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agência */}
            <div>
              <Label htmlFor={`${prefixo}agencia`}>Agência *</Label>
              <InputWithIcon
                id={`${prefixo}agencia`}
                type="text"
                value={dadosBancarios.agencia || ''}
                onChange={(e) => handleChange('agencia', e.target.value)}
                placeholder="0000"
                icon={Building2}
                required={isContaBancaria}
              />
            </div>

            {/* Conta */}
            <div>
              <Label htmlFor={`${prefixo}conta`}>Número da Conta *</Label>
              <InputWithIcon
                id={`${prefixo}conta`}
                type="text"
                value={dadosBancarios.conta || ''}
                onChange={(e) => handleChange('conta', e.target.value)}
                placeholder="00000-0"
                icon={Hash}
                required={isContaBancaria}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Titular */}
            <div>
              <Label htmlFor={`${prefixo}titular`}>Nome do Titular *</Label>
              <InputWithIcon
                id={`${prefixo}titular`}
                type="text"
                value={dadosBancarios.titular || ''}
                onChange={(e) => handleChange('titular', e.target.value)}
                placeholder="Nome completo"
                icon={User}
                required={isContaBancaria}
              />
            </div>

            {/* CPF do Titular */}
            <div>
              <Label htmlFor={`${prefixo}cpf_titular`}>CPF do Titular *</Label>
              <InputWithIcon
                id={`${prefixo}cpf_titular`}
                type="text"
                value={dadosBancarios.cpf_titular || ''}
                onChange={(e) => {
                  const cpfFormatado = formatarCPF(e.target.value);
                  handleChange('cpf_titular', cpfFormatado);
                }}
                placeholder="000.000.000-00"
                icon={Hash}
                maxLength={14}
                required={isContaBancaria}
              />
            </div>
          </div>
        </>
      )}

      {/* Informações de validação */}
      {dadosBancarios.tipo_recebimento && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Informações sobre {dadosBancarios.tipo_recebimento}:</strong>
            {isPIX && (
              <ul className="mt-2 space-y-1">
                <li>• Chave PIX pode ser CPF, email, telefone ou chave aleatória</li>
                <li>• Transferências instantâneas 24h por dia</li>
                <li>• Sem taxas para pessoa física</li>
              </ul>
            )}
            {isContaBancaria && (
              <ul className="mt-2 space-y-1">
                <li>• Verifique se os dados estão corretos</li>
                <li>• Transferências podem ter taxas dependendo do banco</li>
                <li>• Horário comercial para processamento</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};