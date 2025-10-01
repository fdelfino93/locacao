import React from 'react';

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
      maximumFractionDigits: 2,
      useGrouping: true
    });
  };

  const parseCurrency = (str: string): number => {
    // Remove tudo exceto números, vírgulas e pontos
    let cleaned = str.replace(/[^\d,.-]/g, '');

    // Handle Brazilian number format (1.234.567,89)
    // If there are multiple dots and one comma, dots are thousands separators
    const dotCount = (cleaned.match(/\./g) || []).length;
    const commaCount = (cleaned.match(/,/g) || []).length;

    if (dotCount > 0 && commaCount > 0) {
      // Remove dots (thousands separators) and replace comma with dot
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (commaCount === 1 && dotCount === 0) {
      // Only comma present, treat as decimal separator
      cleaned = cleaned.replace(',', '.');
    } else if (dotCount === 1 && commaCount === 0) {
      // Only dot present, could be thousands or decimal
      // If 3 digits after dot, it's thousands separator
      const parts = cleaned.split('.');
      if (parts[1] && parts[1].length === 3 && parts[1].match(/^\d{3}$/)) {
        // Likely thousands separator, remove it
        cleaned = parts.join('');
      }
      // Otherwise treat as decimal separator
    }

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrency(inputValue);
    onChange(numericValue);
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10 text-sm font-medium">
        R$
      </div>
      <input
        id={id}
        type="text"
        value={formatCurrency(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-input bg-background pl-12 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};