import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: string;
  onValueChange?: (value: string) => void;
}

const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, mask, onValueChange, onChange, value, ...props }, ref) => {
    const applyMask = (value: string, maskPattern: string) => {
      const cleanValue = value.replace(/\D/g, '');
      let maskedValue = '';
      let cleanIndex = 0;

      for (let i = 0; i < maskPattern.length && cleanIndex < cleanValue.length; i++) {
        if (maskPattern[i] === '#') {
          maskedValue += cleanValue[cleanIndex];
          cleanIndex++;
        } else {
          maskedValue += maskPattern[i];
        }
      }

      return maskedValue;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const maskedValue = applyMask(e.target.value, mask);
      e.target.value = maskedValue;
      
      if (onValueChange) {
        onValueChange(maskedValue);
      }
      
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        className={cn(
          "flex h-12 w-full rounded-lg border-2 border-border bg-input px-4 py-3 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ease-out hover:border-border-strong shadow-sm backdrop-blur-sm",
          className
        )}
        ref={ref}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

InputMask.displayName = "InputMask";

export { InputMask };