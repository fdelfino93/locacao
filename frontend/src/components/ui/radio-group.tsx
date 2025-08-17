import React from 'react';
import { cn } from '../../lib/utils';

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  value: string;
  options: RadioOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  options,
  onChange,
  className,
  disabled = false
}) => {
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {options.map((option) => (
        <label 
          key={option.value}
          className={cn(
            "flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-md border transition-all duration-300",
            "hover:border-primary/50 hover:bg-primary/5",
            value === option.value 
              ? "border-primary bg-primary/10 text-primary" 
              : "border-border bg-muted/50 text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="sr-only"
          />
          <div 
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-300",
              value === option.value
                ? "border-primary bg-primary"
                : "border-muted-foreground"
            )}
          >
            {value === option.value && (
              <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />
            )}
          </div>
          <span className="font-medium">{option.label}</span>
        </label>
      ))}
    </div>
  );
};