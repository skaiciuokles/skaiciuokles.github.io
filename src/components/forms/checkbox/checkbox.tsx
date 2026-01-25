import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function Checkbox({ label, className, onChange, id: providedId, ...rest }: CheckboxProps) {
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked, e);
    },
    [onChange],
  );

  return (
    <div className={cn('flex items-center', className)}>
      <input id={id} type="checkbox" onChange={handleChange} className="size-4 cursor-pointer" {...rest} />
      {label && (
        <Label htmlFor={id} className="cursor-pointer font-medium select-none pl-1">
          {label}
        </Label>
      )}
    </div>
  );
}

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'type' | 'value'
> {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
}
