import React from 'react';
import { InputWithIcon } from './input-with-icon';
import { DollarSign } from 'lucide-react';

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "0,00",
  required = false,
  className = "",
  disabled = false
}) => {
  const formatCurrency = (num: number): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrency = (str: string): number => {
    // Remove tudo exceto números, vírgulas e pontos
    const cleaned = str.replace(/[^\d,.-]/g, '');
    
    // Substitui vírgula por ponto para parsing
    const normalized = cleaned.replace(',', '.');
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10">
        R$
      </div>
      <InputWithIcon
        id={id}
        type="text"
        value={formatCurrency(value)}
        onChange={handleChange}
        placeholder={placeholder}
        icon={DollarSign}
        className={`pl-12 ${className}`}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};